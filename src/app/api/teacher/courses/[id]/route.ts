import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  logAuditTrail,
  AuditAction,
  getClientIpFromRequest,
} from '@/lib/audit.service';
import { z } from 'zod';

const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  categoryId: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  thumbnail: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

async function ensureOwnership(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });
  if (!course) return { error: 'Curso não encontrado', status: 404 } as const;
  if (course.instructorId !== userId)
    return { error: 'Sem permissão neste curso', status: 403 } as const;
  return { ok: true } as const;
}

export async function GET(
  _req: NextRequest,
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
    const own = await ensureOwnership(id, session.user.id);
    if ('error' in own)
      return NextResponse.json({ error: own.error }, { status: own.status });

    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        categoryId: true,
        level: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            lessons: {
              select: {
                id: true,
                title: true,
                order: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: course });
  } catch (error) {
    console.error('[teacher][courses][id] GET error:', error);
    return NextResponse.json({ error: 'Erro ao obter curso' }, { status: 500 });
  }
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
    const own = await ensureOwnership(id, session.user.id);
    if ('error' in own)
      return NextResponse.json({ error: own.error }, { status: own.status });

    const body = await request.json();
    const result = updateCourseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title: result.data.title ?? undefined,
        description: result.data.description ?? undefined,
        categoryId: result.data.categoryId ?? undefined,
        level: result.data.level ?? undefined,
        thumbnail: result.data.thumbnail ?? undefined,
        isPublished: result.data.isPublished ?? undefined,
      },
      select: { id: true, title: true, description: true, isPublished: true },
    });

    return NextResponse.json({
      data: updated,
      message: 'Curso atualizado com sucesso',
    });
  } catch (error) {
    console.error('[teacher][courses][id] PUT error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar curso' },
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
    // RBAC: Apenas TEACHER e ADMIN
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    // RBAC: Validar ownership (TEACHER só pode deletar seus cursos)
    const own = await ensureOwnership(id, session.user.id);
    if ('error' in own)
      return NextResponse.json({ error: own.error }, { status: own.status });

    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já foi deletado
    if (course.deletedAt) {
      return NextResponse.json(
        { error: 'Este curso já foi deletado' },
        { status: 400 }
      );
    }

    if (course._count.enrollments > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir curso com alunos matriculados' },
        { status: 400 }
      );
    }

    // Soft delete: marcar como deletado
    const deletedCourse = await prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, title: true },
    });

    // Registrar auditoria
    const ipAddress = getClientIpFromRequest(request);
    await logAuditTrail({
      userId: session.user.id,
      action: AuditAction.COURSE_DELETED,
      targetId: id,
      targetType: 'Course',
      metadata: {
        deletedTitle: course.title,
      },
      ipAddress,
    });

    console.log(
      `[teacher][courses][delete] Soft delete do curso "${course.title}" por ${session.user.email}`
    );

    // TODO: Cleanup bucket assets
    // Remover arquivos do Supabase Storage (courses/{courseId}/*) após período de retenção

    return NextResponse.json({
      data: {
        success: true,
        message: `Curso "${course.title}" deletado com sucesso`,
      },
    });
  } catch (error) {
    console.error('[teacher][courses][id] DELETE error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir curso' },
      { status: 500 }
    );
  }
}
