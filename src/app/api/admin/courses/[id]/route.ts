import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/admin/courses/[id]
 * Remove um curso do sistema (apenas ADMIN)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

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

    // Verificar se há matrículas ativas
    if (course._count.enrollments > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir o curso "${course.title}" pois existem ${course._count.enrollments} alunos matriculados`,
        },
        { status: 400 }
      );
    }

    // Deletar curso (Prisma cascade deleta módulos, lições, materiais, etc)
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Curso excluído com sucesso',
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
