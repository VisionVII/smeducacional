/**
 * API ROUTE: Listar Imagens Órfãs
 * GET /api/admin/images/orphaned
 * VisionVII 3.0 - Service Pattern
 */

import { auth } from '@/lib/auth';
import { ImageService, ImageServiceError } from '@/lib/services/ImageService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('daysOld') || '7', 10);

    const orphanedImages = await ImageService.findOrphanedImages(daysOld);

    return NextResponse.json({
      success: true,
      images: orphanedImages,
      total: orphanedImages.length,
      daysOld,
    });
  } catch (error) {
    if (error instanceof ImageServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao buscar imagens órfãs:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('daysOld') || '30', 10);

    const count = await ImageService.cleanupOrphanedImages(daysOld);

    return NextResponse.json({
      success: true,
      message: `${count} imagens órfãs removidas`,
      count,
    });
  } catch (error) {
    if (error instanceof ImageServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao limpar imagens órfãs:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
