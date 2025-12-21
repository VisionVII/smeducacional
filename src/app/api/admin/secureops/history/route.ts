import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const auditReportSchema = z.object({
  result: z.any(),
  pdfUrl: z.string().url().optional(),
  riskScore: z.number().min(0).max(100),
  status: z.string(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const userId = req.nextUrl.searchParams.get('userId');
  const where = userId ? { userId } : {};
  const reports = await prisma.auditReport.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ data: reports });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const body = await req.json();
  const result = auditReportSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }
  // Garante que 'result' sempre exista (mesmo que null)
  const safeData = {
    ...result.data,
    result: result.data.result ?? null,
  };
  const report = await prisma.auditReport.create({
    data: {
      userId: session.user.id,
      ...safeData,
    },
  });
  return NextResponse.json(
    { data: report, message: 'Relatório salvo com sucesso' },
    { status: 201 }
  );
}
