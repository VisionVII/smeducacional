import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/stats
 * Retorna estatísticas gerais do sistema para dashboard admin
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar estatísticas em paralelo
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      newUsersLast30Days,
      newEnrollmentsLast7Days,
    ] = await Promise.all([
      // Total de usuários
      prisma.user.count(),

      // Total de cursos publicados
      prisma.course.count({
        where: { published: true },
      }),

      // Total de matrículas
      prisma.enrollment.count(),

      // Receita total (soma de todos os payments com status COMPLETED)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
        },
      }),

      // Novos usuários nos últimos 30 dias
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Novas matrículas nos últimos 7 dias
      prisma.enrollment.count({
        where: {
          enrolledAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const stats = {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue._sum.amount || 0,
      newUsersLast30Days,
      newEnrollmentsLast7Days,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[admin][stats] Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
