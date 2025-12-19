import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { LockedCourseCard } from '@/components/LockedCourseCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  Clock,
  Signal,
  Users,
  CheckCircle,
  PlayCircle,
  FileText,
  Award,
} from 'lucide-react';

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      category: true,
      instructor: {
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
        },
      },
      modules: {
        include: {
          lessons: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  return course;
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const resolvedParams = await params;
  const course = await getCourse(resolvedParams.slug);

  if (!course) {
    notFound();
  }

  // Normaliza isPaid para garantir consistência (price > 0)
  const isPaidCourse = typeof course.price === 'number' && course.price > 0;

  // Verificar se o usuário está matriculado
  let isEnrolled = false;
  if (session?.user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );
  const totalDuration = course.modules.reduce(
    (acc, module) =>
      acc +
      module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/courses"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Voltar para cursos
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Thumbnail */}
              {course.thumbnail && (
                <div className="w-full h-64 lg:h-96 rounded-xl overflow-hidden mb-6 shadow-lg">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {course.category.name}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                {course.level && (
                  <div className="flex items-center gap-2">
                    <Signal className="h-5 w-5 text-gray-600" />
                    <span>{course.level}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span>{course._count.enrollments} alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-gray-600" />
                  <span>{totalLessons} aulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  <span>{course.modules.length} módulos</span>
                </div>
              </div>

              {/* What you'll learn */}
              {course.whatYouLearn && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>O que você vai aprender</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.whatYouLearn.split(',').map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {course.requirements && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Requisitos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      {course.requirements}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Course Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo do Curso</CardTitle>
                  <CardDescription>
                    {course.modules.length} módulos • {totalLessons} aulas •{' '}
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">
                          {moduleIndex + 1}. {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {module.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between py-2 px-3 rounded bg-gray-50 dark:bg-gray-800"
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                                {lesson.isFree && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                    Grátis
                                  </span>
                                )}
                              </div>
                              {lesson.duration && (
                                <span className="text-sm text-gray-500">
                                  {Math.floor(lesson.duration / 60)}:
                                  {String(lesson.duration % 60).padStart(
                                    2,
                                    '0'
                                  )}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructor */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Instrutor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {course.instructor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {course.instructor.name}
                      </h3>
                      {course.instructor.bio && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          {course.instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="text-center mb-4">
                    {course.isPaid ? (
                      <div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                          R$ {(course.price || 0).toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pagamento único
                        </p>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        GRATUITO
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEnrolled ? (
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/student/courses/${course.id}`}>
                        Continuar Estudando
                      </Link>
                    </Button>
                  ) : session?.user ? (
                    isPaidCourse ? (
                      <>
                        <form action="/api/checkout/course" method="POST">
                          <input
                            type="hidden"
                            name="courseId"
                            value={course.id}
                          />
                          <Button type="submit" className="w-full" size="lg">
                            Comprar Curso
                          </Button>
                        </form>
                        <LockedCourseCard
                          variant="banner"
                          course={{
                            id: course.id,
                            title: course.title,
                            price: course.price || 0,
                            compareAtPrice: course.compareAtPrice,
                            thumbnail: course.thumbnail,
                            description: course.description,
                          }}
                        />
                      </>
                    ) : (
                      <form
                        action={`/api/courses/${course.id}/enroll`}
                        method="POST"
                      >
                        <Button type="submit" className="w-full" size="lg">
                          Matricular-se Agora
                        </Button>
                      </form>
                    )
                  ) : (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/login">Fazer Login para Matricular</Link>
                    </Button>
                  )}

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Módulos
                      </span>
                      <span className="font-semibold">
                        {course.modules.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Aulas
                      </span>
                      <span className="font-semibold">{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Duração
                      </span>
                      <span className="font-semibold">
                        {Math.floor(totalDuration / 60)}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Nível
                      </span>
                      <span className="font-semibold">
                        {course.level || 'Todos'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-gray-600" />
                      <span>Certificado de conclusão</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span>Materiais de apoio</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span>Acesso vitalício</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
