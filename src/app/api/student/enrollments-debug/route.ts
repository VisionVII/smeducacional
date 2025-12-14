import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT: Verifica os enrollments do aluno autenticado
 * Remover após testes!
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          error: 'Não autenticado',
          session: null,
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Buscar enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: true,
      },
    });

    // Buscar também o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      enrollmentCount: enrollments.length,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        courseId: e.courseId,
        courseTitle: e.course.title,
        status: e.status,
        progress: e.progress,
        enrolledAt: e.enrolledAt,
      })),
      totalEnrollmentsInDB: await prisma.enrollment.count(),
      totalCoursesInDB: await prisma.course.count(),
    });
  } catch (error) {
    console.error('[DEBUG] Erro ao buscar enrollments:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar dados',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
