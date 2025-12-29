import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const publicOnly = searchParams.get('public');

    let query = `
      SELECT 
        id,
        name,
        public,
        created_at,
        updated_at,
        file_size_limit,
        allowed_mime_types
      FROM storage.buckets
      WHERE 1=1
    `;

    if (search) {
      query += ` AND name ILIKE '%${search}%'`;
    }

    if (publicOnly === 'true') {
      query += ` AND public = true`;
    } else if (publicOnly === 'false') {
      query += ` AND public = false`;
    }

    query += ` ORDER BY name LIMIT 100;`;

    try {
      const buckets = await prisma.$queryRawUnsafe<
        Array<{
          id: string;
          name: string;
          public: boolean;
          created_at: Date;
          updated_at: Date;
          file_size_limit: number | null;
          allowed_mime_types: string[] | null;
        }>
      >(query);
      return NextResponse.json({ data: buckets });
    } catch (queryError) {
      // Storage.buckets pode não existir em alguns ambientes
      console.warn(
        '[API][dev][database][buckets] Storage não disponível:',
        queryError
      );
      return NextResponse.json({ data: [] });
    }
  } catch (error) {
    console.error('[API][dev][database][buckets]', error);
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
}
