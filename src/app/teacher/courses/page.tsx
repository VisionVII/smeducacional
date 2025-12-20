import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-[1800px]">
        {/* Header Premium */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[200px]"></div>
          <CardHeader className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Meus Cursos
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie e crie seus cursos
                  </p>
                </div>
              </div>
              <Link href="/teacher/courses/new">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Novo Curso
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total de Cursos */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-[100px]"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <CardTitle className="text-sm text-muted-foreground font-medium mt-2">
                Total de Cursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                {totalCourses}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedCourses} publicados, {draftCourses} rascunhos
              </p>
            </CardContent>
          </Card>

          {/* Publicados */}
          <Card className="relative overflow-hidden border-2 hover:border-green-500/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-[100px]"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              <CardTitle className="text-sm text-muted-foreground font-medium mt-2">
                Publicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                {publishedCourses}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Disponíveis para alunos
              </p>
            </CardContent>
          </Card>

          {/* Rascunhos */}
          <Card className="relative overflow-hidden border-2 hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-[100px]"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
              <CardTitle className="text-sm text-muted-foreground font-medium mt-2">
                Rascunhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {draftCourses}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Em construção
              </p>
            </CardContent>
          </Card>

          {/* Total de Alunos */}
          <Card className="relative overflow-hidden border-2 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-[100px]"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <CardTitle className="text-sm text-muted-foreground font-medium mt-2">
                Total de Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                {totalStudents}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Matriculados</p>
            </CardContent>
          </Card>
        </div>

      {/* Lista de Cursos */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              Nenhum curso criado ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comece criando seu primeiro curso e compartilhe seu conhecimento!
            </p>
            <Link href="/teacher/courses/new">
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Criar Meu Primeiro Curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce(
              (acc, m) => acc + m._count.lessons,
              0
            );
            const isPaid = typeof course.price === 'number' && course.price > 0;

            return (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-48 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">
                              {course.title}
                            </h3>
                            {course.isPublished ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Publicado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Rascunho
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {course._count.modules} módulos
                            </span>
                            <span className="flex items-center gap-1">
                              <Settings className="h-4 w-4" />
                              {totalLessons} aulas
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {course._count.enrollments} alunos
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                              {isPaid ? (
                                <span className="text-green-600">
                                  R$ {course.price?.toFixed(2)}
                                  {course.compareAtPrice && (
                                    <span className="ml-2 text-xs text-gray-400 line-through">
                                      R$ {course.compareAtPrice.toFixed(2)}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-blue-600">Gratuito</span>
                              )}
                            </span>
                            {course.level && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {course.level}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/courses/${course.slug}`}
                            target="_blank"
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/teacher/courses/${course.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/teacher/courses/${course.id}/content`}>
                            <Button size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Conteúdo
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
