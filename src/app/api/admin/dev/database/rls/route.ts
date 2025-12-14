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

    let query = `
      SELECT 
        schemaname AS schema,
        tablename AS name,
        rowsecurity
      FROM pg_tables
      WHERE rowsecurity = true
    `;

    if (search) {
      query += ` AND tablename ILIKE '%${search}%'`;
    }

    query += ` ORDER BY schemaname, tablename LIMIT 100;`;

    const rlsTables = await prisma.$queryRawUnsafe<any[]>(query);

    // Get policies for RLS tables
    const policies = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd
      FROM pg_policies
      ORDER BY schemaname, tablename, policyname;
    `);

    return NextResponse.json({
      data: rlsTables,
      policies,
    });
  } catch (error) {
    console.error('[API][dev][database][rls]', error);
    return NextResponse.json({ error: 'Erro ao buscar RLS' }, { status: 500 });
  }
}
