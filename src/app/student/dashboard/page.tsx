import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, Award, Clock, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientText } from './client-text';

export default async function StudentDashboard() {
  const session = await auth();
  const user = session!.user;

  // i18n (client bridge)
  // Nota: labels de UI serão renderizadas via client wrapper leve abaixo

  // Buscar dados do aluno
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      },
    },
  });

  const certificates = await prisma.certificate.count({
    where: { studentId: user.id },
  });

  const stats = {
    activeCourses: enrollments.filter((e) => e.status === 'ACTIVE').length,
    completedCourses: enrollments.filter((e) => e.status === 'COMPLETED')
      .length,
    certificates,
    totalHours: 0, // TODO: Calcular horas reais de estudo
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Header */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[200px]"></div>
          <CardContent className="px-4 sm:px-6 py-6 relative z-10">
            <div className="flex items-center gap-4">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                <ClientText path="dashboard.systemOnline" />
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gradient-theme-triple mt-4">
              <ClientText
                path="dashboard.student.greeting"
                variables={{ name: user.name || '' }}
              />
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              <ClientText path="dashboard.student.subtitle" />
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                <ClientText path="dashboard.student.stats.activeCourses" />
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
              <div className="text-xl sm:text-2xl font-bold">
                {stats.activeCourses}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                <ClientText path="dashboard.student.stats.inProgress" />
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                <ClientText path="dashboard.student.stats.completedCourses" />
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{stats.completedCourses}</div>
              <p className="text-xs text-muted-foreground">
                <ClientText path="dashboard.student.stats.completeCourses" />
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                <ClientText path="dashboard.student.stats.certificates" />
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{stats.certificates}</div>
              <p className="text-xs text-muted-foreground">
                <ClientText path="dashboard.student.stats.earned" />
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                <ClientText path="dashboard.student.stats.studyHours" />
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{stats.totalHours}h</div>
              <p className="text-xs text-muted-foreground">
                <ClientText path="dashboard.student.stats.totalTime" />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cursos em Andamento */}
        <Card className="mb-6 sm:mb-8 border-2 hover:border-primary/30 transition-all">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-base sm:text-lg text-gradient-theme">
              <ClientText path="dashboard.student.continueLearning" />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              <ClientText path="dashboard.student.coursesInProgress" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  <ClientText path="dashboard.student.empty.noCourses" />
                </h3>
                <p className="text-muted-foreground mb-4">
                  <ClientText path="dashboard.student.empty.exploreText" />
                </p>
                <Button
                  asChild
                  className="bg-gradient-theme hover:bg-gradient-theme-soft transition-opacity"
                >
                  <Link href="/courses">
                    <ClientText path="dashboard.student.empty.exploreCourses" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {enrollments?.slice(0, 6).map((enrollment) => (
                  <Card
                    key={enrollment.id}
                    className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-base line-clamp-2">
                        {enrollment.course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {enrollment.course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            <ClientText path="dashboard.student.progress" />
                          </span>
                          <span className="font-medium">
                            {Math.round(enrollment.progress)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        asChild
                        className="w-full bg-gradient-theme hover:bg-gradient-theme-soft group-hover:scale-105 transition-all duration-300"
                        size="sm"
                      >
                        <Link href={`/student/courses/${enrollment.course.id}`}>
                          <ClientText path="dashboard.student.continueCourse" />
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
