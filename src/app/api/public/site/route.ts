import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_SLUG = 'default-public-site';

export async function GET() {
  try {
    const config = await prisma.publicSiteConfig.findUnique({
      where: { slug: DEFAULT_SLUG },
    });

    if (!config) {
      const created = await prisma.publicSiteConfig.create({
        data: {
          slug: DEFAULT_SLUG,
        },
      });
      return NextResponse.json({ data: created });
    }

    return NextResponse.json({ data: config });
  } catch (error) {
    console.error('[public-site][GET]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
