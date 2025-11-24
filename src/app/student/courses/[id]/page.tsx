import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CoursePlayer } from '@/components/course-player';

async function getCourseWithProgress(courseId: string, studentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: {
                  order: 'asc',
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    return null;
  }

  // Buscar progresso das aulas
  const progress = await prisma.progress.findMany({
    where: {
      studentId,
      lesson: {
        module: {
          courseId,
        },
      },
    },
  });

  const progressMap = new Map(
    progress.map(p => [p.lessonId, p])
  );

  // Adicionar informação de conclusão nas aulas
  const modulesWithProgress = enrollment.course.modules.map(module => ({
    ...module,
    lessons: module.lessons.map(lesson => ({
      ...lesson,
      isCompleted: progressMap.get(lesson.id)?.isCompleted || false,
    })),
  }));

  return {
    enrollment,
    course: {
      ...enrollment.course,
      modules: modulesWithProgress,
    },
  };
}

export default async function StudentCoursePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  const resolvedParams = await params;
  const data = await getCourseWithProgress(resolvedParams.id, session.user.id);

  if (!data) {
    notFound();
  }

  const { course, enrollment } = data;

  return (
    <CoursePlayer
      courseId={course.id}
      courseTitle={course.title}
      modules={course.modules}
      progress={enrollment.progress}
    />
  );
}
