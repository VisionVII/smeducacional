import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  listCourses,
  findCourseBySlug,
  findCategoryById,
  createCourse,
} from '@/lib/services/course.service';
import { prisma } from '@/lib/db';

// Schema de validação para criação de curso
const createCourseSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  slug: z.string().min(3, 'Slug deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  thumbnail: z.string().url().optional(),
  duration: z.number().positive().optional(),
  level: z.enum(['Iniciante', 'Intermediário', 'Avançado']).optional(),
  price: z.number().min(0).default(0),
  isPaid: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  requirements: z.string().optional(),
  whatYouLearn: z.string().optional(),
  categoryId: z.string(),
});

// GET /api/courses - Listar cursos (com filtros)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const instructorId = searchParams.get('instructorId');
    const isPublished = searchParams.get('isPublished');
    const search = searchParams.get('search');

    const normalized = await listCourses({
      categoryId,
      instructorId,
      isPublished: isPublished !== null ? isPublished === 'true' : null,
      search,
    });

    return NextResponse.json(normalized, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cursos' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Criar novo curso
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas professores e admins podem criar cursos
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para criar cursos' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createCourseSchema.parse(body);

    // Verificar se o slug já existe
    const existingCourse = await findCourseBySlug(validatedData.slug);

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Já existe um curso com este slug' },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe
    const category = await findCategoryById(validatedData.categoryId);

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Criar o curso
    const course = await createCourse(validatedData, session.user.id);

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_COURSE',
        details: `Criou o curso "${course.title}"`,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar curso:', error);
    return NextResponse.json({ error: 'Erro ao criar curso' }, { status: 500 });
  }
}
