/**
 * API ROUTE: Obter Signed URL de Imagem
 * GET /api/admin/images/[id]/signed-url
 * VisionVII 3.0 - Service Pattern
 */

import { auth } from '@/lib/auth';
import { ImageService, ImageServiceError } from '@/lib/services/ImageService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const signedUrl = await ImageService.getSignedUrl(params.id);

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    if (error instanceof ImageServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao obter URL:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
