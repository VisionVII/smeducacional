import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const publicPageSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  bannerUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  content: z.any().optional(),
});

// GET: Detalhes da página pública
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const page = await prisma.publicPage.findUnique({
    where: { slug: params.slug },
  });
  if (!page) {
    return NextResponse.json(
      { error: 'Página não encontrada' },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: page });
}

// PUT: Atualizar página pública
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const result = publicPageSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }
  const { title, description, bannerUrl, iconUrl, content } = result.data;
  const page = await prisma.publicPage.update({
    where: { slug: params.slug },
    data: { title, description, bannerUrl, iconUrl, content },
  });
  return NextResponse.json({
    data: page,
    message: 'Página atualizada com sucesso',
  });
}

// DELETE: Remover página pública
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  await prisma.publicPage.delete({ where: { slug: params.slug } });
  return NextResponse.json({ message: 'Página removida com sucesso' });
}
