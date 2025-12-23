import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const previewSchema = z.object({
  version: z.number().int().min(1),
});

// GET /api/admin/public-pages/[id]/preview?version=1
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const versionParam = searchParams.get('version');
  const version = Number(versionParam);
  const result = previewSchema.safeParse({ version });
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

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
  return NextResponse.json({
    data: log.changes,
    message: 'Preview da versão recuperado com sucesso',
  });
}
