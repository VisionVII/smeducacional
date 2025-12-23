import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Plus, CheckCircle, Clock } from 'lucide-react';
import { StatsCard } from '@/components/teacher/stats-card';
import { CourseCard } from '@/components/teacher/course-card';
import { EmptyState } from '@/components/teacher/empty-state';

export default async function TeacherCoursesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Buscar cursos do professor
  const courses = await prisma.course.findMany({
    where: {
      instructorId: session.user.id,
    },
    include: {
      category: true,
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
      modules: {
        include: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calcular estatísticas
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.filter((c) => !c.isPublished).length;
  const totalStudents = courses.reduce(
    (acc, c) => acc + c._count.enrollments,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl space-y-8 sm:space-y-10">
        {/* Header Premium */}
        <Card className="relative overflow-hidden border-2 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
          {/* Camada base gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

          {/* Decorações animadas de fundo */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-accent/20 via-primary/20 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Linha de brilho superior */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <CardHeader className="relative z-10 p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-theme rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-theme-triple">
                      Meus Cursos
                    </CardTitle>
                    <p className="text-base sm:text-lg text-muted-foreground mt-2">
                      Gerencie seus cursos e alcance mais alunos
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
                  Criar Novo Curso
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7 lg:gap-8">
          <StatsCard
            title="Total de Cursos"
            value={totalCourses}
            description={`${publishedCourses} publicados, ${draftCourses} rascunhos`}
            icon={BookOpen}
            iconColor="from-blue-500 to-blue-600"
          />

          <StatsCard
            title="Publicados"
            value={publishedCourses}
            description="Disponíveis para alunos"
            icon={CheckCircle}
            iconColor="from-green-500 to-green-600"
          />

          <StatsCard
            title="Rascunhos"
            value={draftCourses}
            description="Em construção"
            icon={Clock}
            iconColor="from-amber-500 to-amber-600"
          />

          <StatsCard
            title="Total de Alunos"
            value={totalStudents}
            description="Matriculados"
            icon={Users}
            iconColor="from-purple-500 to-purple-600"
          />
        </div>

        {/* Lista de Cursos */}
        <div className="space-y-6">
          {/* Seção Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Seus Cursos
              </h2>
              <p className="text-sm text-muted-foreground">
                {courses.length === 0
                  ? 'Nenhum curso criado ainda'
                  : `${courses.length} ${
                      courses.length === 1
                        ? 'curso encontrado'
                        : 'cursos encontrados'
                    }`}
              </p>
            </div>
          </div>

          {/* Lista ou Empty State */}
          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhum curso criado ainda"
              description="Comece criando seu primeiro curso e compartilhe seu conhecimento com o mundo!"
              action={{
                label: 'Criar Meu Primeiro Curso',
                href: '/teacher/courses/new',
              }}
            />
          ) : (
            <div className="space-y-5 sm:space-y-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
