import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  // Não logamos valores para evitar vazar secrets
  throw new Error(
    `Missing Supabase environment variables: ${missing.join(', ')}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload de arquivo para o Supabase Storage
 * Aceita Buffer (Node.js) ou File/Blob (browser)
 * @param file Buffer (Node.js) ou File/Blob (browser)
 * @param bucket Nome do bucket
 * @param path Caminho do arquivo
 */
export async function uploadFile(
  file: File | Blob | Buffer,
  bucket: string,
  path: string
): Promise<{ url: string; error?: string }> {
  try {
    const uploadData: File | Blob | Buffer = file;
    const options: {
      cacheControl: string;
      upsert: boolean;
      contentType?: string;
    } = {
      cacheControl: '3600',
      upsert: true,
    };

    if (typeof File !== 'undefined' && file instanceof File && file.type) {
      options.contentType = file.type;
    } else if (
      typeof Blob !== 'undefined' &&
      file instanceof Blob &&
      file.type
    ) {
      options.contentType = file.type;
    } else if (typeof Buffer !== 'undefined' && file instanceof Buffer) {
      options.contentType = 'application/octet-stream';
    }

    const { error } = await supabase.storage
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
