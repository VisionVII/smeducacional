import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import {
  logAuditTrail,
  AuditAction,
  getClientIpFromRequest,
} from '@/lib/audit.service';

const updateModuleSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  order: z.number().int().min(1).optional(),
});

async function ensureModuleOwnership(moduleId: string, userId: string) {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, courseId: true },
  });
  if (!mod) return { error: 'Módulo não encontrado', status: 404 } as const;
  const course = await prisma.course.findUnique({
    where: { id: mod.courseId },
    select: { instructorId: true },
  });
  if (!course) return { error: 'Curso não encontrado', status: 404 } as const;
  if (course.instructorId !== userId)
    return { error: 'Sem permissão neste módulo', status: 403 } as const;
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
    const own = await ensureModuleOwnership(id, session.user.id);
    if ('error' in own)
      return NextResponse.json({ error: own.error }, { status: own.status });

    const body = await request.json();
    const result = updateModuleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    const updated = await prisma.module.update({
      where: { id },
      data: {
        title: result.data.title ?? undefined,
        order: result.data.order ?? undefined,
      },
      select: { id: true, title: true, order: true },
    });

    return NextResponse.json({
      data: updated,
      message: 'Módulo atualizado com sucesso',
    });
  } catch (error) {
    console.error('[teacher][modules][id] PUT error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar módulo' },
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
    const own = await ensureModuleOwnership(id, session.user.id);
    if ('error' in own)
      return NextResponse.json({ error: own.error }, { status: own.status });

    // Buscar módulo antes de deletar
    const module = await prisma.module.findUnique({
      where: { id },
      select: { id: true, title: true, courseId: true, deletedAt: true },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já foi deletado
    if (module.deletedAt) {
      return NextResponse.json(
        { error: 'Este módulo já foi deletado' },
        { status: 400 }
      );
    }

    // Soft delete ao invés de hard delete
    await prisma.module.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Registrar auditoria
    const ipAddress = getClientIpFromRequest(request);
    await logAuditTrail({
      userId: session.user.id,
      action: AuditAction.MODULE_DELETED,
      targetId: id,
      targetType: 'Module',
      metadata: { deletedTitle: module.title, courseId: module.courseId },
      ipAddress,
    });

    console.log(
      `[teacher][modules][delete] Soft delete do módulo "${module.title}" por ${session.user.email}`
    );

    // TODO: Cleanup bucket assets. Após 30 dias de soft delete, remover arquivos de vídeo/material do Supabase Storage

    return NextResponse.json({
      data: { success: true, message: 'Módulo excluído com sucesso' },
    });
  } catch (error) {
    console.error('[teacher][modules][id] DELETE error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir módulo' },
      { status: 500 }
    );
  }
}
