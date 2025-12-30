import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  logAuditTrail,
  AuditAction,
  getClientIpFromRequest,
} from '@/lib/audit.service';

/**
 * DELETE /api/admin/courses/[id]
 * Soft delete de um curso (apenas ADMIN)
 * Nota: TODO - Cleanup bucket assets. Após 30 dias de soft delete, remover arquivos de vídeo/material do Supabase Storage
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // RBAC: Apenas ADMIN pode deletar cursos
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        instructorId: true,
        deletedAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
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

    // Verificar se há matrículas ativas
    if (course._count.enrollments > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir o curso "${course.title}" pois existem ${course._count.enrollments} alunos matriculados`,
        },
        { status: 400 }
      );
    }

    // Soft delete: marcar como deletado ao invés de remover
    const deletedCourse = await prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, title: true },
    });

    // Registrar auditoria de deleção
    const ipAddress = getClientIpFromRequest(request);
    await logAuditTrail({
      userId: session.user.id,
      action: AuditAction.COURSE_DELETED,
      targetId: id,
      targetType: 'Course',
      metadata: {
        deletedTitle: course.title,
        instructorId: course.instructorId,
      },
      ipAddress,
    });

    console.log(
      `[admin][courses][delete] Soft delete do curso "${course.title}" por ${session.user.email}`
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
    console.error('[admin][courses][delete] Erro ao excluir curso:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir curso' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/courses/[id]
 * Atualiza informações de um curso (apenas ADMIN)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Atualizar curso
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        level: body.level,
        isPublished: body.published,
        thumbnail: body.thumbnail,
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      message: 'Curso atualizado com sucesso',
    });
  } catch (error) {
    console.error('[admin][courses][update] Erro ao atualizar curso:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar curso' },
      { status: 500 }
    );
  }
}
