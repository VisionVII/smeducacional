'use client';

import { useTranslations } from '@/hooks/use-translations';
import { ProfileHeader } from '@/components/teacher/profile-header';
import { StatsCard } from '@/components/teacher/stats-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  MessageSquare,
  CheckCircle2,
  DollarSign,
  Target,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    createdAt: Date;
  };
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
    totalCourseRevenue: number;
    totalSubscriptionRevenue: number;
    activeSubscriptions: number;
    totalPayments: number;
  };
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    _count: {
      modules: number;
      lessons: number;
      enrollments: number;
    };
  }>;
}

export function DashboardClient({
  user,
  stats,
  courses,
}: DashboardClientProps) {
  const { t, mounted } = useTranslations();

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const teacherT = t.dashboard.teacher;
  const pageT = teacherT.dashboardPage;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Hero Section - Perfil do Professor */}
        <ProfileHeader
          name={user.name || user.email}
          email={user.email}
          avatar={user.avatar}
          profileCompletion={stats.profileCompletion}
          totalCourses={stats.totalCourses}
          totalStudents={stats.totalStudents}
          totalModules={stats.totalModules}
          totalLessons={stats.totalLessons}
        />

        {/* Indicadores Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title={pageT.kpis.published.title}
            value={stats.publishedCourses}
            icon={BookOpen}
            description={pageT.kpis.published.description?.replace(
              '{{count}}',
              String(stats.draftCourses)
            )}
            iconColor="from-blue-500 to-blue-600"
          />
          <StatsCard
            title={pageT.kpis.students.title}
            value={stats.totalStudents}
            icon={Users}
            description={pageT.kpis.students.description?.replace(
              '{{count}}',
              String(stats.totalCourses)
            )}
            iconColor="from-emerald-500 to-green-600"
          />
          <StatsCard
            title={pageT.financial.totalRevenue.title}
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            description={pageT.financial.totalRevenue.description}
            iconColor="from-purple-500 to-indigo-600"
          />
          <StatsCard
            title={pageT.kpis.messages.title}
            value={stats.pendingMessages}
            icon={MessageSquare}
            description={pageT.kpis.messages.description}
            iconColor="from-amber-500 to-orange-600"
          />
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Coluna Esquerda - Cursos Recentes */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl text-gradient-theme">
                    {pageT.performance.title}
                  </CardTitle>
                  <CardDescription>
                    {pageT.performance.description}
                  </CardDescription>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-theme hover:bg-gradient-theme-soft"
                >
                  <Link href="/teacher/courses/new">
                    {pageT.performance.newCourse}
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    className="group border rounded-lg p-4 hover:border-primary/50 bg-background/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course._count.modules} {pageT.performance.modules} •{' '}
                          {course._count.lessons} {pageT.performance.lessons}
                        </p>
                      </div>
                      <Badge
                        variant={course.isPublished ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {course.isPublished
                          ? pageT.performance.published
                          : pageT.performance.draft}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course._count.enrollments} {pageT.performance.students}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Link href={`/teacher/courses/${course.id}/content`}>
                          {pageT.performance.manageContent}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Link href={`/teacher/courses/${course.id}/students`}>
                          {pageT.performance.viewStudents}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}

                {courses.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {pageT.performance.empty.description}
                    </p>
                    <Button asChild>
                      <Link href="/teacher/courses/new">
                        {pageT.performance.empty.cta}
                      </Link>
                    </Button>
                  </div>
                )}

                {courses.length > 3 && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/teacher/courses">
                      {pageT.performance.viewAll?.replace(
                        '{{count}}',
                        String(stats.totalCourses)
                      )}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Ações Rápidas */}
          <div className="space-y-6">
            <Card className="border-2 hover:border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {pageT.quickAccess.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Link href="/teacher/courses/new">
                    <BookOpen className="h-4 w-4" />
                    {pageT.quickAccess.newCourse}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Link href="/teacher/profile">
                    <CheckCircle2 className="h-4 w-4" />
                    {pageT.quickAccess.editProfile}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Link href="/teacher/messages">
                    <MessageSquare className="h-4 w-4" />
                    {pageT.quickAccess.messages}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
