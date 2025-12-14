import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/student/courses
 * Retorna todos os cursos em que o aluno está matriculado
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            duration: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Transformar para o formato esperado
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Contar lições completas
        const totalLessons = await prisma.lesson.count({
          where: {
            module: {
              courseId: enrollment.courseId,
            },
          },
        });

        const completedLessons = await prisma.progress.count({
          where: {
            studentId: session.user.id,
            isCompleted: true,
            lesson: {
              module: {
                courseId: enrollment.courseId,
              },
            },
          },
        });

        return {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          thumbnail: enrollment.course.thumbnail,
          progress: enrollment.progress,
          totalLessons,
          completedLessons,
          estimatedHours: Math.ceil((enrollment.course.duration || 0) / 60),
        };
      })
    );

    return NextResponse.json(courses);
  } catch (error) {
    console.error('[/api/student/courses] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cursos' },
      { status: 500 }
    );
  }
}
