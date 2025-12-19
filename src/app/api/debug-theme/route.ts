import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.systemConfig.findFirst({
      where: { key: 'default' },
    });

    return NextResponse.json(
      {
        hasConfig: !!config,
        publicTheme: config?.publicTheme || null,
        fullConfig: config,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[DEBUG] Erro:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
