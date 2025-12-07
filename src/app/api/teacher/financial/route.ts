import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const financialSchema = z.object({
  bank: z.string().min(1, 'Banco é obrigatório'),
  agency: z.string().min(1, 'Agência é obrigatória'),
  account: z.string().min(1, 'Conta é obrigatória'),
  accountType: z.enum(['Corrente', 'Poupança'], {
    errorMap: () => ({ message: 'Tipo de conta inválido' }),
  }),
  pixKey: z.string().optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const financial = await prisma.teacherFinancial.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(financial || {});
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados financeiros' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = financialSchema.parse(body);

    const financial = await prisma.teacherFinancial.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      financial,
      message: 'Dados financeiros salvos com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao salvar dados financeiros:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar dados financeiros' },
      { status: 500 }
    );
  }
}
