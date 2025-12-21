import { NextRequest, NextResponse } from 'next/server';
import { generateSecurityReportPdf, deliverPdfToUser } from '@/lib/secureOpsAI';

// Endpoint: /api/admin/ai/secure-ops/pdf
export async function POST(req: NextRequest) {
  // Log auditável
  console.log('[SecureOpsAI][pdf] Solicitação de geração de PDF');
  try {
    const pdfBuffer = await generateSecurityReportPdf();
    const downloadUrl = await deliverPdfToUser(pdfBuffer);
    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error('[SecureOpsAI][pdf] Erro:', error);
    return NextResponse.json({ error: 'Erro ao gerar PDF.' }, { status: 500 });
  }
}
