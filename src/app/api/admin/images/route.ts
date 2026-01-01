/**
 * LIST IMAGES API ROUTE
 * VisionVII 3.0 - Phase 2.4
 *
 * Endpoint para listar imagens com filtros
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // RBAC: Apenas admins podem listar todas as imagens
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Sem permissão' },
        { status: 403 }
      );
    }

    // Query params
    const searchParams = request.nextUrl.searchParams;
    const bucket = searchParams.get('bucket');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      deletedAt: null;
      bucket?: string;
      fileName?: { contains: string; mode: 'insensitive' };
    } = {
      deletedAt: null, // Apenas imagens não deletadas
    };

    if (bucket) {
      where.bucket = bucket;
    }

    if (search) {
      where.fileName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Fetch images
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        include: {
          usages: {
            select: {
              resourceType: true,
              resourceId: true,
              fieldName: true,
            },
          },
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.image.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      images,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar imagens' },
      { status: 500 }
    );
  }
}
