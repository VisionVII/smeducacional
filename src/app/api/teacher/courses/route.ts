import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  listTeacherCoursesWithCounts,
  createTeacherCourse,
} from '@/lib/services/course.service';
import { z } from 'zod';

// Schema para criação de curso pelo professor
const createCourseSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória').max(5000),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  level: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status');
    const category = searchParams.get('category') || undefined;
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Math.min(Number(searchParams.get('pageSize') || '20'), 50);
    const { data, total } = await listTeacherCoursesWithCounts({
      instructorId: session.user.id,
      search,
      status: (status as 'PUBLISHED' | 'DRAFT' | null) || null,
      category: category || null,
      page,
      pageSize,
    });

    return NextResponse.json({ data, page, pageSize, total });
  } catch (error) {
    console.error('[teacher][courses] GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar cursos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const result = createCourseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    const { title, description, categoryId, level, thumbnail } = result.data;

    // Gerar slug único a partir do título
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    let slug = baseSlug || `curso-${Date.now()}`;
    let counter = 1;
    // Garantir unicidade do slug
    while (true) {
      const exists = await prisma.course.findUnique({ where: { slug } });
      if (!exists) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const course = await createTeacherCourse({
      title,
      description,
      categoryId,
      level,
      thumbnail,
      instructorId: session.user.id,
      slug,
    });

    return NextResponse.json(
      {
        data: course,
        message: 'Curso criado como rascunho',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[teacher][courses] POST error:', error);
    return NextResponse.json({ error: 'Erro ao criar curso' }, { status: 500 });
  }
}
