/**
 * API Route: Listar Documentos de um Curso
 * GET /api/courses/[id]/documents?moduleId=xxx
 *
 * VisionVII Enterprise Governance 3.0
 *
 * Autorização: Usuários autenticados (estudantes veem apenas aprovados)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listCourseDocuments } from '@/lib/services/document.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: courseId } = await params;
    const moduleId = req.nextUrl.searchParams.get('moduleId') || undefined;

    const documents = await listCourseDocuments(
      courseId,
      moduleId,
      session.user.role
    );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('[API] GET /courses/[id]/documents error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar documentos' },
      { status: 500 }
    );
  }
}
