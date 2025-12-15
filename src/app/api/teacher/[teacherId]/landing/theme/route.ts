import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  params: Promise<{ teacherId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { teacherId } = await params;

  if (!teacherId) {
    return NextResponse.json(
      { error: 'teacherId obrigatório' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { landingTheme: true },
    });

    if (!user || !user.landingTheme) {
      return NextResponse.json({ theme: null }, { status: 200 });
    }

    return NextResponse.json({ theme: user.landingTheme }, { status: 200 });
  } catch (error) {
    console.error('[public-landing-theme][GET]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
