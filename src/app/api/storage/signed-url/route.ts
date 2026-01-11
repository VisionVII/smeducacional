import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { supabaseService } from '@/lib/supabase-service';
import {
  AuditAction,
  getClientIpFromRequest,
  logAuditTrail,
} from '@/lib/audit.service';

const ALLOWED_BUCKETS = [
  'course-thumbnails',
  'profile-pictures',
  'public-pages',
  'lesson-assets',
];

const SignedUrlSchema = z.object({
  bucket: z
    .string()
    .min(1)
    .refine((b) => ALLOWED_BUCKETS.includes(b), 'Bucket não permitido'),
  path: z
    .string()
    .min(1)
    // Apenas nomes/paths seguros
    .regex(/^[a-zA-Z0-9._\-\/]+$/, 'Path inválido'),
  expiresIn: z
    .number()
    .optional()
    .default(60 * 30) // 30 minutos
    .refine((n) => n > 0 && n <= 60 * 60 * 24, 'Expiração inválida'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SignedUrlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validação falhou', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { bucket, path, expiresIn } = parsed.data;
    const { data, error } = await supabaseService.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('[signed-url] Supabase error:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao gerar URL assinada' },
        { status: 500 }
      );
    }

    await logAuditTrail({
      userId: session.user.id,
      action: AuditAction.CONTENT_ACCESS,
      targetId: path,
      targetType: 'STORAGE_SIGNED_URL',
      metadata: { bucket, expiresIn },
      ipAddress: getClientIpFromRequest(req as unknown as Request),
    });

    const res = NextResponse.json({ url: data?.signedUrl, expiresIn });
    res.headers.set('X-Content-Type-Options', 'nosniff');
    return res;
  } catch (error) {
    console.error('[API /storage/signed-url POST]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
