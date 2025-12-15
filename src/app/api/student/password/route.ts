import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = passwordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Buscar usuário com senha
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          error:
            'Usuário não encontrado ou sem senha configurada (ex: login OAuth)',
        },
        { status: 400 }
      );
    }

    // Validar senha atual
    const isPasswordValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 400 }
      );
    }

    // Hash nova senha
    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: 'Senha atualizada com sucesso',
    });
  } catch (error) {
    console.error('[student/password][PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar senha' },
      { status: 500 }
    );
  }
}
