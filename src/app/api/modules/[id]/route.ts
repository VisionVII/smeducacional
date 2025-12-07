import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para atualização de módulo
const updateModuleSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

// PUT /api/modules/[id] - Atualizar módulo
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
    const moduleData = await prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!moduleData) {
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (
      module.course.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este módulo' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateModuleSchema.parse(body);

    const updatedModule = await prisma.module.update({
      where: { id },
      data: validatedData,
      include: {
        lessons: true,
      },
    });

    // Registrar log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_MODULE',
        details: `Atualizou o módulo "${updatedModule.title}"`,
      },
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar módulo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar módulo' },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id] - Deletar módulo
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const moduleData = await prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
        lessons: true,
      },
    });

    if (!moduleData) {
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (
      moduleData.course.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este módulo' },
        { status: 403 }
      );
    }

    // Deletar o módulo (Prisma deletará as aulas em cascata)
    await prisma.module.delete({
      where: { id: params.id },
    });

    // Registrar log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_MODULE',
        details: `Deletou o módulo "${moduleData.title}" com ${moduleData.lessons.length} aulas`,
      },
    });

    return NextResponse.json({ message: 'Módulo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar módulo:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar módulo' },
      { status: 500 }
    );
  }
}
