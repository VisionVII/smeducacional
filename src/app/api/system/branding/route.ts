import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Obter informações de marca (público - para menus)
export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'system' },
      select: {
        companyName: true,
        systemName: true,
        logoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
      },
    });

    // Retornar valores padrão se não existir
    if (!config) {
      return NextResponse.json({
        companyName: 'SM Educacional',
        systemName: 'SM Educacional',
        logoUrl: null,
        faviconUrl: null,
        primaryColor: null,
        secondaryColor: null,
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('[GET /api/system/branding] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações de marca' },
      { status: 500 }
    );
  }
}
