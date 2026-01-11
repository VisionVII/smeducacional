/**
 * API Route: Download de Documentos do Curso
 * POST /api/documents/[id]/download
 *
 * VisionVII Enterprise Governance 3.0
 * Service Pattern: API Route -> DocumentService -> Supabase Signed URL
 *
 * Autorização: ADMIN, TEACHER (do curso), ou STUDENT (matriculado)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateDownloadUrl } from '@/lib/services/document.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: documentId } = await params;

    // 2. Extrair IP do request
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // 3. Chamar DocumentService para gerar URL assinada
    const result = await generateDownloadUrl({
      documentId,
      userId: session.user.id,
      userRole: session.user.role,
      ipAddress,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, code: result.error },
        { status: result.error === 'UNAUTHORIZED' ? 403 : 400 }
      );
    }

    return NextResponse.json({
      signedUrl: result.signedUrl,
      fileName: result.fileName,
      message: result.message,
    });
  } catch (error) {
    console.error('[API] /documents/[id]/download error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
