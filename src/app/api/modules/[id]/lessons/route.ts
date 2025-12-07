import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para criação de aula
const createLessonSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(), // duração em segundos
  order: z.number().int().min(0).default(0),
  isFree: z.boolean().default(false),
  videoUrl: z.string().url().optional(),
  content: z.string().optional(),
});

// POST /api/modules/[id]/lessons - Criar aula no módulo
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
    const moduleData = await prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
        lessons: {
          orderBy: { order: 'desc' },
          take: 1,
        },
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
        { error: 'Sem permissão para adicionar aulas a este módulo' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createLessonSchema.parse(body);

    // Se order não foi fornecida, usar a próxima ordem disponível
    if (validatedData.order === 0 && moduleData.lessons.length > 0) {
      validatedData.order = (moduleData.lessons[0]?.order || 0) + 1;
    }

    // Criar a aula
    const lesson = await prisma.lesson.create({
      data: {
        ...validatedData,
        moduleId: id,
      },
    });

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_LESSON',
        details: `Adicionou a aula "${lesson.title}" ao módulo "${moduleData.title}"`,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar aula:', error);
    return NextResponse.json({ error: 'Erro ao criar aula' }, { status: 500 });
  }
}

// GET /api/modules/[id]/lessons - Listar aulas do módulo
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessons = await prisma.lesson.findMany({
      where: { moduleId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Erro ao buscar aulas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar aulas' },
      { status: 500 }
    );
  }
}
