import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
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
import { type Locale } from '@/lib/locales';

type CourseParams = { slug: string };

async function getPageTranslations() {
  // i18n desativado: força locale pt-BR independentemente de cookies
  const locale: Locale = 'pt-BR';
  // Importar dinâmico da cache já construída em translations-provider
  const { translationsMap } = await import(
    '@/components/translations-provider'
  );
  return { locale, t: translationsMap[locale] };
}

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
  params: Promise<CourseParams>;
}) {
  const resolvedParams = await params;
  const session = await auth();
  const course = await getCourse(resolvedParams.slug);
  const { locale, t } = await getPageTranslations();
  const courseT = t.courseDetail;

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

  const courseContentMeta = courseT.courseContent.meta
    .replace('{modules}', course.modules.length.toString())
    .replace('{lessons}', totalLessons.toString())
    .replace('{hours}', Math.floor(totalDuration / 60).toString())
    .replace('{minutes}', String(totalDuration % 60).padStart(2, '0'));

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Breadcrumb */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium transition-colors group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {courseT.breadcrumb}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Conteúdo Principal - Coluna Esquerda (2/3) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Header do Curso */}
            <div className="space-y-4">
              {/* Thumbnail */}
              {course.thumbnail && (
                <div className="relative group overflow-hidden rounded-2xl border-2 border-border shadow-xl">
                  <div className="aspect-video w-full">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 1280px"
                    />
                  </div>
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badge Categoria */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-lg backdrop-blur-sm border border-white/10">
                      {course.category.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Título e Descrição */}
              <div className="space-y-3">
                {!course.thumbnail && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-lg">
                    {course.category.name}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight">
                  {course.title}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <Card className="border-2 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {course.level && (
                    <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-muted/50 rounded-xl border transition-colors hover:bg-muted">
                      <Signal className="h-5 w-5 text-primary mb-1.5" />
                      <span className="text-xs text-muted-foreground mb-1">
                        {courseT.stats.level}
                      </span>
                      <span className="text-sm font-bold">{course.level}</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-muted/50 rounded-xl border transition-colors hover:bg-muted">
                    <Clock className="h-5 w-5 text-primary mb-1.5" />
                    <span className="text-xs text-muted-foreground mb-1">
                      {courseT.stats.duration}
                    </span>
                    <span className="text-sm font-bold">
                      {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-muted/50 rounded-xl border transition-colors hover:bg-muted">
                    <Users className="h-5 w-5 text-primary mb-1.5" />
                    <span className="text-xs text-muted-foreground mb-1">
                      {courseT.stats.students}
                    </span>
                    <span className="text-sm font-bold">
                      {course._count.enrollments}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-muted/50 rounded-xl border transition-colors hover:bg-muted">
                    <PlayCircle className="h-5 w-5 text-primary mb-1.5" />
                    <span className="text-xs text-muted-foreground mb-1">
                      {courseT.stats.lessons}
                    </span>
                    <span className="text-sm font-bold">{totalLessons}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-muted/50 rounded-xl border transition-colors hover:bg-muted">
                    <BookOpen className="h-5 w-5 text-primary mb-1.5" />
                    <span className="text-xs text-muted-foreground mb-1">
                      {courseT.stats.modules}
                    </span>
                    <span className="text-sm font-bold">
                      {course.modules.length}
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
                    {courseT.whatYouLearn}
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
                    {courseT.requirements}
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
                  {courseT.courseContent.title}
                </CardTitle>
                <CardDescription className="text-base font-medium mt-2">
                  {courseContentMeta}
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
                                  {courseT.badges.free}
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
                  {courseT.instructor}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-5">
                  {course.instructor.avatar ? (
                    <Image
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      width={80}
                      height={80}
                      className="rounded-2xl object-cover border-2 border-primary border-opacity-20 shadow-lg"
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
          {/* Sidebar - Coluna Direita (1/3) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Card de Compra/Preço */}
              <Card className="border-2 shadow-xl overflow-hidden">
                {/* Accent Bar */}
                <div className="h-1 bg-primary" />

                <CardHeader className="pb-4">
                  {/* Preço */}
                  <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl border-2 border-primary/10">
                    {isPaidCourse ? (
                      <>
                        <div className="text-5xl font-black text-primary mb-1">
                          {currencyFormatter.format(course.price || 0)}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {courseT.price.oneTime}
                        </p>
                      </>
                    ) : (
                      <div className="text-5xl font-black text-green-600">
                        {courseT.price.freeLabel}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Botões de Ação */}
                  {isEnrolled ? (
                    <Button
                      asChild
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <Link href={`/student/courses/${course.id}`}>
                        <PlayCircle className="h-5 w-5 mr-2" />
                        {courseT.actions.continue}
                      </Link>
                    </Button>
                  ) : session?.user ? (
                    isPaidCourse ? (
                      <div className="space-y-3">
                        <CheckoutButton
                          courseId={course.id}
                          price={course.price}
                          isPaid={true}
                          isEnrolled={false}
                        />
                        {/* Aviso de Curso Bloqueado */}
                        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-orange-900 dark:text-orange-100 mb-1">
                                {courseT.locked.title}
                              </h4>
                              <p className="text-xs text-orange-700 dark:text-orange-300">
                                {courseT.locked.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form
                        action={`/api/courses/${course.id}/enroll`}
                        method="POST"
                      >
                        <Button
                          type="submit"
                          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all"
                          size="lg"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          {courseT.actions.enroll}
                        </Button>
                      </form>
                    )
                  ) : (
                    <Button
                      asChild
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <Link href="/login">{courseT.actions.login}</Link>
                    </Button>
                  )}

                  {/* Recursos Incluídos */}
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      {courseT.includes.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                        <BookOpen className="h-4 w-4 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground">
                          {courseT.includes.modules}
                        </span>
                        <span className="font-bold text-sm">
                          {course.modules.length}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                        <PlayCircle className="h-4 w-4 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground">
                          {courseT.includes.lessons}
                        </span>
                        <span className="font-bold text-sm">
                          {totalLessons}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                        <Clock className="h-4 w-4 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground">
                          {courseT.includes.duration}
                        </span>
                        <span className="font-bold text-sm">
                          {Math.floor(totalDuration / 60)}h
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                        <Signal className="h-4 w-4 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground">
                          {courseT.includes.level}
                        </span>
                        <span className="font-bold text-sm">
                          {course.level || courseT.includes.allLevels}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      {courseT.benefits.title}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                        <Award className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                        <span className="text-xs font-medium">
                          {courseT.benefits.certificate}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-medium">
                          {courseT.benefits.materials}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                        <Clock className="h-4 w-4 text-purple-600 dark:text-purple-500 flex-shrink-0" />
                        <span className="text-xs font-medium">
                          {courseT.benefits.lifetime}
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
    </div>
  );
}
