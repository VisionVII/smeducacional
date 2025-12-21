import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/supabase';
import { z } from 'zod';
import PDFDocument from 'pdfkit';

const schema = z.object({
  reportId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }
  const { reportId } = result.data;
  const report = await prisma.auditReport.findUnique({
    where: { id: reportId },
    include: { user: true },
  });
  if (!report) {
    return NextResponse.json(
      { error: 'Relatório não encontrado' },
      { status: 404 }
    );
  }

  // Gerar PDF em memória
  const doc = new PDFDocument();
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));

  // Conteúdo do PDF
  doc
    .fontSize(18)
    .text('Relatório de Auditoria SecureOpsAI', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Usuário: ${report.user.name} (${report.user.email})`);
  doc.text(`Data: ${new Date(report.createdAt).toLocaleString('pt-BR')}`);
  doc.text(`Status: ${report.status}`);
  doc.text(`Pontuação de Risco: ${report.riskScore}`);
  doc.moveDown();
  doc.text('Resumo:', { underline: true });
  doc.text(JSON.stringify(report.result, null, 2));
  doc.end();

  // Espera o PDF ser gerado
  await new Promise((resolve) => doc.on('end', resolve));
  const pdfBuffer = Buffer.concat(buffers);
  const fileName = `audit-reports/${report.id}-${Date.now()}.pdf`;
  const { url, error } = await uploadFile(pdfBuffer, 'pdfs', fileName);
  if (error) {
    return NextResponse.json({ error: 'Erro ao salvar PDF' }, { status: 500 });
  }
  await prisma.auditReport.update({
    where: { id: report.id },
    data: { pdfUrl: url },
  });
  return NextResponse.json({ pdfUrl: url });
}
