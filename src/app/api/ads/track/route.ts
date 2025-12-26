import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const bodySchema = z.object({
  adId: z.string().min(1),
  type: z.enum(['impression', 'click']),
  path: z.string().optional(),
  position: z
    .enum([
      'HERO_BANNER',
      'SIDEBAR_TOP',
      'SIDEBAR_MIDDLE',
      'GRID_FEATURED_1',
      'GRID_FEATURED_2',
      'GRID_FEATURED_3',
    ])
    .optional(),
});

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting para endpoint público
    const ip = getClientIP(req);
    const rate = await checkRateLimit(ip, { limit: 120, windowSeconds: 60 });
    if (!rate.success) {
      const retryAfter = Math.max(
        0,
        Math.ceil((rate.resetTime - Date.now()) / 1000)
      );
      return NextResponse.json(
        { error: `Muitas tentativas. Tente em ${retryAfter}s` },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { adId, type } = parsed.data;
    const now = new Date();

    const ad = await prisma.advertisement.findUnique({
      where: { id: adId },
      select: { id: true, status: true, startDate: true, endDate: true },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado' },
        { status: 404 }
      );
    }

    // Apenas conta tracking se o anúncio estiver ativo e no período
    const inWindow = ad.startDate <= now && ad.endDate >= now;
    if (ad.status !== 'ACTIVE' || !inWindow) {
      return NextResponse.json({ data: { ignored: true } });
    }

    // Atualiza contadores gerais do anúncio
    if (type === 'impression') {
      await prisma.advertisement.update({
        where: { id: adId },
        data: { impressions: { increment: 1 } },
      });
    } else if (type === 'click') {
      await prisma.advertisement.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      });
    }

    // Upsert diário em AdAnalytics
    const day = startOfDay(now);
    await prisma.$transaction(async (tx) => {
      // Busca registro diário
      const existing = await tx.adAnalytics.findFirst({
        where: {
          adId,
          date: { gte: day, lt: new Date(day.getTime() + 86400000) },
        },
      });

      const dataDelta =
        type === 'impression'
          ? { impressions: { increment: 1 } }
          : { clicks: { increment: 1 } };

      if (!existing) {
        const created = await tx.adAnalytics.create({
          data: {
            adId,
            date: day,
            clicks: type === 'click' ? 1 : 0,
            impressions: type === 'impression' ? 1 : 0,
          },
        });
        const ctr =
          created.impressions > 0 ? created.clicks / created.impressions : 0;
        const conversionRate =
          created.impressions > 0
            ? created.conversions / created.impressions
            : 0;
        await tx.adAnalytics.update({
          where: { id: created.id },
          data: { ctr, conversionRate },
        });
      } else {
        const updated = await tx.adAnalytics.update({
          where: { id: existing.id },
          data: dataDelta,
        });
        const newImpr = updated.impressions + (type === 'impression' ? 1 : 0);
        const newClicks = updated.clicks + (type === 'click' ? 1 : 0);
        const ctr = newImpr > 0 ? newClicks / newImpr : 0;
        const conversionRate = newImpr > 0 ? updated.conversions / newImpr : 0;
        await tx.adAnalytics.update({
          where: { id: updated.id },
          data: { ctr, conversionRate },
        });
      }
    });

    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    console.error('[API /api/ads/track POST]', error);
    return NextResponse.json(
      { error: 'Erro ao registrar evento do anúncio' },
      { status: 500 }
    );
  }
}
