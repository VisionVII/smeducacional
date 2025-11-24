import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Apenas alunos podem se matricular' },
        { status: 403 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
        isPublished: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já está matriculado
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: params.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Você já está matriculado neste curso' },
        { status: 400 }
      );
    }

    // Criar matrícula
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        courseId: params.id,
        status: 'ACTIVE',
        progress: 0,
      },
    });

    // Criar notificação
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'COURSE',
        title: 'Matrícula realizada!',
        message: `Você foi matriculado no curso "${course.title}"`,
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar matrícula:', error);
    return NextResponse.json(
      { error: 'Erro ao processar matrícula' },
      { status: 500 }
    );
  }
}
