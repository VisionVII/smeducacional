import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createModuleSchema = z.object({
  title: z.string().min(2, 'Título deve ter no mínimo 2 caracteres').max(200),
  order: z.number().int().min(1).optional(),
});

export async function POST(
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

    const { id: courseId } = await params;

    // Checar ownership do curso
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }
    if (course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sem permissão neste curso' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createModuleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Definir ordem
    const nextOrder =
      result.data.order ??
      (await prisma.module.count({ where: { courseId } })) + 1;

    const createdModule = await prisma.module.create({
      data: {
        title: result.data.title,
        order: nextOrder,
        courseId,
      },
      select: { id: true, title: true, order: true },
    });

    return NextResponse.json(
      { data: createdModule, message: 'Módulo criado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[teacher][modules] POST error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar módulo' },
      { status: 500 }
    );
  }
}
