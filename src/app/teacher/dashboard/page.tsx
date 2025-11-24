import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, TrendingUp, MessageSquare, Home, Library, Settings, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function TeacherDashboard() {
  const session = await auth();
  const user = session!.user;

  // Buscar cursos do professor
  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: {
      enrollments: true,
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
  });

  const totalStudents = courses.reduce((acc, course) => acc + course._count.enrollments, 0);
  const totalModules = courses.reduce((acc, course) => acc + course._count.modules, 0);

  const stats = {
    totalCourses: courses.length,
    totalStudents,
    totalModules,
    avgEngagement: Math.round(Math.random() * 100), // Placeholder
  };



  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Área do Professor</h1>
            <p className="text-muted-foreground">
              Gerencie seus cursos e interaja com seus alunos
            </p>
          </div>
          <Button asChild>
            <Link href="/teacher/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Cursos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                cursos criados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Alunos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                alunos matriculados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Módulos Criados
              </CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalModules}</div>
              <p className="text-xs text-muted-foreground">
                conteúdo publicado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Engajamento
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgEngagement}%</div>
              <p className="text-xs text-muted-foreground">
                taxa média
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cursos do Professor */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Cursos</CardTitle>
            <CardDescription>
              Gerencie o conteúdo dos seus cursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Você ainda não criou nenhum curso
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece a compartilhar seu conhecimento criando seu primeiro curso!
                </p>
                <Button asChild>
                  <Link href="/teacher/courses/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Curso
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <span className={`text-xs px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {course.isPublished ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-muted-foreground">
                          {course._count.enrollments} alunos
                        </span>
                        <span className="text-muted-foreground">
                          {course._count.modules} módulos
                        </span>
                      </div>
                      <Button asChild className="w-full" size="sm">
                        <Link href={`/teacher/courses/${course.id}/content`}>
                          Gerenciar
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
