import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateFeaturedSchema = z.object({
  isFeatured: z.boolean(),
});

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+)
    const params = await context.params;
    console.log('[API FEATURED] Iniciando PUT para curso:', params.id);

    // 1. Auth check
    const session = await auth();
    if (!session) {
      console.error('[API FEATURED] Sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('[API FEATURED] Usuário autenticado:', session.user.email);

    // 2. Role check - apenas ADMIN
    if (session.user.role !== 'ADMIN') {
      console.error('[API FEATURED] Acesso negado - role:', session.user.role);
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // 3. Parse body
    const body = await req.json();
    console.log('[API FEATURED] Body recebido:', body);

    // 4. Validate with Zod
    const result = updateFeaturedSchema.safeParse(body);
    if (!result.success) {
      console.error('[API FEATURED] Validação falhou:', result.error);
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { isFeatured } = result.data;
    console.log('[API FEATURED] Novo estado:', isFeatured);

    // 5. Verificar que o curso existe
    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      console.error('[API FEATURED] Curso não encontrado:', params.id);
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    console.log(
      '[API FEATURED] Curso encontrado:',
      course.title,
      '- Estado atual isFeatured:',
      course.isFeatured
    );

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

    console.log(
      '[API FEATURED] Curso atualizado com sucesso:',
      updatedCourse.title,
      '- Novo estado:',
      updatedCourse.isFeatured
    );

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
