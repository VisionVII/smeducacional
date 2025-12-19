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

    // Busca novos usuários dos últimos 7 dias
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const userData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        return {
          date: date.toISOString(),
          value: count,
        };
      })
    );

    return NextResponse.json(userData);
  } catch (error) {
    console.error('[USER_GROWTH_CHART_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de crescimento de usuários' },
      { status: 500 }
    );
  }
}
