import { getSupabaseService } from '@/lib/supabase-service';

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'courses';
const DEFAULT_EXPIRATION_SECONDS = 60 * 60; // 60 minutos

function normalizePath(input: string): { bucket: string; path: string } | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Se a URL é absoluta do Supabase, remove o prefixo público para obter o path interno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicPrefix = supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/`
    : null;

  if (publicPrefix && trimmed.startsWith(publicPrefix)) {
    const withoutPrefix = trimmed.slice(publicPrefix.length);
    const [bucket, ...rest] = withoutPrefix.split('/');
    const path = rest.join('/');
    if (!bucket || !path) return null;
    return { bucket, path };
  }

  // Se veio apenas um path relativo, assume bucket padrão
  return { bucket: DEFAULT_BUCKET, path: trimmed.replace(/^\/+/, '') };
}

export async function getSignedUrl(
  path: string,
  expiresInSeconds: number = DEFAULT_EXPIRATION_SECONDS
): Promise<string | null> {
  const normalized = normalizePath(path);
  if (!normalized) return null;

  const { bucket, path: objectPath } = normalized;

  const supabaseService = getSupabaseService();
  const { data, error } = await supabaseService.storage
    .from(bucket)
    .createSignedUrl(objectPath, expiresInSeconds);

  if (error) {
    console.error('[VideoService] Erro ao gerar signed URL:', error.message);
    return null;
  }

  return data?.signedUrl || null;
}
