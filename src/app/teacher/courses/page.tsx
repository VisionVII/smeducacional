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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Cursos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie e crie seus cursos
          </p>
        </div>
        <Link href="/teacher/courses/new">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Criar Novo Curso
          </Button>
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Cursos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCourses} publicados, {draftCourses} rascunhos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCourses}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para alunos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCourses}</div>
            <p className="text-xs text-muted-foreground">Em construção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Matriculados</p>
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
                                  <span className="text-blue-600">
                                    Gratuito
                                  </span>
                                )}
                              </span>
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
