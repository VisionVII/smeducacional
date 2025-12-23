import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

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
    const status = searchParams.get('status'); // DRAFT | PUBLISHED
    const category = searchParams.get('category') || undefined;
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Math.min(Number(searchParams.get('pageSize') || '20'), 50);

    const where: Prisma.CourseWhereInput = { instructorId: session.user.id };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'PUBLISHED') where.isPublished = true;
    if (status === 'DRAFT') where.isPublished = false;

    if (category) {
      where.categoryId = category;
    }

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          categoryId: true,
          level: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { modules: true, enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const data = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description || '',
      thumbnail: c.thumbnail,
      categoryId: c.categoryId || null,
      level: c.level || 'BEGINNER',
      status: c.isPublished ? 'PUBLISHED' : 'DRAFT',
      moduleCount: c._count.modules,
      enrollmentCount: c._count.enrollments,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

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

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        categoryId,
        level: level ?? undefined,
        thumbnail: thumbnail ?? undefined,
        isPublished: false,
        instructorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        categoryId: true,
        level: true,
        isPublished: true,
      },
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
