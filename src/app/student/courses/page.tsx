'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
}

export default function StudentCoursesPage() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['student-courses'],
    queryFn: async () => {
      const res = await fetch('/api/student/courses');
      if (!res.ok) throw new Error('Erro ao carregar cursos');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-gray-200 rounded mb-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-[1800px]">
        {/* Header Premium */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[200px]"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gradient-theme-triple">
                  Meus Cursos
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Continue seus estudos ou explore novos cursos
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {courses && courses.length === 0 ? (
          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full mb-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum curso encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não está matriculado em nenhum curso
              </p>
              <Button
                asChild
                className="bg-gradient-theme hover:bg-gradient-theme-soft"
              >
                <Link href="/courses">Explorar Cursos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses?.map((course) => (
              <Card
                key={course.id}
                className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[100px]"></div>
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-5 relative z-10">
                  <CardTitle className="text-base sm:text-lg line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
                  {course.thumbnail && (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      width={640}
                      height={360}
                      className="w-full h-40 object-cover rounded-md mb-4 group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  )}

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold">
                          {course.progress}%
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {course.completedLessons}/{course.totalLessons} aulas
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.estimatedHours}h</span>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="w-full min-h-[44px] bg-gradient-theme hover:bg-gradient-theme-soft"
                    >
                      <Link href={`/student/courses/${course.id}`}>
                        {course.progress > 0 ? 'Continuar' : 'Começar'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
