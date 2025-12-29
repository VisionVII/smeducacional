import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const querySchema = z.object({
  position: z.enum([
    'HERO_BANNER',
    'SIDEBAR_TOP',
    'SIDEBAR_MIDDLE',
    'GRID_FEATURED_1',
    'GRID_FEATURED_2',
    'GRID_FEATURED_3',
  ]),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1).max(10)),
});

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rate = await checkRateLimit(ip, { limit: 60, windowSeconds: 60 });
    if (!rate.success) {
      const retryAfter = Math.max(
        0,
        Math.ceil((rate.resetTime - Date.now()) / 1000)
      );
      return NextResponse.json(
        { error: `Muitas requisições. Tente em ${retryAfter}s` },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const result = querySchema.safeParse({
      position: searchParams.get('position'),
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { position, limit } = result.data;
    const now = new Date();

    const ads = await prisma.advertisement.findMany({
      where: {
        slotPosition: position,
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      select: {
        id: true,
        slotPosition: true,
        priority: true,
        startDate: true,
        endDate: true,
        clicks: true,
        impressions: true,
        conversions: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            compareAtPrice: true,
            isPaid: true,
            isPublished: true,
          },
        },
      },
    });

    return NextResponse.json({ data: ads });
  } catch (error) {
    console.error('[API /api/ads/active GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar anúncios ativos' },
      { status: 500 }
    );
  }
}
