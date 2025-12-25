import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/payments/recent
 * Busca pagamentos recentes para o dashboard admin
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar últimos 10 pagamentos
    const payments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: {
        status: 'COMPLETED', // Apenas pagamentos confirmados
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        type: true,
        paymentMethod: true,
        isTest: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error('[API /admin/payments/recent GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pagamentos' },
      { status: 500 }
    );
  }
}
