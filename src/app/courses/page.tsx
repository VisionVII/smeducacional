import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Signal, Users } from 'lucide-react';

async function getCourses() {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      category: true,
      instructor: {
        select: {
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return courses;
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return categories;
}

function CourseCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="h-20 bg-gray-200 rounded"></div>
      </CardContent>
      <CardFooter>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </CardFooter>
    </Card>
  );
}

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([getCourses(), getCategories()]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Catálogo de Cursos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubra cursos incríveis e comece sua jornada de aprendizado hoje mesmo
          </p>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-4 mb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Categorias</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/courses?category=${category.slug}`}
                  className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {courses.length} {courses.length === 1 ? 'Curso Disponível' : 'Cursos Disponíveis'}
            </h2>
          </div>

          {courses.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Nenhum curso disponível</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Em breve teremos novos cursos para você!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Suspense fallback={<CourseCardSkeleton />}>
                {courses.map((course) => (
                  <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Thumbnail */}
                    {course.thumbnail ? (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {course.category.name}
                        </span>
                        {course.isPaid && (
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            R$ {course.price.toFixed(2)}
                          </span>
                        )}
                        {!course.isPaid && (
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            GRATUITO
                          </span>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        Por {course.instructor.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                        {course.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {course.level && (
                          <div className="flex items-center gap-1">
                            <Signal className="h-4 w-4" />
                            <span>{course.level}</span>
                          </div>
                        )}
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.floor(course.duration / 60)}h</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course._count.enrollments} alunos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course._count.modules} módulos</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course.slug}`}>Ver Curso</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </Suspense>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
