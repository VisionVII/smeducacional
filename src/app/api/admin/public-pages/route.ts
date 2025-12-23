import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const publicPageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  bannerUrl: z.string().optional().or(z.literal('')),
  iconUrl: z.string().optional().or(z.literal('')),
  content: z.any().optional(),
  isPublished: z.boolean().optional(),
});

// GET: Listar todas as páginas públicas
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const pages = await prisma.publicPage.findMany({ orderBy: { slug: 'asc' } });
  return NextResponse.json({ data: pages });
}
// POST: Criar nova página pública
export async function POST(req: NextRequest) {
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
  const { slug, title, description, bannerUrl, iconUrl, content, isPublished } =
    result.data;
  const exists = await prisma.publicPage.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: 'Slug já existe' }, { status: 409 });
  }
  const page = await prisma.publicPage.create({
    data: {
      slug,
      title,
      description,
      bannerUrl,
      iconUrl,
      content,
      isPublished: isPublished ?? false,
    },
  });
  return NextResponse.json(
    { data: page, message: 'Página criada com sucesso' },
    { status: 201 }
  );
}
