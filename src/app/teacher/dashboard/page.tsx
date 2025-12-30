'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  DollarSign,
  GraduationCap,
  MessageSquare,
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type TeacherDashboardResponse = {
  profile: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    createdAt: string;
  } | null;
  stats: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
    totalModules: number;
    totalLessons: number;
    pendingMessages: number;
    profileCompletion: number;
    totalRevenue: number;
    activeSubscriptions: number;
  };
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
    modules: number;
    lessons: number;
    enrollments: number;
  }>;
  engagementSeries: Array<{ label: string; value: number }>;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao carregar dashboard');
  return res.json();
};

export default function TeacherDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && session?.user?.role !== 'TEACHER') {
      router.replace('/');
    }
  }, [router, session, status]);

  const dashboardQuery = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: () =>
      fetcher<TeacherDashboardResponse>('/api/dashboard/teacher?courseLimit=8'),
    enabled: status === 'authenticated' && session?.user?.role === 'TEACHER',
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

  if (!session || session.user.role !== 'TEACHER') {
    return null;
  }

  const dashboard = dashboardQuery.data;

  const teacherJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Painel do Instrutor - ${session.user.name || 'SM Educa'}`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      description: 'Ferramentas para instrutores SM Educa',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teacherJsonLd) }}
      />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              Painel do Instrutor - {session.user.name || 'Instrutor'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe ganhos, alunos e cursos em tempo real.
            </p>
          </div>
          <Button asChild>
            <Link href="/teacher/courses/new">Criar novo curso</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {dashboardQuery.isLoading || !dashboard ? (
            [1, 2, 3, 4].map((key) => <StatsCardSkeleton key={key} />)
          ) : (
            <>
              <StatsCard
                title="Ganhos Líquidos"
                value={dashboard.stats.totalRevenue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                })}
                description="Receita confirmada"
                icon={DollarSign}
                trend={{ direction: 'up', value: '+8%', label: 'mês' }}
                miniChartData={dashboard.engagementSeries.map((p) => p.value)}
              />
              <StatsCard
                title="Alunos Totais"
                value={dashboard.stats.totalStudents.toLocaleString('pt-BR')}
                description="Somatório de matrículas"
                icon={Users}
                trend={{ direction: 'up', value: '+3%', label: 'semana' }}
              />
              <StatsCard
                title="Cursos Publicados"
                value={dashboard.stats.publishedCourses}
                description={`${dashboard.stats.draftCourses} rascunhos`}
                icon={BookOpen}
                trend={{
                  direction: 'flat',
                  value: `${dashboard.stats.totalCourses} ativos`,
                }}
              />
              <StatsCard
                title="Mensagens Pendentes"
                value={dashboard.stats.pendingMessages}
                description="Atenda alunos rapidamente"
                icon={MessageSquare}
                trend={{ direction: 'down', value: 'Responder', label: 'hoje' }}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Cursos e desempenho
              </CardTitle>
              <CardDescription>
                Lista rápida dos cursos mais recentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardQuery.isLoading || !dashboard ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((key) => (
                    <Skeleton key={key} className="h-40 w-full" />
                  ))}
                </div>
              ) : dashboard.courses.length === 0 ? (
                <div className="text-center py-10 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-4">
                    Nenhum curso ainda. Publique seu primeiro conteúdo.
                  </p>
                  <Button asChild>
                    <Link href="/teacher/courses/new">Criar curso</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboard.courses.map((course) => (
                    <Card
                      key={course.id}
                      className="border-2 hover:border-primary/40 transition-all"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription>
                          {course.isPublished ? 'Publicado' : 'Rascunho'} •{' '}
                          {course.enrollments} alunos
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" /> {course.modules}{' '}
                            módulos
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />{' '}
                            {course.lessons} aulas
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="w-full"
                          >
                            <Link
                              href={`/teacher/courses/${course.id}/content`}
                            >
                              Gerenciar conteúdo
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Link
                              href={`/teacher/courses/${course.id}/students`}
                            >
                              Alunos
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Engajamento & Assinaturas
              </CardTitle>
              <CardDescription>Atividade recente dos alunos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold">Assinaturas ativas</p>
                  <p className="text-xs text-muted-foreground">
                    Alunos recorrentes
                  </p>
                </div>
                <Badge variant="outline">
                  {dashboard?.stats.activeSubscriptions ?? 0}
                </Badge>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Receita recente</p>
                <div className="flex items-end gap-1 h-16">
                  {(dashboard?.engagementSeries || []).map((point, idx) => {
                    const max = Math.max(
                      ...(dashboard?.engagementSeries || []).map(
                        (p) => p.value
                      ),
                      1
                    );
                    const height = `${Math.max(
                      (point.value / max) * 100,
                      8
                    ).toFixed(0)}%`;
                    return (
                      <span
                        key={`${point.label}-${idx}`}
                        className="flex-1 min-w-[8px] rounded-full bg-gradient-to-t from-primary/20 to-primary"
                        style={{ height }}
                        title={new Date(point.label).toLocaleDateString(
                          'pt-BR'
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
