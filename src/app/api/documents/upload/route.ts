/**
 * API Route: Upload de Documentos do Curso
 * POST /api/documents/upload
 *
 * VisionVII Enterprise Governance 3.0
 * Service Pattern: API Route -> DocumentService -> Prisma
 *
 * Autorização: Apenas TEACHER (do curso) ou ADMIN
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { uploadDocument } from '@/lib/services/document.service';

// Schema de validação
const UploadDocumentSchema = z.object({
  courseId: z.string().min(1, 'ID do curso é obrigatório'),
  moduleId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Verificar role: apenas TEACHER ou ADMIN
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Apenas professores e administradores podem fazer upload de documentos',
        },
        { status: 403 }
      );
    }

    // 3. Parse do FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const courseId = formData.get('courseId') as string;
    const moduleId = formData.get('moduleId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    // 4. Validar campos com Zod
    const validation = UploadDocumentSchema.safeParse({
      courseId,
      moduleId: moduleId || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    // 5. Extrair IP do request
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // 6. Chamar DocumentService
    const result = await uploadDocument({
      file,
      courseId: validation.data.courseId,
      moduleId: validation.data.moduleId,
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
      message: result.message,
      documentId: result.documentId,
    });
  } catch (error) {
    console.error('[API] /documents/upload error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
