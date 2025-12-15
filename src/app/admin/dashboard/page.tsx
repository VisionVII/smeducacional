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
  AlertCircle,
  Clock,
  Database,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DevTools } from '@/components/admin/dev-tools';

type QueryResult<T> = { ok: true; data: T[] } | { ok: false; error: string };

async function safeQuery<T>(
  label: string,
  sql: string
): Promise<QueryResult<T>> {
  try {
    const data = await prisma.$queryRawUnsafe<T[]>(sql);
    return { ok: true, data };
  } catch (error) {
    console.error(`[admin][db][${label}]`, error);
    return { ok: false, error: 'Não foi possível recuperar estes dados' };
  }
}

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Erro: Usuário não autenticado ou banco de dados indisponível
        </p>
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
    pendingInvoices,
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
    prisma.invoice.count({ where: { status: 'overdue' } }),
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

  // ==========================================
  // Dados de Pagamento
  // ==========================================
  const paymentData = await prisma.payment.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amount: true,
      type: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  const paymentsByStatus = await prisma.payment.groupBy({
    by: ['status'],
    _count: true,
    _sum: { amount: true },
  });

  // ==========================================
  // Logs do Sistema
  // ==========================================
  const systemLogs = await prisma.systemLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      level: true,
      component: true,
      message: true,
      createdAt: true,
    },
  });

  // ==========================================
  // Métricas do Desenvolvedor
  // ==========================================
  const devMetrics = await prisma.developerMetrics.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    distinct: ['component'],
  });

  // ==========================================
  // Diagnóstico do Banco de Dados
  // ==========================================
  const [tablesRes, rolesRes, functionsRes, rlsRes, bucketsRes] =
    await Promise.all([
      safeQuery<{ table_schema: string; table_name: string }>(
        'tables',
        `
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name
        LIMIT 50;
        `
      ),
      safeQuery<{
        rolname: string;
        rolsuper: boolean;
        rolcreatedb: boolean;
        rolcreaterole: boolean;
        rolcanlogin: boolean;
      }>(
        'roles',
        `
        SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolcanlogin
        FROM pg_roles
        ORDER BY rolname
        LIMIT 20;
        `
      ),
      safeQuery<{ oid: number; schema: string; name: string }>(
        'functions',
        `
        SELECT p.oid AS oid, n.nspname AS schema, p.proname AS name
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY n.nspname, p.proname
        LIMIT 50;
        `
      ),
      safeQuery<{ schema: string; name: string }>(
        'rls',
        `
        SELECT schemaname AS schema, tablename AS name
        FROM pg_tables
        WHERE rowsecurity = true
        ORDER BY schemaname, tablename;
        `
      ),
      safeQuery<{ id: string; name: string; public: boolean }>(
        'buckets',
        `
        SELECT id, name, public
        FROM storage.buckets
        ORDER BY name
        LIMIT 20;
        `
      ),
    ]);

  const dbTables = tablesRes.ok ? tablesRes.data : [];
  const dbRoles = rolesRes.ok ? rolesRes.data : [];
  const dbFunctions = functionsRes.ok ? functionsRes.data : [];
  const dbRls = rlsRes.ok ? rlsRes.data : [];
  const storageBuckets = bucketsRes.ok ? bucketsRes.data : [];

  // ==========================================
  // Integrações GitHub
  // ==========================================
  const githubIntegrations = await prisma.githubIntegration.count({
    where: { isConnected: true },
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
    pendingInvoices,
  };

  // Usuários recentes
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

  // Cursos recentes
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral completa do sistema, pagamentos e métricas
          </p>
        </div>

        {/* ==========================================
            STATS PRINCIPAIS
            ========================================== */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">total no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.paidCourses} pagos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matrículas</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">ativas no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPayments} pagamentos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            MÉTRICAS DE PAGAMENTO
            ========================================== */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Subscrições Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeSubscriptions}
              </div>
              <p className="text-xs text-muted-foreground">
                alunos + professores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Faturas Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.pendingInvoices}
              </div>
              <p className="text-xs text-muted-foreground">require atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                GitHub Conectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {githubIntegrations}
              </div>
              <p className="text-xs text-muted-foreground">
                integrações ativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            DISTRIBUIÇÃO DE USUÁRIOS
            ========================================== */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usuários por Tipo</CardTitle>
              <CardDescription>
                Distribuição de funções no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usersByRole.map((item) => (
                  <div
                    key={item.role}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm capitalize">
                      {item.role.toLowerCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(item._count / stats.totalUsers) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {item._count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status de Pagamentos</CardTitle>
              <CardDescription>Distribuição por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentsByStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm capitalize">{item.status}</span>
                      <p className="text-xs text-muted-foreground">
                        R$ {(item._sum.amount || 0).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{item._count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            PAGAMENTOS RECENTES
            ========================================== */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Pagamentos Recentes</CardTitle>
            <CardDescription>Últimas 10 transações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Usuário</th>
                    <th className="text-left py-2 px-2">Tipo</th>
                    <th className="text-left py-2 px-2">Valor</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentData.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 text-xs">
                        <div>
                          <p className="font-medium">{payment.user.name}</p>
                          <p className="text-muted-foreground">
                            {payment.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs">
                        <span className="capitalize">{payment.type}</span>
                      </td>
                      <td className="py-2 px-2 font-medium">
                        R$ {payment.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), 'dd/MM HH:mm', {
                          locale: ptBR,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ==========================================
            DIAGNÓSTICO DO BANCO DE DADOS
            ========================================== */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Diagnóstico do Banco de Dados
            </CardTitle>
            <CardDescription>
              Visão rápida de tabelas, roles, funções, segurança e buckets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Tabelas</p>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </div>
                {tablesRes.ok ? (
                  <ul className="space-y-1 text-xs text-muted-foreground max-h-44 overflow-auto">
                    {dbTables.slice(0, 12).map((t) => (
                      <li key={`${t.table_schema}.${t.table_name}`}>
                        {t.table_schema}.{t.table_name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-red-600">{tablesRes.error}</p>
                )}
              </div>

              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Roles</p>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>
                {rolesRes.ok ? (
                  <ul className="space-y-1 text-xs text-muted-foreground max-h-44 overflow-auto">
                    {dbRoles.slice(0, 12).map((r) => (
                      <li key={r.rolname}>
                        {r.rolname} {r.rolcanlogin ? '(login)' : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-red-600">{rolesRes.error}</p>
                )}
              </div>

              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Funções</p>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                {functionsRes.ok ? (
                  <ul className="space-y-1 text-xs text-muted-foreground max-h-44 overflow-auto">
                    {dbFunctions.slice(0, 12).map((f) => (
                      <li key={f.oid ?? `${f.schema}.${f.name}`}>
                        {f.schema}.{f.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-red-600">{functionsRes.error}</p>
                )}
              </div>

              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Security (RLS)</p>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>
                {rlsRes.ok ? (
                  <ul className="space-y-1 text-xs text-muted-foreground max-h-44 overflow-auto">
                    {dbRls.length === 0 && (
                      <li className="text-muted-foreground">
                        Nenhuma tabela com RLS
                      </li>
                    )}
                    {dbRls.slice(0, 12).map((r) => (
                      <li key={`${r.schema}.${r.name}`}>
                        {r.schema}.{r.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-red-600">{rlsRes.error}</p>
                )}
              </div>

              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Buckets</p>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </div>
                {bucketsRes.ok ? (
                  <ul className="space-y-1 text-xs text-muted-foreground max-h-44 overflow-auto">
                    {storageBuckets.length === 0 && (
                      <li className="text-muted-foreground">
                        Nenhum bucket encontrado
                      </li>
                    )}
                    {storageBuckets.slice(0, 12).map((b) => (
                      <li key={b.id}>
                        {b.name} {b.public ? '(público)' : '(privado)'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-red-600">{bucketsRes.error}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==========================================
            SYSTEM LOGS & DEVELOPER TOOLS
            ========================================== */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Logs</CardTitle>
              <CardDescription>Últimos eventos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        log.level === 'error'
                          ? 'bg-red-500'
                          : log.level === 'warn'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {log.component}: {log.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), 'dd/MM HH:mm', {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Developer Metrics</CardTitle>
              <CardDescription>Performance e saúde do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between pb-3 border-b last:border-0"
                  >
                    <div>
                      <p className="text-xs font-medium capitalize">
                        {metric.component}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metric.responseTime}ms
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs font-medium ${
                          (metric.errorRate || 0) > 5
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {metric.errorRate?.toFixed(1)}% erros
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            FERRAMENTAS DO DESENVOLVEDOR
            ========================================== */}
        <DevTools />
      </div>
    </div>
  );
}
