import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Verificar se o usuário está matriculado no curso
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Você não está matriculado neste curso' },
        { status: 403 }
      );
    }

    // Buscar progresso do aluno nas lições
    const progress = await prisma.progress.findMany({
      where: {
        studentId: session.user.id,
        lesson: {
          module: {
            courseId,
          },
        },
      },
      select: {
        lessonId: true,
        isCompleted: true,
        completedAt: true,
        updatedAt: true,
      },
    });

    // Transformar em um map para fácil lookup
    const progressMap = progress.reduce((acc, p) => {
      acc[p.lessonId] = {
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
        updatedAt: p.updatedAt,
      };
      return acc;
    }, {} as Record<string, { isCompleted: boolean; completedAt: Date | null; updatedAt: Date }>);

    return NextResponse.json({ data: progressMap });
  } catch (error) {
    console.error('[GET /api/courses/[id]/progress] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar progresso do curso' },
      { status: 500 }
    );
  }
}
