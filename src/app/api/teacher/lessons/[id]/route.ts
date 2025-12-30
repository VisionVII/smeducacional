import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import {
  logAuditTrail,
  AuditAction,
  getClientIpFromRequest,
} from '@/lib/audit.service';

const updateLessonSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  order: z.number().int().min(1).optional(),
});

async function ensureLessonOwnership(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, moduleId: true },
  });
  if (!lesson) return { error: 'Lição não encontrada', status: 404 } as const;
  const mod = await prisma.module.findUnique({
    where: { id: lesson.moduleId },
    select: { id: true, courseId: true },
  });
  if (!mod) return { error: 'Módulo não encontrado', status: 404 } as const;
  const course = await prisma.course.findUnique({
    where: { id: mod.courseId },
    select: { instructorId: true },
  });
  if (!course) return { error: 'Curso não encontrado', status: 404 } as const;
  if (course.instructorId !== userId)
    return { error: 'Sem permissão nesta lição', status: 403 } as const;
  return { ok: true } as const;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    const own = await ensureLessonOwnership(id, session.user.id);
    if ('error' in own)
      return NextResponse.json({ error: own.error }, { status: own.status });

    const body = await request.json();
    const result = updateLessonSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        title: result.data.title ?? undefined,
        order: result.data.order ?? undefined,
      },
      select: { id: true, title: true, order: true },
    });

    return NextResponse.json({
      data: updated,
      message: 'Lição atualizada com sucesso',
    });
  } catch (error) {
    console.error('[teacher][lessons][id] PUT error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar lição' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    const own = await ensureLessonOwnership(id, session.user.id);
    if ('error' in own)
      return NextResponse.json({ error: own.error }, { status: own.status });

    // Buscar lição antes de deletar
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { id: true, title: true, moduleId: true, deletedAt: true },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lição não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já foi deletada
    if (lesson.deletedAt) {
      return NextResponse.json(
        { error: 'Esta lição já foi deletada' },
        { status: 400 }
      );
    }

    // Soft delete ao invés de hard delete
    await prisma.lesson.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Registrar auditoria
    const ipAddress = getClientIpFromRequest(request);
    await logAuditTrail({
      userId: session.user.id,
      action: AuditAction.LESSON_DELETED,
      targetId: id,
      targetType: 'Lesson',
      metadata: { deletedTitle: lesson.title, moduleId: lesson.moduleId },
      ipAddress,
    });

    console.log(
      `[teacher][lessons][delete] Soft delete da lição "${lesson.title}" por ${session.user.email}`
    );

    // TODO: Cleanup bucket assets. Após 30 dias de soft delete, remover arquivos de vídeo/material do Supabase Storage

    return NextResponse.json({
      data: { success: true, message: 'Lição excluída com sucesso' },
    });
  } catch (error) {
    console.error('[teacher][lessons][id] DELETE error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir lição' },
      { status: 500 }
    );
  }
}
