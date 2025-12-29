import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para atualização de curso
const updateCourseSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').optional(),
  slug: z.string().min(3, 'Slug deve ter no mínimo 3 caracteres').optional(),
  description: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .optional(),
  thumbnail: z
    .union([
      z.string().url('URL da thumbnail inválida'),
      z.string().length(0),
      z.undefined(),
    ])
    .optional(),
  duration: z.number().positive('Duração deve ser positiva').optional(),
  level: z
    .enum(['Iniciante', 'Intermediário', 'Avançado'], {
      errorMap: () => ({ message: 'Nível inválido' }),
    })
    .optional(),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  compareAtPrice: z
    .union([
      z.number().min(0, 'Preço comparativo não pode ser negativo'),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  isPublished: z.boolean().optional(),
  requirements: z.union([z.string(), z.undefined()]).optional(),
  whatYouLearn: z.union([z.string(), z.undefined()]).optional(),
  categoryId: z.string().optional(),
});

// GET /api/courses/[id] - Buscar curso por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const course = await prisma.course.findUnique({
      where: { id: resolvedParams.id },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
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

    return NextResponse.json(course);
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar curso' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Atualizar curso
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const course = await prisma.course.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Normalizar isPaid em tempo de resposta para evitar inconsistências antigas
    if (course && typeof course.price === 'number') {
      course.isPaid = course.price > 0;
    }

    // Verificar permissão: apenas o instrutor do curso ou admin pode editar
    if (
      course.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este curso' },
        { status: 403 }
      );
    }

    const body = await req.json();

    console.log('[API] Dados recebidos:', body);

    const validation = updateCourseSchema.safeParse(body);

    if (!validation.success) {
      console.error('[API] Erro de validação:', validation.error.errors);
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        {
          error: `${firstError.path.join('.')}: ${firstError.message}`,
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data as Record<string, unknown>;
    // Sanitizar: remover strings vazias e normalizar campos opcionais
    const dataToUpdate: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validatedData)) {
      if (value === undefined) continue;
      if (typeof value === 'string' && value.trim() === '') continue;
      // Evitar enviar categoryId vazio
      if (
        key === 'categoryId' &&
        typeof value === 'string' &&
        value.trim() === ''
      )
        continue;
      // Garantir números válidos
      if (typeof value === 'number' && Number.isNaN(value)) continue;
      dataToUpdate[key] = value;
    }
    console.log('[API] Dados normalizados para update:', dataToUpdate);
    const normalizedData = dataToUpdate as {
      price?: number;
      compareAtPrice?: number | null;
      slug?: string;
      categoryId?: string;
      isPaid?: boolean;
      [key: string]: unknown;
    };
    // ✅ CRÍTICO: Derivar isPaid automaticamente baseado no preço
    if (normalizedData.price !== undefined) {
      normalizedData.isPaid = normalizedData.price > 0;
      console.log(
        '[API] isPaid derivado:',
        normalizedData.isPaid,
        'baseado em price:',
        normalizedData.price
      );
    }

    // ✅ Validar compareAtPrice > price (se ambos estiverem presentes)
    if (
      normalizedData.compareAtPrice !== undefined &&
      normalizedData.compareAtPrice !== null
    ) {
      const priceToCompare =
        normalizedData.price !== undefined
          ? normalizedData.price
          : course.price ?? 0;
      if ((normalizedData.compareAtPrice as number) <= priceToCompare) {
        return NextResponse.json(
          { error: 'Preço comparativo deve ser maior que o preço atual' },
          { status: 400 }
        );
      }
    }

    // Se estiver alterando o slug, verificar se não existe outro curso com esse slug
    if (normalizedData.slug && normalizedData.slug !== course.slug) {
      const existingCourse = await prisma.course.findUnique({
        where: { slug: normalizedData.slug },
      });

      if (existingCourse) {
        return NextResponse.json(
          { error: 'Já existe um curso com este slug' },
          { status: 400 }
        );
      }
    }

    // Se estiver alterando a categoria, verificar se ela existe
    if (normalizedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: normalizedData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Categoria não encontrada' },
          { status: 404 }
        );
      }
    }

    // Atualizar o curso
    const updatedCourse = await prisma.course.update({
      where: { id: resolvedParams.id },
      data: normalizedData,
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_COURSE',
        details: `Atualizou o curso "${updatedCourse.title}"`,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar curso:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar curso';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/courses/[id] - Deletar curso
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const course = await prisma.course.findUnique({
      where: { id: resolvedParams.id },
      include: {
        enrollments: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão: apenas o instrutor do curso ou admin pode deletar
    if (
      course.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este curso' },
        { status: 403 }
      );
    }

    // Não permitir deletar curso com alunos matriculados
    if (course.enrollments.length > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível deletar um curso com alunos matriculados',
          enrollmentsCount: course.enrollments.length,
        },
        { status: 400 }
      );
    }

    // Deletar o curso (o Prisma irá deletar módulos e aulas em cascata)
    await prisma.course.delete({
      where: { id: resolvedParams.id },
    });

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_COURSE',
        details: `Deletou o curso "${course.title}"`,
      },
    });

    return NextResponse.json({ message: 'Curso deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar curso:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar curso' },
      { status: 500 }
    );
  }
}
