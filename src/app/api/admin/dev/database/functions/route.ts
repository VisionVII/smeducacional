import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface DatabaseFunction {
  oid: number;
  schema: string;
  name: string;
  return_type: string;
  arguments: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const schema = searchParams.get('schema') || '';

    let query = `
      SELECT 
        p.oid AS oid,
        n.nspname AS schema,
        p.proname AS name,
        pg_get_function_result(p.oid) AS return_type,
        pg_get_function_arguments(p.oid) AS arguments
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    `;

    if (search) {
      query += ` AND p.proname ILIKE '%${search}%'`;
    }

    if (schema) {
      query += ` AND n.nspname = '${schema}'`;
    }

    query += ` ORDER BY n.nspname, p.proname LIMIT 100;`;

    const functions = await prisma.$queryRawUnsafe<DatabaseFunction[]>(query);

    // Get schemas
    const schemas = await prisma.$queryRawUnsafe<{ schema_name: string }[]>(`
      SELECT DISTINCT n.nspname as schema_name
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name;
    `);

    return NextResponse.json({
      data: functions,
      schemas: schemas.map((s) => s.schema_name),
    });
  } catch (error) {
    console.error('[API][dev][database][functions]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar funções' },
      { status: 500 }
    );
  }
}
