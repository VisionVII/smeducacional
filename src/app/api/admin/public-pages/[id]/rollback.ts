import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const rollbackSchema = z.object({
  version: z.number().int().min(1),
});

// POST /api/admin/public-pages/[id]/rollback
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const result = rollbackSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }
  const { version } = result.data;

  const logs = await prisma.publicPageLog.findMany({
    where: { pageId: params.id },
    orderBy: { createdAt: 'desc' },
  });
  const log = logs.find((l, idx) => idx + 1 === version);
  if (!log || !log.changes || typeof log.changes !== 'object') {
    return NextResponse.json(
      { error: 'Versão não encontrada ou inválida' },
      { status: 404 }
    );
  }
  const changes = log.changes as any;

  const page = await prisma.publicPage.update({
    where: { id: params.id },
    data: {
      title: changes.title,
      description: changes.description,
      bannerUrl: changes.bannerUrl,
      iconUrl: changes.iconUrl,
      content: changes.content === null ? undefined : changes.content,
      isPublished: changes.isPublished,
    },
  });

  await prisma.publicPageLog.create({
    data: {
      pageId: page.id,
      userId: session.user.id,
      action: 'rollback',
      changes: changes,
    },
  });
  return NextResponse.json({
    data: page,
    message: 'Rollback realizado com sucesso',
  });
}
