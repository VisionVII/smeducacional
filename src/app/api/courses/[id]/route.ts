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
  price: z.number().min(0, 'Preço não pode ser negativo').optional(),
  compareAtPrice: z
    .union([
      z.number().min(0, 'Preço comparativo não pode ser negativo'),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  isPaid: z.boolean().optional(),
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

    const validatedData = validation.data;

    // Se estiver alterando o slug, verificar se não existe outro curso com esse slug
    if (validatedData.slug && validatedData.slug !== course.slug) {
      const existingCourse = await prisma.course.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingCourse) {
        return NextResponse.json(
          { error: 'Já existe um curso com este slug' },
          { status: 400 }
        );
      }
    }

    // Se estiver alterando a categoria, verificar se ela existe
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
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
      data: validatedData,
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
    return NextResponse.json(
      { error: 'Erro ao atualizar curso' },
      { status: 500 }
    );
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
