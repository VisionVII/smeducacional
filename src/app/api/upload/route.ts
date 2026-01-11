import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseService } from '@/lib/supabase-service';
import { z } from 'zod';
import {
  logAuditTrail,
  AuditAction,
  getClientIpFromRequest,
} from '@/lib/audit.service';

// 🛡️ Schema de validação
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

// Buckets permitidos (privados por padrão no Supabase)
const ALLOWED_BUCKETS = [
  'course-thumbnails',
  'profile-pictures',
  'public-pages',
  'lesson-assets',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const UploadSchema = z.object({
  bucket: z
    .string()
    .min(1, 'Bucket é obrigatório')
    .refine((b) => ALLOWED_BUCKETS.includes(b), 'Bucket não permitido'),
  fileSize: z.number().max(MAX_FILE_SIZE, 'Arquivo muito grande (máximo 5MB)'),
  fileType: z
    .string()
    .refine(
      (type) => ALLOWED_MIME_TYPES.includes(type),
      'Tipo de arquivo não permitido'
    ),
});

// Verificação simples de "magic bytes" sem dependências externas
function detectMimeFromMagicBytes(bytes: Uint8Array): string | null {
  // JPEG: FF D8
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
    return 'image/png';
  // GIF: 47 49 46 38
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  )
    return 'image/gif';
  // WEBP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return 'image/webp';
  // PDF: %PDF-
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  )
    return 'application/pdf';
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Ler FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'public-pages';

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // 🛡️ VALIDAÇÃO ZOD
    const validation = UploadSchema.safeParse({
      bucket,
      fileSize: file.size,
      fileType: file.type,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validação falhou',
          details: validation.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    // Converter File para Buffer e checar magic bytes
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const detectedMime = detectMimeFromMagicBytes(uint8Array);

    if (!detectedMime || detectedMime !== file.type) {
      await logAuditTrail({
        userId: session.user.id,
        action: AuditAction.SECURITY_VIOLATION,
        targetType: 'STORAGE_UPLOAD',
        metadata: {
          reason: 'MIME_MISMATCH_OR_UNKNOWN',
          providedType: file.type,
          detectedType: detectedMime,
          bucket,
          size: file.size,
        },
        ipAddress: getClientIpFromRequest(req as unknown as Request),
      });
      return NextResponse.json(
        { error: 'Conteúdo do arquivo não corresponde ao tipo informado' },
        { status: 400 }
      );
    }

    // Gerar nome único
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${timestamp}-${safeName}`;

    // Upload usando service role (necessário para gerar Signed URL)
    const { error } = await supabaseService.storage
      .from(bucket)
      .upload(fileName, uint8Array, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'application/octet-stream',
      });

    if (error) {
      console.error('[API /upload POST] Supabase error:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao fazer upload' },
        { status: 500 }
      );
    }

    // Gerar Signed URL (evita publicUrl direto)
    const { data: signed } = await supabaseService.storage
      .from(bucket)
      .createSignedUrl(fileName, 60 * 60); // 1 hora

    // Auditoria
    await logAuditTrail({
      userId: session.user.id,
      action: AuditAction.CONTENT_ACCESS,
      targetId: fileName,
      targetType: 'STORAGE_UPLOAD',
      metadata: { bucket, size: file.size, type: file.type },
      ipAddress: getClientIpFromRequest(req as unknown as Request),
    });

    const res = NextResponse.json({
      url: signed?.signedUrl,
      fileName,
      expiresIn: 3600,
    });
    res.headers.set('X-Content-Type-Options', 'nosniff');
    return res;
  } catch (error) {
    console.error('[API /upload POST]', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
