import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { isCompleted = true, watchTime = 0, lastPosition = 0 } = body;
    // Verificar se a aula existe
    const lesson = await prisma.lesson.findUnique({
      where: { id: id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se está matriculado no curso
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Você não está matriculado neste curso' },
        { status: 403 }
      );
    }

    // Criar ou atualizar progresso
    const progress = await prisma.progress.upsert({
      where: {
        studentId_lessonId: {
          studentId: session.user.id,
          lessonId: id,
        },
      },
      update: {
        isCompleted,
        watchTime,
        lastPosition,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        studentId: session.user.id,
        lessonId: id,
        isCompleted,
        watchTime,
        lastPosition,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Recalcular progresso do curso
    const allLessons = await prisma.lesson.findMany({
      where: {
        module: {
          courseId: lesson.module.courseId,
        },
      },
    });

    const completedLessons = await prisma.progress.count({
      where: {
        studentId: session.user.id,
        isCompleted: true,
        lesson: {
          module: {
            courseId: lesson.module.courseId,
          },
        },
      },
    });

    const courseProgress = (completedLessons / allLessons.length) * 100;

    // Atualizar progresso do enrollment
    await prisma.enrollment.update({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: lesson.module.courseId,
        },
      },
      data: {
        progress: courseProgress,
        status: courseProgress === 100 ? 'COMPLETED' : 'ACTIVE',
        completedAt: courseProgress === 100 ? new Date() : null,
      },
    });

    // Se completou o curso, gerar certificado
    if (courseProgress === 100) {
      const existingCertificate = await prisma.certificate.findFirst({
        where: {
          studentId: session.user.id,
          courseId: lesson.module.courseId,
        },
      });

      if (!existingCertificate) {
        const certificateNumber = `CERT-${Date.now()}-${session.user.id.slice(
          0,
          8
        )}`;

        await prisma.certificate.create({
          data: {
            certificateNumber,
            studentId: session.user.id,
            courseId: lesson.module.courseId,
          },
        });

        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'COURSE',
            title: 'Parabéns! Curso concluído',
            message: `Você concluiu o curso "${lesson.module.course.title}" e pode baixar seu certificado!`,
          },
        });
      }
    }

    return NextResponse.json({
      progress,
      courseProgress: Math.round(courseProgress),
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar progresso' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const progress = await prisma.progress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: session.user.id,
          lessonId: id,
        },
      },
    });

    return NextResponse.json({ progress: progress || null });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar progresso' },
      { status: 500 }
    );
  }
}
