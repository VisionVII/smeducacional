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
        status: 'completed',
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

    // Calcular métricas
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount * 0.7, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyEarnings = payments
      .filter((p) => p.createdAt >= thirtyDaysAgo)
      .reduce((sum, p) => sum + p.amount * 0.7, 0);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Saldo pendente (últimos 14 dias - hold de chargeback)
    const pendingAmount = payments
      .filter((p) => p.createdAt > fourteenDaysAgo)
      .reduce((sum, p) => sum + p.amount * 0.7, 0);

    // Saldo disponível (mais de 14 dias)
    const availableAmount = payments
      .filter((p) => p.createdAt <= fourteenDaysAgo)
      .reduce((sum, p) => sum + p.amount * 0.7, 0);

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
        courseRevenue[courseId].revenue += payment.amount * 0.7;
        courseRevenue[courseId].sales += 1;
      }
    });

    const topCourses = Object.values(courseRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      totalEarnings,
      monthlyEarnings,
      pendingAmount,
      availableAmount,
      totalSales,
      topCourses,
    });
  } catch (error) {
    console.error('[teacher/earnings] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ganhos' },
      { status: 500 }
    );
  }
}
