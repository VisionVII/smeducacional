import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para criação de módulo
const createModuleSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

// POST /api/courses/[id]/modules - Criar módulo no curso
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão: apenas o instrutor do curso ou admin pode adicionar módulos
    if (
      course.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para adicionar módulos a este curso' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createModuleSchema.parse(body);

    // Se order não foi fornecida, usar a próxima ordem disponível
    if (validatedData.order === 0 && course.modules.length > 0) {
      validatedData.order = (course.modules[0]?.order || 0) + 1;
    }

    // Criar o módulo
    const moduleData = await prisma.module.create({
      data: {
        ...validatedData,
        courseId: id,
      },
      include: {
        lessons: true,
      },
    });

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_MODULE',
        details: `Adicionou o módulo "${moduleData.title}" ao curso "${course.title}"`,
      },
    });

    return NextResponse.json(moduleData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar módulo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar módulo' },
      { status: 500 }
    );
  }
}

// GET /api/courses/[id]/modules - Listar módulos do curso
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const modules = await prisma.module.findMany({
      where: { courseId: id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar módulos' },
      { status: 500 }
    );
  }
}
