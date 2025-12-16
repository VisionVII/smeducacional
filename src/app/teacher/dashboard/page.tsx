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
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    <div className="min-h-screen bg-background transition-theme">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section - Perfil do Professor */}
        <Card className="border-2 transition-theme">
          <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar e Info Principal */}
              <div className="flex gap-3 sm:gap-4 items-start w-full lg:w-auto">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-4 border-primary/10">
                  <AvatarImage src={professor?.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {professor?.name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {professor?.name}
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                      Professor | Educador Digital
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Ativo
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {profileCompletion}% Completo
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                    {professor?.email}
                  </p>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Link href="/teacher/profile">Editar Perfil</Link>
                  </Button>
                </div>
              </div>

              {/* Stats Rápidas */}
              <div className="w-full lg:ml-auto grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">
                    {stats.totalCourses}
                  </p>
                  <p className="text-xs text-muted-foreground">Cursos</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">
                    {stats.totalStudents}
                  </p>
                  <p className="text-xs text-muted-foreground">Alunos</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">
                    {stats.totalModules}
                  </p>
                  <p className="text-xs text-muted-foreground">Módulos</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">
                    {stats.totalLessons}
                  </p>
                  <p className="text-xs text-muted-foreground">Aulas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-all transition-theme">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cursos Publicados
              </CardTitle>
              <BookOpen className="h-4 w-4 text-primary transition-theme" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-xl sm:text-2xl font-bold">
                {stats.publishedCourses}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {stats.draftCourses} em rascunho
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all transition-theme">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alunos Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-primary transition-theme" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                em {stats.totalCourses} cursos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all transition-theme">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conteúdos</CardTitle>
              <Video className="h-4 w-4 text-primary transition-theme" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLessons}</div>
              <p className="text-xs text-muted-foreground">aulas produzidas</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all transition-theme">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary transition-theme" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingMessages}</div>
              <p className="text-xs text-muted-foreground">
                pendentes de resposta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grid Principal - Atuação e Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Coluna Esquerda - Atuação Pedagógica */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Meus Cursos */}
            <Card className="transition-theme">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-4 sm:py-5">
                <div>
                  <CardTitle>Atuação Pedagógica</CardTitle>
                  <CardDescription>
                    Gerencie seus cursos e conteúdos
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link href="/teacher/courses/new">Novo Curso</Link>
                </Button>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
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
                    {recentCourses.map((course) => (
                      <div
                        key={course.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors transition-theme"
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
            <Card className="transition-theme">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Ações Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.draftCourses > 0 && (
                    <div className="flex items-start gap-3 p-3 border rounded-lg transition-colors transition-theme">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5 transition-theme" />
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
                    <div className="flex items-start gap-3 p-3 border rounded-lg transition-colors transition-theme">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5 transition-theme" />
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
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <p className="text-sm">
                        Tudo em dia! Nenhuma ação pendente.
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
            <Card className="transition-theme">
              <CardHeader>
                <CardTitle className="text-base">
                  Completude do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden transition-theme">
                    <div
                      className="h-full bg-primary transition-all transition-theme"
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
            <Card className="transition-theme">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Avaliação & Reputação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold mb-1">-</div>
                  <div className="flex justify-center gap-1 mb-2">
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
            <Card className="transition-theme">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
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
