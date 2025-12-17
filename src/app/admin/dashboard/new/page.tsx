import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserPlus,
  BookPlus,
} from 'lucide-react';
import { DashboardGrid } from '@/components/admin/dashboard-grid';
import { StatCard } from '@/components/admin/stat-card';
import { DashboardCard } from '@/components/admin/dashboard-card';
import { RecentActivity } from '@/components/admin/recent-activity';
import {
  AreaChartComponent,
  BarChartComponent,
  LineChartComponent,
} from '@/components/admin/chart-components';
import { format, subDays } from 'date-fns';

export const metadata: Metadata = {
  title: 'Dashboard Admin | SM Educa',
  description: 'Painel administrativo completo',
};

export default async function NewAdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // ==========================================
  // QUERIES PARALELAS (Performance Otimizada)
  // ==========================================
  const [
    stats,
    usersByRole,
    recentUsers,
    recentCourses,
    recentEnrollments,
    recentPayments,
    dailyStats,
  ] = await Promise.all([
    // Estatísticas principais
    prisma.$transaction([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: subDays(new Date(), 30),
          },
        },
      }),
      prisma.enrollment.count({
        where: {
          enrolledAt: {
            gte: subDays(new Date(), 7),
          },
        },
      }),
    ]),

    // Distribuição por role
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),

    // Usuários recentes
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    }),

    // Cursos recentes
    prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        instructor: {
          select: { name: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    }),

    // Matrículas recentes
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        enrolledAt: true,
        student: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    }),

    // Pagamentos recentes
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'completed' },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    }),

    // Estatísticas dos últimos 7 dias
    Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const [users, enrollments, revenue] = await prisma.$transaction([
          prisma.user.count({
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          }),
          prisma.enrollment.count({
            where: {
              enrolledAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          }),
          prisma.payment.aggregate({
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
              status: 'completed',
            },
            _sum: { amount: true },
          }),
        ]);

        return {
          date: format(startOfDay, 'dd/MM'),
          users,
          enrollments,
          revenue: Number(revenue._sum.amount || 0) / 100,
        };
      })
    ),
  ]);

  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalRevenueAgg,
    newUsersLast30Days,
    newEnrollmentsLast7Days,
  ] = stats;

  const totalRevenue = Number(totalRevenueAgg._sum.amount || 0) / 100;

  // Calcular trends
  const userTrend =
    totalUsers > 0 ? `+${newUsersLast30Days} este mês` : 'Sem dados';
  const enrollmentTrend =
    totalEnrollments > 0
      ? `+${newEnrollmentsLast7Days} esta semana`
      : 'Sem dados';

  // Preparar dados de distribuição de usuários
  const roleDistribution = usersByRole.map((role) => ({
    name:
      role.role === 'STUDENT'
        ? 'Alunos'
        : role.role === 'TEACHER'
        ? 'Professores'
        : 'Admins',
    value: role._count,
  }));

  // Preparar atividades recentes
  const recentActivities = [
    ...recentUsers.map((user) => ({
      id: `user-${user.id}`,
      user: {
        name: user.name || 'Sem nome',
        email: user.email,
        avatar: user.avatar,
      },
      action: `Novo ${
        user.role === 'STUDENT'
          ? 'aluno'
          : user.role === 'TEACHER'
          ? 'professor'
          : 'admin'
      } cadastrado`,
      type: 'user' as const,
      createdAt: user.createdAt,
    })),
    ...recentEnrollments.map((enrollment) => ({
      id: `enrollment-${enrollment.id}`,
      user: enrollment.student,
      action: `Matriculou-se em ${enrollment.course.title}`,
      type: 'enrollment' as const,
      createdAt: enrollment.enrolledAt,
    })),
    ...recentCourses.map((course) => ({
      id: `course-${course.id}`,
      user: {
        name: course.instructor?.name || 'Instrutor',
        email: '',
        avatar: null,
      },
      action: `Criou o curso "${course.title}"`,
      type: 'course' as const,
      createdAt: course.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão completa e personalizada do sistema SM Educa
          </p>
        </div>

        {/* Grid Personalizável com Stats */}
        <DashboardGrid storageKey="admin-dashboard-v2">
          {/* Estatísticas Principais */}
          <StatCard
            title="Total de Usuários"
            value={totalUsers}
            icon={Users}
            variant="primary"
            trend={{ value: userTrend, positive: newUsersLast30Days > 0 }}
            subtitle="Todos os usuários cadastrados"
          />

          <StatCard
            title="Cursos Disponíveis"
            value={totalCourses}
            icon={BookOpen}
            variant="success"
            subtitle="Cursos ativos na plataforma"
          />

          <StatCard
            title="Matrículas"
            value={totalEnrollments}
            icon={GraduationCap}
            variant="warning"
            trend={{
              value: enrollmentTrend,
              positive: newEnrollmentsLast7Days > 0,
            }}
            subtitle="Total de matrículas realizadas"
          />

          <StatCard
            title="Receita Total"
            value={`R$ ${totalRevenue.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}`}
            icon={DollarSign}
            variant="danger"
            subtitle="Pagamentos confirmados"
          />

          {/* Gráfico de Crescimento de Usuários */}
          <DashboardCard
            title="Crescimento de Usuários"
            description="Últimos 7 dias"
            icon={UserPlus}
            className="sm:col-span-2 lg:col-span-2"
          >
            <AreaChartComponent
              data={dailyStats.map((d) => ({ name: d.date, value: d.users }))}
              dataKey="value"
              xAxisKey="name"
              color="hsl(var(--chart-1))"
            />
          </DashboardCard>

          {/* Gráfico de Matrículas */}
          <DashboardCard
            title="Matrículas Diárias"
            description="Últimos 7 dias"
            icon={BookPlus}
            className="sm:col-span-2 lg:col-span-2"
          >
            <LineChartComponent
              data={dailyStats.map((d) => ({
                name: d.date,
                value: d.enrollments,
              }))}
              dataKey="value"
              xAxisKey="name"
              color="hsl(var(--chart-2))"
            />
          </DashboardCard>

          {/* Gráfico de Receita */}
          <DashboardCard
            title="Receita Diária"
            description="Últimos 7 dias (R$)"
            icon={CreditCard}
            className="sm:col-span-2 lg:col-span-2"
          >
            <BarChartComponent
              data={dailyStats.map((d) => ({ name: d.date, value: d.revenue }))}
              dataKey="value"
              xAxisKey="name"
              color="hsl(var(--chart-3))"
            />
          </DashboardCard>

          {/* Distribuição de Usuários */}
          <DashboardCard
            title="Distribuição por Tipo"
            description="Roles no sistema"
            icon={TrendingUp}
            className="sm:col-span-2 lg:col-span-2"
          >
            <div className="space-y-3 pt-2">
              {roleDistribution.map((role) => {
                const percentage = ((role.value / totalUsers) * 100).toFixed(1);
                return (
                  <div key={role.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{role.name}</span>
                      <span className="text-muted-foreground">
                        {role.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          {/* Atividade Recente */}
          <div className="sm:col-span-2 lg:col-span-4">
            <RecentActivity activities={recentActivities} />
          </div>
        </DashboardGrid>
      </div>
    </div>
  );
}
