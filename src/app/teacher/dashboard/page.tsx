import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  Users,
  TrendingUp,
  MessageSquare,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  FileText,
  Video,
  Calendar,
  Target,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileHeader } from '@/components/teacher/profile-header';
import { StatsCard } from '@/components/teacher/stats-card';

export default async function TeacherDashboard() {
  const session = await auth();
  const user = session!.user;

  // Buscar dados do professor
  const professor = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });

  // Buscar cursos do professor com estatísticas
  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          studentId: true,
        },
      },
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
  });

  // Buscar mensagens não lidas
  const pendingMessages = await prisma.message.count({
    where: {
      receiverId: user.id,
      isRead: false,
    },
  });

  // Calcular estatísticas
  const totalStudents = courses.reduce(
    (acc, course) => acc + course._count.enrollments,
    0
  );
  const totalModules = courses.reduce(
    (acc, course) => acc + course._count.modules,
    0
  );
  const totalLessons = courses.reduce(
    (acc, course) =>
      acc +
      course.modules.reduce((modAcc, mod) => modAcc + mod.lessons.length, 0),
    0
  );
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.filter((c) => !c.isPublished).length;

  // Calcular taxa de conclusão de perfil
  const profileFields = [professor?.name, professor?.email, professor?.avatar];
  const completedFields = profileFields.filter((field) => field).length;
  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  // Cursos recentes
  const recentCourses = courses.slice(0, 3);

  const stats = {
    totalCourses: courses.length,
    publishedCourses,
    draftCourses,
    totalStudents,
    totalModules,
    totalLessons,
    pendingMessages,
    profileCompletion,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-all duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Hero Section - Perfil do Professor */}
        <ProfileHeader
          name={professor?.name || 'Professor'}
          email={professor?.email || ''}
          avatar={professor?.avatar}
          profileCompletion={profileCompletion}
          totalCourses={stats.totalCourses}
          totalStudents={stats.totalStudents}
          totalModules={stats.totalModules}
          totalLessons={stats.totalLessons}
        />

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <StatsCard
            title="Cursos Publicados"
            value={stats.publishedCourses}
            description={`${stats.draftCourses} em rascunho`}
            icon={BookOpen}
            iconColor="from-blue-500 to-blue-600"
          />

          <StatsCard
            title="Alunos Ativos"
            value={stats.totalStudents}
            description={`em ${stats.totalCourses} cursos`}
            icon={Users}
            iconColor="from-green-500 to-emerald-600"
          />

          <StatsCard
            title="Conteúdos"
            value={stats.totalLessons}
            description="aulas produzidas"
            icon={Video}
            iconColor="from-purple-500 to-purple-600"
          />

          <StatsCard
            title="Mensagens"
            value={stats.pendingMessages}
            description="pendentes de resposta"
            icon={MessageSquare}
            iconColor="from-orange-500 to-orange-600"
          />
        </div>

        {/* Grid Principal - Atuação e Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Coluna Esquerda - Atuação Pedagógica */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Meus Cursos */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 sm:px-6 lg:px-8 py-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl">
                    Atuação Pedagógica
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Gerencie seus cursos e conteúdos
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto shrink-0">
                  <Link href="/teacher/courses/new">Novo Curso</Link>
                </Button>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum curso criado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comece criando seu primeiro curso!
                    </p>
                    <Button asChild>
                      <Link href="/teacher/courses/new">Criar Curso</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCourses?.map((course) => (
                      <div
                        key={course.id}
                        className="group border-0 bg-gradient-to-br from-card to-muted/30 rounded-xl p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{course.title}</h3>
                              <Badge
                                variant={
                                  course.isPublished ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {course.isPublished ? 'Publicado' : 'Rascunho'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {course.category?.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course._count.enrollments} alunos
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course._count.modules} módulos
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {course.modules.reduce(
                              (acc, mod) => acc + mod.lessons.length,
                              0
                            )}{' '}
                            aulas
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Link
                              href={`/teacher/courses/${course.id}/content`}
                            >
                              Gerenciar Conteúdo
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/teacher/courses/${course.id}/students`}
                            >
                              Ver Alunos
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}

                    {courses.length > 3 && (
                      <Button asChild variant="ghost" className="w-full">
                        <Link href="/teacher/courses">
                          Ver Todos os Cursos ({courses.length})
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Atividades Recentes */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="px-5 sm:px-6 lg:px-8 py-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-gradient-theme rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Ações Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 sm:px-6 lg:px-8 pb-6">
                <div className="space-y-4">
                  {stats.draftCourses > 0 && (
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-xl border border-amber-200 dark:border-amber-900/30 hover:shadow-md transition-all duration-300">
                      <div className="p-2 bg-amber-500 rounded-lg shrink-0">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Cursos em rascunho
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Você tem {stats.draftCourses} curso(s) não
                          publicado(s)
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/teacher/courses">Revisar</Link>
                      </Button>
                    </div>
                  )}

                  {stats.pendingMessages > 0 && (
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200 dark:border-blue-900/30 hover:shadow-md transition-all duration-300">
                      <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Mensagens pendentes
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats.pendingMessages} mensagem(ns) aguardando
                          resposta
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/teacher/messages">Responder</Link>
                      </Button>
                    </div>
                  )}

                  {stats.draftCourses === 0 && stats.pendingMessages === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                      </div>
                      <p className="text-base font-medium mb-1">Tudo em dia!</p>
                      <p className="text-sm text-muted-foreground">
                        Nenhuma ação pendente no momento.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Insights & Widgets */}
          <div className="space-y-6">
            {/* Perfil - Conclusão */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-theme" />
              <CardHeader className="px-5 sm:px-6 py-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  Completude do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 sm:px-6 pb-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      Progresso
                    </span>
                    <span className="font-bold text-primary">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-theme rounded-full transition-all duration-500 ease-out shadow-lg"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Informações básicas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {professor?.avatar ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span>Foto de perfil</span>
                  </div>
                </div>

                <Button asChild size="sm" className="w-full" variant="outline">
                  <Link href="/teacher/profile">Completar Perfil</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500" />
              <CardHeader className="px-5 sm:px-6 py-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  Avaliação & Reputação
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 sm:px-6 pb-6 space-y-5">
                <div className="text-center py-6 bg-gradient-to-br from-muted/30 to-transparent rounded-xl">
                  <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    -
                  </div>
                  <div className="flex justify-center gap-1.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-theme"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ainda sem avaliações
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clareza</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organização</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Material</span>
                    <span>-</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comunicação */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500" />
              <CardHeader className="px-5 sm:px-6 py-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  </div>
                  Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Tempo de resposta
                  </span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Mensagens/semana
                  </span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Taxa de resposta
                  </span>
                  <span className="font-semibold">-</span>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="w-full mt-2"
                  variant="outline"
                >
                  <Link href="/teacher/messages">Ver Mensagens</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Acesso Rápido */}
            <Card className="transition-theme">
              <CardHeader>
                <CardTitle className="text-base">Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start transition-theme"
                  size="sm"
                >
                  <Link href="/teacher/courses/new">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Novo Curso
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start transition-theme"
                  size="sm"
                >
                  <Link href="/teacher/profile">
                    <FileText className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start transition-theme"
                  size="sm"
                >
                  <Link href="/teacher/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mensagens
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer - Insights Rápidos */}
        <Card className="bg-accent/50 transition-theme">
          <CardContent className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center text-xs sm:text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Perfil Concluído</p>
                <p className="text-xl font-bold">{profileCompletion}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Cursos Pendentes</p>
                <p className="text-xl font-bold">{stats.draftCourses}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Mensagens Pendentes</p>
                <p className="text-xl font-bold">{stats.pendingMessages}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Alunos Totais</p>
                <p className="text-xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
