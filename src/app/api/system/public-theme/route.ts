import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.systemConfig.findFirst({
      where: { key: 'default' },
      select: { publicTheme: true },
    });

    return NextResponse.json({
      theme: config?.publicTheme || null,
    });
  } catch (error) {
    console.error('[API] Erro ao buscar tema público:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tema público' },
      { status: 500 }
    );
  }
}
