import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        phone: true,
        cpf: true,
        address: true,
        createdAt: true,
        updatedAt: true,
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
    console.error('[teacher][profile] GET', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
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
    const result = profileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    // Verificar se email já existe (se mudou)
    if (validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        avatar: validatedData.avatar || null,
        bio: validatedData.bio || null,
        phone: validatedData.phone || null,
        cpf: validatedData.cpf || null,
        address: validatedData.address || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        phone: true,
        cpf: true,
        address: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      data: updatedUser,
      message: 'Perfil atualizado com sucesso',
    });
  } catch (error) {
    console.error('[teacher][profile] PUT', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
