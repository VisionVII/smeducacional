import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('[student/profile]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verificar se o email já existe (para outro usuário)
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    return NextResponse.json({
      data: updatedUser,
      message: 'Perfil atualizado com sucesso',
    });
  } catch (error) {
    console.error('[student/profile][PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
