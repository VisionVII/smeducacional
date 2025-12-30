import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CoursesClientWrapper } from '@/components/teacher/courses-client-wrapper';

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

  const stats = {
    totalCourses,
    publishedCourses,
    draftCourses,
    totalStudents,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 sm:space-y-10">
        <CoursesClientWrapper courses={courses} stats={stats} />
      </div>
    </div>
  );
}
