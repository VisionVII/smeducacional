'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Activity as ActivityIcon,
  Bell,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  StatsCard,
  StatsCardSkeleton,
} from '@/components/dashboard/stats-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RecentPayments } from '@/components/admin/recent-payments';
import { PaymentStats } from '@/components/admin/payment-stats';

type DashboardResponse = {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    newUsersLast24Hours: number;
    newUsersLast30Days: number;
    newEnrollmentsLast7Days: number;
  };
  systemStatus: Array<{
    name: string;
    status: 'operational';
    latencyMs: number;
  }>;
  suspiciousActivities: Array<{
    id: string;
    action: string;
    createdAt: string;
    user?: { id: string; name: string | null; email: string } | null;
    targetId?: string | null;
    targetType?: string | null;
  }>;
  pendingCourses: Array<{
    id: string;
    title: string;
    createdAt: string;
    instructor?: { id: string; name: string | null; email: string } | null;
  }>;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Falha ao carregar dados');
  }
  return res.json();
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [router, session, status]);

  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => fetcher<DashboardResponse>('/api/dashboard/admin'),
    enabled: status === 'authenticated' && session?.user?.role === 'ADMIN',
    staleTime: 60_000,
  });

  const activitiesQuery = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () =>
      fetcher<
        Array<{
          id: string;
          action: string;
          type: string;
          user: { name: string; email: string; avatar: string | null };
          createdAt: string;
        }>
      >('/api/admin/activities?limit=8'),
    enabled: status === 'authenticated' && session?.user?.role === 'ADMIN',
    staleTime: 60_000,
  });

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((key) => (
          <StatsCardSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  const dashboard = dashboardQuery.data;

  const adminJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Painel Administrativo - ${session.user.name || 'SM Educa'}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://sm-educa.com/admin',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      description: 'Dashboard administrativo unificado',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(adminJsonLd) }}
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">
            Painel Administrativo - {session.user.name || 'Administrador'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral do ambiente e indicadores críticos.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {dashboardQuery.isLoading || !dashboard ? (
            [1, 2, 3, 4].map((key) => <StatsCardSkeleton key={key} />)
          ) : (
            <>
              <StatsCard
                title="Total de Usuários"
                value={dashboard.stats.totalUsers.toLocaleString('pt-BR')}
                description="Contagem geral da base"
                icon={Users}
                trend={{
                  direction: 'up',
                  value: `+${dashboard.stats.newUsersLast30Days}`,
                  label: 'últimos 30d',
                }}
              />
              <StatsCard
                title="Cursos Publicados"
                value={dashboard.stats.totalCourses.toLocaleString('pt-BR')}
                description="Cursos ativos e visíveis"
                icon={CheckCircle2}
                trend={{
                  direction: 'up',
                  value: `${dashboard.stats.totalCourses > 0 ? 'OK' : '—'}`,
                  label: 'aprovados',
                }}
              />
              <StatsCard
                title="Matrículas"
                value={dashboard.stats.totalEnrollments.toLocaleString('pt-BR')}
                description="Total de matrículas"
                icon={GraduationCap}
                trend={{
                  direction: 'up',
                  value: `+${dashboard.stats.newEnrollmentsLast7Days}`,
                  label: 'últimos 7d',
                }}
              />
              <StatsCard
                title="Faturamento"
                value={dashboard.stats.totalRevenue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                })}
                description="Receita confirmada"
                icon={DollarSign}
                trend={{ direction: 'up', value: '+12%', label: 'mês' }}
                miniChartData={[
                  dashboard.stats.totalRevenue / 10,
                  dashboard.stats.totalRevenue / 8,
                  dashboard.stats.totalRevenue / 6,
                  dashboard.stats.totalRevenue / 5,
                  dashboard.stats.totalRevenue / 4,
                ]}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <PaymentStats />
            <RecentPayments />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  Status dos Serviços
                </CardTitle>
                <CardDescription>
                  Saúde operacional do ecossistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardQuery.isLoading || !dashboard ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  dashboard.systemStatus.map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Latência ~{service.latencyMs}ms
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-600"
                      >
                        Operacional
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-primary" />
                  Atividades Suspeitas
                </CardTitle>
                <CardDescription>Monitore ações sensíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardQuery.isLoading || !dashboard ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : dashboard.suspiciousActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum evento crítico.
                  </p>
                ) : (
                  dashboard.suspiciousActivities.slice(0, 6).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user?.email || 'Usuário desconhecido'} •{' '}
                          {new Date(activity.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="destructive">Revisar</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Aprovação de Cursos Pendentes
              </CardTitle>
              <CardDescription>
                Últimos cursos aguardando publicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardQuery.isLoading || !dashboard ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : dashboard.pendingCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum curso pendente no momento.
                </p>
              ) : (
                dashboard.pendingCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.instructor?.name || 'Instrutor não informado'} •{' '}
                        {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Revisar
                      </Button>
                      <Badge variant="outline">Pendente</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>Eventos em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activitiesQuery.isLoading || !activitiesQuery.data ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : activitiesQuery.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente.
                </p>
              ) : (
                activitiesQuery.data.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user?.email || 'Usuário'} •{' '}
                        {new Date(activity.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="outline">Live</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
