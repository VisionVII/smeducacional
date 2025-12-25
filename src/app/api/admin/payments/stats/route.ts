import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/payments/stats
 * Estatísticas de pagamentos para o dashboard
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      testRevenue,
      paymentsLast24h,
      paymentsLast7days,
      paymentsLast30days,
      testPayments,
    ] = await Promise.all([
      // Receita total (apenas produção)
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', isTest: false },
        _sum: { amount: true },
      }),
      // Receita de teste
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', isTest: true },
        _sum: { amount: true },
      }),
      // Pagamentos últimas 24h
      prisma.payment.count({
        where: { status: 'COMPLETED', createdAt: { gte: last24h } },
      }),
      // Pagamentos últimos 7 dias
      prisma.payment.count({
        where: { status: 'COMPLETED', createdAt: { gte: last7days } },
      }),
      // Pagamentos últimos 30 dias
      prisma.payment.count({
        where: { status: 'COMPLETED', createdAt: { gte: last30days } },
      }),
      // Total de pagamentos de teste
      prisma.payment.count({
        where: { status: 'COMPLETED', isTest: true },
      }),
    ]);

    return NextResponse.json({
      data: {
        totalRevenue: totalRevenue._sum.amount || 0,
        testRevenue: testRevenue._sum.amount || 0,
        paymentsLast24h,
        paymentsLast7days,
        paymentsLast30days,
        testPayments,
      },
    });
  } catch (error) {
    console.error('[API /admin/payments/stats GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
