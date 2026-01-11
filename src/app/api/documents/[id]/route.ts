/**
 * API Route: Gerenciar Documento Individual
 * DELETE /api/documents/[id] - Soft delete (apenas autor ou ADMIN)
 *
 * VisionVII Enterprise Governance 3.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteDocument } from '@/lib/services/document.service';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Apenas professores e administradores podem deletar documentos',
        },
        { status: 403 }
      );
    }

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const { id: documentId } = await params;

    const result = await deleteDocument(
      documentId,
      session.user.id,
      session.user.role,
      ipAddress
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error('[API] DELETE /documents/[id] error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
