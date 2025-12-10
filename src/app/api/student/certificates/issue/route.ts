import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { issueCertificate } from '@/lib/certificates';
import { z } from 'zod';

const issueSchema = z.object({
  courseId: z.string().min(1, 'Course ID é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar com Zod
    const validationResult = issueSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseId } = validationResult.data;

    // Emitir certificado
    const certificateId = await issueCertificate(session.user.id, courseId);

    return NextResponse.json({
      message: 'Certificado emitido com sucesso',
      certificateId,
    });
  } catch (error: any) {
    console.error('[certificates/issue] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao emitir certificado' },
      { status: 500 }
    );
  }
}
