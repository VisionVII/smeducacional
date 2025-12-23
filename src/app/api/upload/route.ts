import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseService } from '@/lib/supabase-service';

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

    // Converter File para Buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Gerar nome único
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${timestamp}-${safeName}`;

    // Upload usando service role (bypassa RLS do Storage)
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

    const { data: publicUrlData } = supabaseService.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('[API /upload POST]', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
