import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCertificatePDF } from '@/lib/certificates';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Gerar PDF
    const pdfBuffer = await generateCertificatePDF(id);

    // Converter Buffer para Uint8Array para compatibilidade com NextResponse
    const pdfBytes = new Uint8Array(pdfBuffer);

    // Retornar PDF como download
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${id}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('[certificates/download] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar certificado' },
      { status: 500 }
    );
  }
}
