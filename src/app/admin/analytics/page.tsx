import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  Users,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Award,
  Activity,
  Clock,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AreaChartComponent,
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  MultiBarChartComponent,
  MultiLineChartComponent,
} from '@/components/admin/chart-components';

export default async function AdminDashboardNew() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Acesso não autorizado</p>
      </div>
    );
  }

  // ==========================================
  // Estatísticas Gerais
  // ==========================================
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalCertificates,
    totalPayments,
    totalRevenueAgg,
    paidCourses,
    activeStudentSubscriptions,
    activeTeacherSubscriptions,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.payment.count(),
    prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    }),
    prisma.course.count({ where: { isPaid: true } }),
    prisma.studentSubscription.count({ where: { status: 'active' } }),
    prisma.teacherSubscription.count({ where: { status: 'active' } }),
  ]);

  const activeSubscriptions =
    activeStudentSubscriptions + activeTeacherSubscriptions;
  const totalRevenue = totalRevenueAgg._sum.amount || 0;

  // ==========================================
  // Distribuição por Role
  // ==========================================
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  // Dados formatados para gráfico de pizza
  const userRoleChartData = usersByRole.map((item) => ({
    name:
      item.role === 'STUDENT'
        ? 'Alunos'
        : item.role === 'TEACHER'
        ? 'Professores'
        : 'Admins',
    value: item._count,
  }));

  // ==========================================
  // Dados de Pagamento
  // ==========================================
  const paymentsByStatus = await prisma.payment.groupBy({
    by: ['status'],
    _count: true,
    _sum: { amount: true },
  });

  // Dados formatados para gráfico de barras
  const paymentStatusChartData = paymentsByStatus.map((item) => ({
    name:
      item.status === 'completed'
        ? 'Concluído'
        : item.status === 'pending'
        ? 'Pendente'
        : 'Falhou',
    value: item._count,
    amount: item._sum.amount || 0,
  }));

  // ==========================================
  // Crescimento de usuários nos últimos 7 dias
  // ==========================================
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date,
      label: format(date, 'dd/MM', { locale: ptBR }),
    };
  });

  const userGrowthData = await Promise.all(
    last7Days.map(async ({ date, label }) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      return {
        name: label,
        value: count,
      };
    })
  );

  // ==========================================
  // Receita nos últimos 7 dias
  // ==========================================
  const revenueGrowthData = await Promise.all(
    last7Days.map(async ({ date, label }) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await prisma.payment.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        name: label,
        value: result._sum.amount || 0,
      };
    })
  );

  // ==========================================
  // Matrículas por curso (top 5)
  // ==========================================
  const topCourses = await prisma.course.findMany({
    take: 5,
    orderBy: {
      enrollments: {
        _count: 'desc',
      },
    },
    select: {
      title: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  const topCoursesChartData = topCourses.map((course) => ({
    name:
      course.title.length > 20
        ? course.title.substring(0, 20) + '...'
        : course.title,
    value: course._count.enrollments,
  }));

  // ==========================================
  // Cursos recentes
  // ==========================================
  const recentCourses = await prisma.course.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      instructor: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  // ==========================================
  // Usuários recentes
  // ==========================================
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const stats = {
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalCertificates,
    totalPayments,
    totalRevenue,
    paidCourses,
    activeSubscriptions,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            Dashboard SM Educa
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão geral completa do sistema com métricas e análises
          </p>
        </div>

        {/* ==========================================
            CARDS DE ESTATÍSTICAS PRINCIPAIS
            ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Usuários
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeSubscriptions} com assinatura ativa
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Cursos
              </CardTitle>
              <BookOpen className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.paidCourses} cursos pagos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matrículas</CardTitle>
              <GraduationCap className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalCertificates} certificados emitidos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalPayments} transações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            GRÁFICOS DE ANÁLISE
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Crescimento de Usuários */}
          <AreaChartComponent
            data={userGrowthData}
            title="Novos Usuários (7 dias)"
            description="Cadastros diários dos últimos 7 dias"
            height={300}
          />

          {/* Receita Diária */}
          <LineChartComponent
            data={revenueGrowthData}
            title="Receita Diária (7 dias)"
            description="Faturamento dos últimos 7 dias"
            height={300}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Distribuição de Usuários por Tipo */}
          <PieChartComponent
            data={userRoleChartData}
            title="Distribuição de Usuários"
            description="Usuários por tipo de conta"
            height={300}
          />

          {/* Top 5 Cursos */}
          <BarChartComponent
            data={topCoursesChartData}
            title="Top 5 Cursos"
            description="Cursos com mais matrículas"
            height={300}
          />
        </div>

        {/* ==========================================
            TABELAS DE DADOS RECENTES
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Cursos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Cursos Recentes
              </CardTitle>
              <CardDescription>Últimos 5 cursos criados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-start justify-between pb-4 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Por {course.instructor.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course._count.enrollments} alunos matriculados
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">
                      {format(new Date(course.createdAt), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usuários Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários Recentes
              </CardTitle>
              <CardDescription>Últimos 5 cadastros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-start justify-between pb-4 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            user.role === 'STUDENT'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'TEACHER'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            STATUS DE PAGAMENTOS
            ========================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Pagamentos</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {paymentStatusChartData.map((item) => (
                <div
                  key={item.name}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm font-medium mb-1">{item.name}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {item.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
