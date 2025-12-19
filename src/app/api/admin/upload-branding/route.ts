import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/**
 * API para upload de arquivos da identidade visual do sistema
 * Apenas ADMIN pode fazer upload
 *
 * Tipos suportados:
 * - logo: Logo principal (PNG, JPG, SVG, WEBP)
 * - favicon: Favicon (ICO, PNG, SVG)
 * - loginBg: Background da tela de login (PNG, JPG, WEBP)
 */

const ALLOWED_TYPES = {
  logo: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
  favicon: ['image/x-icon', 'image/png', 'image/svg+xml'],
  loginBg: ['image/png', 'image/jpeg', 'image/webp'],
};

const MAX_SIZES = {
  logo: 5 * 1024 * 1024, // 5MB
  favicon: 1 * 1024 * 1024, // 1MB
  loginBg: 10 * 1024 * 1024, // 10MB
};

export async function POST(request: NextRequest) {
  try {
    console.log('[upload-branding] 🚀 Iniciando upload...');

    // 1. Verificar autenticação e role
    const session = await auth();
    console.log(
      '[upload-branding] ✅ Sessão:',
      session?.user?.email,
      session?.user?.role
    );

    if (!session || session.user.role !== 'ADMIN') {
      console.log('[upload-branding] ❌ Não autorizado');
      return NextResponse.json(
        { error: 'Não autorizado. Apenas administradores podem fazer upload.' },
        { status: 401 }
      );
    }

    // 2. Parsear FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'logo' | 'favicon' | 'loginBg' | null;

    console.log(
      '[upload-branding] 📁 Arquivo:',
      file?.name,
      file?.size,
      file?.type
    );
    console.log('[upload-branding] 🏷️  Tipo:', type);

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!type || !ALLOWED_TYPES[type]) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido' },
        { status: 400 }
      );
    }

    // 3. Validar tipo de arquivo
    if (!ALLOWED_TYPES[type].includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não permitido. Aceitos: ${ALLOWED_TYPES[
            type
          ].join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 4. Validar tamanho
    if (file.size > MAX_SIZES[type]) {
      const maxMB = MAX_SIZES[type] / (1024 * 1024);
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: ${maxMB}MB` },
        { status: 400 }
      );
    }

    // 5. Gerar nome único do arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `${type}-${timestamp}.${extension}`;

    // 6. Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('[upload-branding] 📦 Buffer criado:', buffer.length, 'bytes');

    // 7. Upload para Supabase Storage
    const bucket = 'images'; // bucket para imagens do sistema
    console.log('[upload-branding] 📤 Enviando para Supabase...');
    console.log('[upload-branding] Bucket:', bucket);
    console.log('[upload-branding] Path:', `system/${fileName}`);
    console.log('[upload-branding] Content-Type:', file.type);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`system/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('[upload-branding] ❌ Erro no Supabase:', {
        message: error.message,
        status: error.statusCode,
        details: error,
      });
      return NextResponse.json(
        { error: `Erro ao fazer upload: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('[upload-branding] ✅ Upload concluído:', data);

    // 8. Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(`system/${fileName}`);

    console.log('[upload-branding] 🔗 URL pública gerada:', urlData?.publicUrl);

    if (!urlData?.publicUrl) {
      console.error('[upload-branding] ❌ Falha ao gerar URL pública');
      return NextResponse.json(
        { error: 'Erro ao gerar URL pública' },
        { status: 500 }
      );
    }

    // 9. Retornar URL e informações
    const response = {
      success: true,
      data: {
        url: urlData.publicUrl,
        fileName: fileName,
        path: data.path,
        type: type,
        size: file.size,
      },
    };

    console.log('[upload-branding] 🎉 Sucesso! Retornando:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[upload-branding] ❌ Erro inesperado:', error);
    return NextResponse.json(
      {
        error: `Erro interno: ${
          error instanceof Error ? error.message : 'Desconhecido'
        }`,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Deletar arquivo específico do storage
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Obter caminho do arquivo
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'Caminho do arquivo não fornecido' },
        { status: 400 }
      );
    }

    // 3. Deletar do Supabase Storage
    const { error } = await supabase.storage.from('images').remove([filePath]);

    if (error) {
      console.error('[upload-branding] Erro ao deletar:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar arquivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[upload-branding] Erro no DELETE:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
