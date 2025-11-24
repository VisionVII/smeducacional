import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para atualização de aula
const updateLessonSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  order: z.number().int().min(0).optional(),
  isFree: z.boolean().optional(),
  videoUrl: z.string().url().optional(),
  content: z.string().optional(),
});

// PUT /api/lessons/[id] - Atualizar aula
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
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

    // Verificar permissão
    if (
      lesson.module.course.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta aula' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateLessonSchema.parse(body);

    const updatedLesson = await prisma.lesson.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Registrar log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_LESSON',
        details: `Atualizou a aula "${updatedLesson.title}"`,
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar aula:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar aula' },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id] - Deletar aula
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
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

    // Verificar permissão
    if (
      lesson.module.course.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta aula' },
        { status: 403 }
      );
    }

    // Deletar a aula
    await prisma.lesson.delete({
      where: { id: params.id },
    });

    // Registrar log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_LESSON',
        details: `Deletou a aula "${lesson.title}"`,
      },
    });

    return NextResponse.json({ message: 'Aula deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aula:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar aula' },
      { status: 500 }
    );
  }
}
