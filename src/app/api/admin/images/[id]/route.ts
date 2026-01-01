/**
 * API ROUTE: Gerenciar Imagem Individual
 * DELETE /api/admin/images/[id]
 * GET /api/admin/images/[id]
 * VisionVII 3.0 - Service Pattern
 */

import { auth } from '@/lib/auth';
import { ImageService, ImageServiceError } from '@/lib/services/ImageService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const metadata = await ImageService.getImageMetadata(id);

    if (!metadata) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      image: metadata,
    });
  } catch (error) {
    if (error instanceof ImageServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao obter imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    await ImageService.deleteImage(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Imagem deletada com sucesso',
    });
  } catch (error) {
    if (error instanceof ImageServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao deletar imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
