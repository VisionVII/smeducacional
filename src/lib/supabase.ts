import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Log de diagnóstico
if (typeof window === 'undefined') {
  // Server-side
  console.log('[Supabase] Inicializando no servidor...');
  console.log(
    '[Supabase] URL:',
    supabaseUrl ? '✅ Definida' : '❌ NÃO DEFINIDA'
  );
  console.log(
    '[Supabase] ANON_KEY:',
    supabaseAnonKey
      ? `✅ Definida (${supabaseAnonKey.substring(0, 20)}...)`
      : '❌ NÃO DEFINIDA'
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error(
    `Missing Supabase environment variables: ${missing.join(', ')}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload de arquivo para o Supabase Storage
 * @param file Arquivo a ser enviado
 * @param bucket Nome do bucket (ex: 'course-thumbnails')
 * @param path Caminho do arquivo (ex: 'curso-123/thumbnail.jpg')
 * @returns URL pública do arquivo
 */
/**
 * Upload de arquivo para o Supabase Storage
 * Aceita Buffer (Node.js) ou File (browser)
 * @param file Buffer (Node.js) ou File (browser)
 * @param bucket Nome do bucket
 * @param path Caminho do arquivo
 */
export async function uploadFile(
  file: any, // Buffer (Node.js) ou File (browser)
  bucket: string,
  path: string
): Promise<{ url: string; error?: string }> {
  try {
    // Detecta ambiente Node.js (Buffer) ou browser (File)
    let uploadData: any = file;
    let options: any = { cacheControl: '3600', upsert: true };

    // Se for Buffer, define contentType genérico
    if (typeof Buffer !== 'undefined' && file instanceof Buffer) {
      options.contentType = 'application/pdf';
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, uploadData, options);

    if (error) {
      console.error('Erro no upload:', error);
      return { url: '', error: error.message };
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { url: publicUrlData.publicUrl };
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return { url: '', error: 'Erro ao fazer upload do arquivo' };
  }
}

/**
 * Remove arquivo do Supabase Storage
 * @param bucket Nome do bucket
 * @param path Caminho do arquivo
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Erro ao deletar:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return { success: false, error: 'Erro ao deletar arquivo' };
  }
}

/**
 * Lista arquivos de um bucket
 * @param bucket Nome do bucket
 * @param path Caminho (opcional)
 */
export async function listFiles(bucket: string, path?: string) {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path);

    if (error) {
      console.error('Erro ao listar:', error);
      return { files: [], error: error.message };
    }

    return { files: data, error: null };
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return { files: [], error: 'Erro ao listar arquivos' };
  }
}
