'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Award, BookOpen, Clock, TrendingUp } from 'lucide-react';
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
import {
  StudyContinuityWidget,
  ProgressWidget,
} from '@/components/dashboard/study-widgets';

type StudentDashboardResponse = {
  stats: {
    activeCourses: number;
    completedCourses: number;
    certificates: number;
    totalHours: number;
  };
  continueLearning: Array<{
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    progress: number;
    thumbnail: string | null;
    slug: string | null;
  }>;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao carregar dashboard');
  return res.json();
};

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && session?.user?.role !== 'STUDENT') {
      router.replace('/');
    }
  }, [router, session, status]);

  const dashboardQuery = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () =>
      fetcher<StudentDashboardResponse>('/api/dashboard/student?courseLimit=9'),
    enabled: status === 'authenticated' && session?.user?.role === 'STUDENT',
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

  if (!session || session.user.role !== 'STUDENT') {
    return null;
  }

  const dashboard = dashboardQuery.data;

  const studentJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: `Painel do Aluno - ${session.user.name || 'SM Educa'}`,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url: 'https://sm-educa.com/student/dashboard',
    description: 'Progresso acadêmico e cursos em andamento',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(studentJsonLd) }}
      />
      <div className="space-y-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
                <Activity className="h-3 w-3 mr-1" /> Sistema online
              </Badge>
            </div>
            <h1 className="text-2xl font-bold mt-4">
              Olá, {session.user.name || 'aluno'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Continue de onde parou e acompanhe seu progresso.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardQuery.isLoading || !dashboard ? (
            [1, 2, 3, 4].map((key) => <StatsCardSkeleton key={key} />)
          ) : (
            <>
              <StatsCard
                title="Cursos ativos"
                value={dashboard.stats.activeCourses}
                description="Em andamento"
                icon={BookOpen}
                trend={{ direction: 'up', value: '+1', label: 'esta semana' }}
              />
              <StatsCard
                title="Cursos concluídos"
                value={dashboard.stats.completedCourses}
                description="Meta de conclusão"
                icon={TrendingUp}
                trend={{ direction: 'up', value: 'Progresso', label: '' }}
              />
              <StatsCard
                title="Certificados"
                value={dashboard.stats.certificates}
                description="Emitidos"
                icon={Award}
                trend={{ direction: 'flat', value: 'Disponíveis' }}
              />
              <StatsCard
                title="Horas de estudo"
                value={`${dashboard.stats.totalHours}h`}
                description="Tempo dedicado"
                icon={Clock}
                trend={{ direction: 'flat', value: 'Smart track' }}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StudyContinuityWidget
            currentStreak={dashboard?.stats.activeCourses || 0}
            totalStudyHours={dashboard?.stats.totalHours || 0}
            nextMilestone={10}
          />
          <ProgressWidget
            totalCourses={dashboard?.stats.activeCourses || 0}
            completedCourses={dashboard?.stats.completedCourses || 0}
            avgProgress={
              dashboard && dashboard.stats.activeCourses > 0
                ? Math.round(
                    (dashboard.continueLearning.reduce(
                      (acc, c) => acc + c.progress,
                      0
                    ) /
                      dashboard.continueLearning.length) *
                      100
                  ) / 100
                : 0
            }
          />
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Continuar de onde parou</CardTitle>
            <CardDescription>
              Acesse rapidamente os cursos em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardQuery.isLoading || !dashboard ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((key) => (
                  <Skeleton key={key} className="h-40 w-full" />
                ))}
              </div>
            ) : dashboard.continueLearning.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground mb-4">
                  Você ainda não iniciou nenhum curso.
                </p>
                <Button asChild>
                  <Link href="/courses">Explorar cursos</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.continueLearning.map((enrollment) => (
                  <Card
                    key={enrollment.id}
                    className="border-2 hover:border-primary/40 transition-all"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-2">
                        {enrollment.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {enrollment.description || 'Acompanhe seu avanço'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Progresso
                          </span>
                          <span className="font-semibold">
                            {Math.round(enrollment.progress)}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/student/courses/${enrollment.courseId}`}>
                          Continuar curso
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
