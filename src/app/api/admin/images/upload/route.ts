/**
 * API ROUTE: Upload de Imagem
 * POST /api/admin/images/upload
 * VisionVII 3.0 - Service Pattern
 */

import { auth } from '@/lib/auth';
import { ImageService, ImageServiceError } from '@/lib/services/ImageService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const resourceType = formData.get('resourceType') as string;
    const resourceId = formData.get('resourceId') as string;
    const fieldName = formData.get('fieldName') as string;

    if (!file || !bucket || !resourceType || !resourceId || !fieldName) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Upload via ImageService
    const result = await ImageService.uploadImage({
      file,
      bucket: bucket as
        | 'course-thumbnails'
        | 'profile-pictures'
        | 'videos'
        | 'public-pages',
      userId: session.user.id,
      resourceType: resourceType as
        | 'COURSE'
        | 'USER'
        | 'PAGE'
        | 'LESSON'
        | 'AD'
        | 'CERTIFICATE'
        | 'CONFIG',
      resourceId,
      fieldName,
    });

    return NextResponse.json({
      success: true,
      image: result,
    });
  } catch (error) {
    if (error instanceof ImageServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
