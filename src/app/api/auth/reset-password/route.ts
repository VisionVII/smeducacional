import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
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

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha e limpar código de recuperação
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return NextResponse.json({ 
      message: 'Senha redefinida com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
