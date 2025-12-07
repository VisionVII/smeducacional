import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Verificar se a atividade existe
    const activity = await prisma.activity.findUnique({
      where: { id: id },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Atividade não encontrada' },
        { status: 404 }
      );
    }

    // Buscar o módulo para verificar matrícula
    if (!activity.moduleId) {
      return NextResponse.json(
        { error: 'Atividade sem módulo associado' },
        { status: 400 }
      );
    }

    const moduleData = await prisma.module.findUnique({
      where: { id: activity.moduleId },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o aluno está matriculado
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: module.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Você não está matriculado neste curso' },
        { status: 403 }
      );
    }

    // Buscar submissão existente
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        studentId: session.user.id,
        activityId: params.id,
      },
    });

    let submission;
    if (existingSubmission) {
      // Atualizar submissão existente
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: data.content,
          fileUrl: data.fileUrl,
          submittedAt: new Date(),
        },
      });
    } else {
      // Criar nova submissão
      submission = await prisma.submission.create({
        data: {
          studentId: session.user.id,
          activityId: params.id,
          content: data.content,
          fileUrl: data.fileUrl,
        },
      });
    }

    // Notificar professor (creator da atividade)
    await prisma.notification.create({
      data: {
        userId: activity.createdById,
        title: 'Nova submissão de atividade',
        message: `${session.user.name} enviou a atividade "${activity.title}"`,
        type: 'ACTIVITY',
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Erro ao enviar atividade:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar atividade' },
      { status: 500 }
    );
  }
}
