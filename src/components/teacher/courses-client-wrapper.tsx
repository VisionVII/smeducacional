'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { BookOpen, Users, Plus, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { StatsCard } from '@/components/teacher/stats-card';
import { CourseCard } from '@/components/teacher/course-card';
import { EmptyState } from '@/components/teacher/empty-state';
import { useTranslations } from '@/hooks/use-translations';
import { useState } from 'react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  isPublished: boolean;
  price: number | null;
  compareAtPrice: number | null;
  level: string | null;
  lessonCount?: number;
  category: { name: string } | null;
  _count: {
    enrollments: number;
    modules: number;
  };
  modules?: Array<{
    _count: {
      lessons: number;
    };
  }>;
}

interface CoursesClientWrapperProps {
  courses: Course[];
  stats: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
  };
  pageSize: number;
  totalCoursesCount: number;
}

export function CoursesClientWrapper({
  courses,
  stats,
  pageSize,
  totalCoursesCount,
}: CoursesClientWrapperProps) {
  const { t, mounted } = useTranslations();

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [courseList, setCourseList] = useState<Course[]>(courses);
  const hasMore = courseList.length < totalCoursesCount;

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;

    try {
      const response = await fetch(
        `/api/teacher/courses?page=${nextPage}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error('Failed to load more courses');
      }

      const result = (await response.json()) as { data: Course[] };
      setCourseList((prev) => [...prev, ...(result.data || [])]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error fetching more courses', error);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    totalCourses: totalCoursesStat,
    publishedCourses,
    draftCourses,
    totalStudents,
  } = stats;

  return (
    <>
      {/* Header Card */}
      <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30">
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-theme">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {mounted ? t.dashboard.teacher.myCourses : 'Meus Cursos'}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    {mounted
                      ? t.dashboard.teacher.headerDescription
                      : 'Gerencie todos os seus cursos em um só lugar'}
                  </p>
                </div>
              </div>
            </div>
            <Link href="/teacher/courses/new" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-theme hover:bg-gradient-theme-soft shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white font-bold h-12 px-8"
              >
                <Plus className="h-5 w-5 mr-2" />
                {mounted
                  ? t.dashboard.teacher.createNewCourse
                  : 'Criar Novo Curso'}
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7 lg:gap-8">
        <StatsCard
          title={mounted ? t.dashboard.teacher.totalCourses : 'Total de Cursos'}
          value={totalCoursesStat}
          description={
            mounted
              ? `${publishedCourses} ${t.dashboard.teacher.publishedCount}, ${draftCourses} ${t.dashboard.teacher.draftCoursesCount}`
              : `${publishedCourses} publicados, ${draftCourses} rascunhos`
          }
          icon={BookOpen}
          iconColor="from-blue-500 to-blue-600"
        />

        <StatsCard
          title={mounted ? t.dashboard.teacher.coursesPublished : 'Publicados'}
          value={publishedCourses}
          description={
            mounted
              ? t.dashboard.teacher.availableForStudents
              : 'Disponíveis para alunos'
          }
          icon={CheckCircle}
          iconColor="from-green-500 to-green-600"
        />

        <StatsCard
          title={mounted ? t.dashboard.teacher.drafts : 'Rascunhos'}
          value={draftCourses}
          description={
            mounted ? t.dashboard.teacher.inConstruction : 'Em construção'
          }
          icon={Clock}
          iconColor="from-amber-500 to-amber-600"
        />

        <StatsCard
          title={
            mounted ? t.dashboard.teacher.totalStudents : 'Total de Alunos'
          }
          value={totalStudents}
          description={mounted ? t.dashboard.teacher.enrolled : 'Matriculados'}
          icon={Users}
          iconColor="from-purple-500 to-purple-600"
        />
      </div>

      {/* Lista de Cursos */}
      <div className="space-y-6">
        {courseList.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={
              mounted
                ? t.dashboard.teacher.emptyTitle
                : 'Nenhum curso criado ainda'
            }
            description={
              mounted
                ? t.dashboard.teacher.emptyDescription
                : 'Comece criando seu primeiro curso agora mesmo'
            }
            action={{
              label: mounted
                ? t.dashboard.teacher.emptyAction
                : 'Criar Primeiro Curso',
              href: '/teacher/courses/new',
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {courseList.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                t={t}
                mounted={mounted}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="min-w-[220px] font-semibold"
            >
              {isLoading
                ? mounted
                  ? t.dashboard.teacher.loadingMore || 'Carregando...'
                  : 'Carregando...'
                : mounted
                ? t.dashboard.teacher.showMore || 'Ver mais cursos'
                : 'Ver mais cursos'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
