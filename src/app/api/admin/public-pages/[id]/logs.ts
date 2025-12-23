import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/admin/public-pages/[id]/logs
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const logs = await prisma.publicPageLog.findMany({
    where: { pageId: params.id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      page: { select: { id: true, slug: true } },
    },
  });
  return NextResponse.json({ data: logs });
}
