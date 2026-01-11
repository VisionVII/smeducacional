import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MultiCourseCheckout } from '@/components/checkout/multi-course-checkout';

interface MultiCheckoutPageProps {
  searchParams: Promise<{
    courses?: string;
  }>;
}

export default async function MultiCheckoutPage({
  searchParams,
}: MultiCheckoutPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const params = await searchParams;
  const courseIds = params.courses?.split(',').map((id) => id.trim()) || [];

  if (courseIds.length === 0) {
    redirect('/courses');
  }

  // Buscar cursos
  const courses = await prisma.course.findMany({
    where: {
      id: { in: courseIds },
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      price: true,
      compareAtPrice: true,
      instructor: {
        select: {
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  // Verificar se o usuário já está matriculado em algum curso
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: session.user.id,
      courseId: { in: courseIds },
    },
    select: {
      courseId: true,
    },
  });

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  // Filtrar cursos não matriculados
  const availableCourses = courses.filter(
    (course) => !enrolledCourseIds.has(course.id)
  );

  if (availableCourses.length === 0) {
    redirect('/student/courses');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MultiCourseCheckout courses={availableCourses} />
    </div>
  );
}
