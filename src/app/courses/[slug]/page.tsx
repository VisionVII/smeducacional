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

type CourseParams = { slug: string };

async function getCourse(slug: string) {
  if (!slug) return null;

  return prisma.course.findFirst({
    where: { slug, isPublished: true },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, avatar: true, bio: true } },
      modules: {
        include: { lessons: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

export default async function CourseDetailPage({
  params,
}: {
  params: CourseParams;
}) {
  const session = await auth();
  const course = await getCourse(params.slug);

  if (!course) {
    notFound();
  }

  const isPaidCourse = typeof course.price === 'number' && course.price > 0;

  const isEnrolled = session?.user
    ? !!(await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: course.id,
          },
        },
      }))
    : false;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-primary hover:text-primary hover:text-opacity-80 font-medium mb-6 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform" />
          Voltar para cursos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            {course.thumbnail && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent bg-opacity-20 rounded-2xl" />
                <div className="w-full h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary border-opacity-10 group-hover:shadow-3xl transition-all duration-500">
                  <img
                    src={course.thumbnail ?? undefined}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-theme text-white shadow-xl backdrop-blur-sm">
                    {course.category.name}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {!course.thumbnail && (
                <div className="mb-4">
                  <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-theme text-white shadow-lg">
                    {course.category.name}
                  </span>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-theme-triple leading-tight">
                {course.title}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </div>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                  {course.level && (
                    <div className="flex flex-col items-center justify-center p-3 bg-muted bg-opacity-50 rounded-xl">
                      <Signal className="h-5 w-5 text-primary mb-2" />
                      <span className="text-sm font-semibold text-center">
                        {course.level}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center p-3 bg-muted bg-opacity-50 rounded-xl">
                    <Clock className="h-5 w-5 text-primary mb-2" />
                    <span className="text-sm font-semibold text-center">
                      {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted bg-opacity-50 rounded-xl">
                    <Users className="h-5 w-5 text-primary mb-2" />
                    <span className="text-sm font-semibold text-center">
                      {course._count.enrollments} alunos
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted bg-opacity-50 rounded-xl">
                    <PlayCircle className="h-5 w-5 text-primary mb-2" />
                    <span className="text-sm font-semibold text-center">
                      {totalLessons} aulas
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted bg-opacity-50 rounded-xl">
                    <BookOpen className="h-5 w-5 text-primary mb-2" />
                    <span className="text-sm font-semibold text-center">
                      {course.modules.length} modulos
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {course.whatYouLearn && (
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="h-2 bg-gradient-theme" />
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-gradient-theme rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    O que voce vai aprender
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.whatYouLearn.split(',').map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-muted bg-opacity-30 rounded-lg hover:bg-muted hover:bg-opacity-50 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {item.trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.requirements && (
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    Requisitos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {course.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-gradient-theme rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  Conteúdo do Curso
                </CardTitle>
                <CardDescription className="text-base font-medium mt-2">
                  {course.modules.length} módulos • {totalLessons} aulas •{' '}
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <div
                      key={module.id}
                      className="border-2 rounded-xl p-5 bg-gradient-to-br from-card to-muted bg-opacity-20 hover:border-primary hover:border-opacity-30 transition-all"
                    >
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary bg-opacity-10 text-primary text-sm font-bold">
                          {moduleIndex + 1}
                        </span>
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mb-4 pl-9">
                          {module.description}
                        </p>
                      )}
                      <div className="space-y-2 pl-9">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted bg-opacity-40 hover:bg-muted hover:bg-opacity-60 transition-colors border"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {lessonIndex + 1}. {lesson.title}
                              </span>
                              {lesson.isFree && (
                                <span className="text-xs px-2 py-1 rounded-md bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold flex-shrink-0">
                                  Grátis
                                </span>
                              )}
                            </div>
                            {lesson.duration && (
                              <span className="text-sm text-muted-foreground font-medium flex-shrink-0 ml-3">
                                {Math.floor(lesson.duration / 60)}:
                                {String(lesson.duration % 60).padStart(2, '0')}
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

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  Instrutor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-5">
                  {course.instructor.avatar ? (
                    <img
                      src={course.instructor.avatar ?? undefined}
                      alt={course.instructor.name}
                      className="h-20 w-20 rounded-2xl object-cover border-2 border-primary border-opacity-20 shadow-lg"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-gradient-theme flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                      {course.instructor.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl mb-2">
                      {course.instructor.name}
                    </h3>
                    {course.instructor.bio && (
                      <p className="text-muted-foreground leading-relaxed">
                        {course.instructor.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-4 border-2 shadow-2xl hover:shadow-3xl transition-all overflow-hidden">
              <div className="h-2 bg-gradient-theme" />
              <CardHeader className="text-center space-y-4">
                <div className="inline-flex w-full flex-col items-center justify-center p-6 bg-muted rounded-2xl border-2">
                  {isPaidCourse ? (
                    <>
                      <div className="text-4xl sm:text-5xl font-black text-gradient-theme mb-2">
                        R$ {(course.price || 0).toFixed(2)}
                      </div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Pagamento único
                      </p>
                    </>
                  ) : (
                    <div className="text-4xl sm:text-5xl font-black text-gradient-theme">
                      GRATUITO
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5 sm:space-y-6">
                {isEnrolled ? (
                  <Button
                    asChild
                    className="w-full bg-gradient-theme text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    size="lg"
                  >
                    <Link href={`/student/courses/${course.id}`}>
                      <PlayCircle className="h-5 w-5 mr-2" />
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
                        <Button
                          type="submit"
                          className="w-full bg-gradient-theme text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                          size="lg"
                        >
                          <Award className="h-5 w-5 mr-2" />
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
                      <Button
                        type="submit"
                        className="w-full bg-gradient-theme text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                        size="lg"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Matricular-se Agora
                      </Button>
                    </form>
                  )
                ) : (
                  <Button
                    asChild
                    className="w-full bg-gradient-theme text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    size="lg"
                  >
                    <Link href="/login">Fazer Login para Matricular</Link>
                  </Button>
                )}

                <div className="pt-5 border-t-2 space-y-3">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                    Este curso inclui
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-3 bg-muted bg-opacity-30 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Módulos
                      </span>
                      <span className="font-bold text-lg">
                        {course.modules.length}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted bg-opacity-30 rounded-lg">
                      <PlayCircle className="h-5 w-5 text-primary mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Aulas
                      </span>
                      <span className="font-bold text-lg">{totalLessons}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted bg-opacity-30 rounded-lg">
                      <Clock className="h-5 w-5 text-primary mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Duração
                      </span>
                      <span className="font-bold text-lg">
                        {Math.floor(totalDuration / 60)}h
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted bg-opacity-30 rounded-lg">
                      <Signal className="h-5 w-5 text-primary mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Nível
                      </span>
                      <span className="font-bold text-sm">
                        {course.level || 'Todos'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t-2 space-y-3">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                    Benefícios
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 dark:bg-opacity-20 rounded-lg border border-green-200 dark:border-green-900">
                      <Award className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Certificado de conclusão
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 dark:bg-opacity-20 rounded-lg border border-blue-200 dark:border-blue-900">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Materiais de apoio
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 dark:bg-opacity-20 rounded-lg border border-purple-200 dark:border-purple-900">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Acesso vitalício
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
