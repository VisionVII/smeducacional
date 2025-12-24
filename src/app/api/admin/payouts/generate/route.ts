import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const schema = z.object({
  teacherId: z.string().min(1).optional(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  sharePercent: z.number().min(0).max(1).default(0.7),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { teacherId, periodStart, periodEnd, sharePercent } = parsed.data;
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    // Encontrar pagamentos COMPLETED dentro do período e somar por professor
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
        course: teacherId ? { instructorId: teacherId } : { isPublished: true },
      },
      select: {
        amount: true,
        course: { select: { instructorId: true } },
      },
    });

    if (payments.length === 0) {
      return NextResponse.json({
        data: [],
        message: 'Sem pagamentos no período',
      });
    }

    const totals = new Map<string, number>();
    for (const p of payments) {
      const tId = p.course?.instructorId;
      if (!tId) continue;
      totals.set(tId, (totals.get(tId) ?? 0) + p.amount);
    }

    const payoutsToCreate = [] as Array<{ teacherId: string; amount: number }>;
    for (const [tId, total] of totals.entries()) {
      const amount = Number((total * sharePercent).toFixed(2));
      payoutsToCreate.push({ teacherId: tId, amount });
    }

    const created = await prisma.$transaction(
      payoutsToCreate.map((p) =>
        prisma.payout.create({
          data: {
            teacherId: p.teacherId,
            amount: p.amount,
            periodStart: start,
            periodEnd: end,
            status: 'pending',
          },
        })
      )
    );

    return NextResponse.json({ data: created });
  } catch (error) {
    console.error('[API /admin/payouts/generate]', error);
    return NextResponse.json(
      { error: 'Erro ao gerar payouts' },
      { status: 500 }
    );
  }
}
