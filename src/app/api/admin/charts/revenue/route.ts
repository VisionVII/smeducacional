import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { subDays } from 'date-fns';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca receita dos últimos 7 dias
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const revenueData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const result = await prisma.payment.aggregate({
          where: {
            status: 'completed',
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
          _sum: {
            amount: true,
          },
        });

        return {
          date: date.toISOString(),
          value: Number(result._sum.amount || 0) / 100, // Converte centavos para reais
        };
      })
    );

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('[REVENUE_CHART_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de receita' },
      { status: 500 }
    );
  }
}
