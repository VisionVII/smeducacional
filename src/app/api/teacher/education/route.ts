import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const educationSchema = z.object({
  degree: z.string().min(1, 'Nível é obrigatório'),
  institution: z.string().min(1, 'Instituição é obrigatória'),
  field: z.string().min(1, 'Área de formação é obrigatória'),
  year: z.number().int().min(1950).max(new Date().getFullYear()),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const education = await prisma.teacherEducation.findMany({
      where: { userId: session.user.id },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error('Erro ao buscar formações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar formações' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = educationSchema.parse(body);

    const education = await prisma.teacherEducation.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      education,
      message: 'Formação adicionada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao adicionar formação:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar formação' },
      { status: 500 }
    );
  }
}
