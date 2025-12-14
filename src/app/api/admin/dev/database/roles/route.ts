import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const canLogin = searchParams.get('canLogin');

    let query = `
      SELECT 
        rolname,
        rolsuper,
        rolcreatedb,
        rolcreaterole,
        rolcanlogin,
        rolconnlimit
      FROM pg_roles
      WHERE 1=1
    `;

    if (search) {
      query += ` AND rolname ILIKE '%${search}%'`;
    }

    if (canLogin === 'true') {
      query += ` AND rolcanlogin = true`;
    } else if (canLogin === 'false') {
      query += ` AND rolcanlogin = false`;
    }

    query += ` ORDER BY rolname LIMIT 100;`;

    const roles = await prisma.$queryRawUnsafe<any[]>(query);

    return NextResponse.json({ data: roles });
  } catch (error) {
    console.error('[API][dev][database][roles]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar roles' },
      { status: 500 }
    );
  }
}
