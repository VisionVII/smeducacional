import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário e verificar código
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        resetCode: true,
        resetCodeExpires: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!user.resetCode || !user.resetCodeExpires) {
      return NextResponse.json(
        { error: 'Nenhum código de recuperação pendente' },
        { status: 400 }
      );
    }

    // Verificar se o código expirou
    if (new Date() > user.resetCodeExpires) {
      return NextResponse.json(
        { error: 'Código expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    // Verificar se o código está correto
    if (user.resetCode !== code) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Código verificado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar código' },
      { status: 500 }
    );
  }
}
