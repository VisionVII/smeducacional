import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/teacher/earnings
 * Retorna dados de ganhos do professor
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== 'TEACHER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const teacherId = (session.user as any).id;

    // Buscar pagamentos de cursos do professor
    const payments = await prisma.payment.findMany({
      where: {
        course: {
          instructorId: teacherId,
        },
        status: 'COMPLETED',
        type: 'course',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const teacherFinancial = await prisma.teacherFinancial.findUnique({
      where: { userId: teacherId },
    });

    const plan = teacherFinancial?.plan?.toLowerCase() ?? 'free';
    const commissionRate = plan === 'free' ? 0.15 : 0;
    const revenueShare = 1 - commissionRate;
    const net = (value: number | null | undefined) =>
      (value || 0) * revenueShare;

    // Calcular métricas
    const totalEarnings = payments.reduce((sum, p) => sum + net(p.amount), 0);
    const grossEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Buscar todas as transações para histórico
    const allPayments = await prisma.payment.findMany({
      where: {
        course: {
          instructorId: teacherId,
        },
        status: 'COMPLETED',
      },
      select: {
        id: true,
        amount: true,
        type: true,
        createdAt: true,
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyEarnings = payments
      .filter((p) => p.createdAt >= thirtyDaysAgo)
      .reduce((sum, p) => sum + net(p.amount), 0);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Saldo pendente (últimos 14 dias - hold de chargeback)
    const pendingAmount = payments
      .filter((p) => p.createdAt > fourteenDaysAgo)
      .reduce((sum, p) => sum + net(p.amount), 0);

    // Saldo disponível (mais de 14 dias)
    const availableAmount = payments
      .filter((p) => p.createdAt <= fourteenDaysAgo)
      .reduce((sum, p) => sum + net(p.amount), 0);

    // Total de vendas
    const totalSales = payments.length;

    // Top 5 cursos mais vendidos
    const courseRevenue: Record<
      string,
      { title: string; revenue: number; sales: number }
    > = {};

    payments.forEach((payment) => {
      if (payment.course) {
        const courseId = payment.course.id;
        if (!courseRevenue[courseId]) {
          courseRevenue[courseId] = {
            title: payment.course.title,
            revenue: 0,
            sales: 0,
          };
        }
        courseRevenue[courseId].revenue += net(payment.amount);
        courseRevenue[courseId].sales += 1;
      }
    });

    const topCourses = Object.values(courseRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Últimas transações com mais detalhes
    const recentTransactions = allPayments.slice(0, 20).map((p) => ({
      id: p.id,
      amount: net(p.amount),
      type: p.type,
      courseTitle: p.course?.title || 'Assinatura',
      date: p.createdAt,
    }));

    return NextResponse.json({
      plan,
      commissionRate,
      grossEarnings,
      totalEarnings,
      monthlyEarnings,
      pendingAmount,
      availableAmount,
      totalSales,
      topCourses,
      recentTransactions,
      connectStatus: {
        isActive: teacherFinancial?.connectOnboardingComplete || false,
        accountId: teacherFinancial?.stripeConnectAccountId || null,
        totalTransfers: (teacherFinancial as any)?.totalTransfers || 0,
        totalEarningsOnFile: (teacherFinancial as any)?.totalEarnings || 0,
        pendingBalance: (teacherFinancial as any)?.pendingBalance || 0,
      },
    });
  } catch (error) {
    console.error('[teacher/earnings] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ganhos' },
      { status: 500 }
    );
  }
}
