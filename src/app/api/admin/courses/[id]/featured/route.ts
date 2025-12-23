import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateFeaturedSchema = z.object({
  isFeatured: z.boolean(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Role check - apenas ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // 3. Parse body
    const body = await req.json();

    // 4. Validate with Zod
    const result = updateFeaturedSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { isFeatured } = result.data;

    // 5. Verificar que o curso existe
    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // 6. Atualizar
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        isFeatured,
        featuredAt: isFeatured ? new Date() : null,
      },
      include: {
        category: true,
        instructor: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: updatedCourse,
      message: isFeatured
        ? 'Curso promovido com sucesso'
        : 'Curso removido dos promovidos',
    });
  } catch (error) {
    console.error('[API /admin/courses/[id]/featured PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar curso' },
      { status: 500 }
    );
  }
}
