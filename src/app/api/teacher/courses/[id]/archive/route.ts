import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  logAuditTrail,
  AuditAction,
  getClientIpFromRequest,
} from '@/lib/audit.service';
import { z } from 'zod';

const archiveSchema = z.object({
  isPublished: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Validar body
    const body = await req.json();
    const validation = archiveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { isPublished } = validation.data;

    // Buscar curso e verificar propriedade
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        instructorId: true,
        isPublished: true,
        deletedAt: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    if (course.deletedAt) {
      return NextResponse.json(
        { error: 'Este curso foi excluído' },
        { status: 400 }
      );
    }

    // Verificar se é o instrutor (ou admin)
    const isOwner = course.instructorId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Você não tem permissão para modificar este curso' },
        { status: 403 }
      );
    }

    // Atualizar status de publicação
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
      },
    });

    // Registrar auditoria
    const ipAddress = getClientIpFromRequest(req);
    await logAuditTrail({
      userId: session.user.id,
      action: isPublished
        ? AuditAction.COURSE_PUBLISHED
        : AuditAction.COURSE_UNPUBLISHED,
      targetId: courseId,
      targetType: 'Course',
      metadata: {
        courseTitle: course.title,
        enrollmentCount: course._count.enrollments,
        previousStatus: course.isPublished,
        newStatus: isPublished,
        userRole: session.user.role,
      },
      ipAddress,
    });

    console.log(
      `[teacher][courses][archive] Curso "${course.title}" ${
        isPublished ? 'republicado' : 'arquivado'
      } por ${session.user.email}`
    );

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      message: isPublished
        ? 'Curso republicado com sucesso'
        : 'Curso arquivado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar status do curso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
