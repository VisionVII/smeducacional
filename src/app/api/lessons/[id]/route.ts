import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import {
  logAuditTrail,
  AuditAction,
  getClientIpFromRequest,
} from '@/lib/audit.service';

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
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
      where: { id },
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

// DELETE /api/lessons/[id] - Soft delete de aula
// Nota: TODO - Cleanup bucket assets. Após 30 dias de soft delete, remover arquivos de vídeo/material do Supabase Storage
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: { select: { instructorId: true } },
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

    // Verificar se já foi deletada (usando casting temporário até migração)
    if (
      'deletedAt' in lesson &&
      (lesson as { deletedAt?: Date | null }).deletedAt
    ) {
      return NextResponse.json(
        { error: 'Esta aula já foi deletada' },
        { status: 400 }
      );
    }

    // Soft delete ao invés de hard delete (usando casting temporário até migração)
    await prisma.lesson.update({
      where: { id },
      data: { deletedAt: new Date() } as never,
    });

    // Registrar auditoria
    const ipAddress = getClientIpFromRequest(request);
    await logAuditTrail({
      userId: session.user.id,
      action: AuditAction.LESSON_DELETED,
      targetId: id,
      targetType: 'Lesson',
      metadata: {
        deletedTitle: lesson.title,
        moduleId: lesson.moduleId,
        courseId: lesson.module.courseId,
      },
      ipAddress,
    });

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_LESSON',
        details: `Soft-deletou a aula "${lesson.title}"`,
      },
    });

    console.log(
      `[lessons][delete] Soft delete da aula "${lesson.title}" por ${session.user.email}`
    );

    return NextResponse.json({
      data: { success: true, message: 'Aula deletada com sucesso' },
    });
  } catch (error) {
    console.error('Erro ao deletar aula:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar aula' },
      { status: 500 }
    );
  }
}
