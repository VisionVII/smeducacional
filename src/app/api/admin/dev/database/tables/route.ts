import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface DatabaseTable {
  table_schema: string;
  table_name: string;
  column_count: bigint;
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
        table_schema, 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    `;

    if (search) {
      query += ` AND table_name ILIKE '%${search}%'`;
    }

    if (schema) {
      query += ` AND table_schema = '${schema}'`;
    }

    query += ` ORDER BY table_schema, table_name LIMIT 100;`;

    const tables = await prisma.$queryRawUnsafe<DatabaseTable[]>(query);

    // Convert BigInt to string for JSON serialization
    const serializedTables = tables.map((table) => ({
      ...table,
      column_count: table.column_count ? Number(table.column_count) : 0,
    }));

    // Get schemas
    const schemas = await prisma.$queryRawUnsafe<{ schema_name: string }[]>(`
      SELECT DISTINCT table_schema as schema_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name;
    `);

    return NextResponse.json({
      data: serializedTables,
      schemas: schemas.map((s) => s.schema_name),
    });
  } catch (error) {
    console.error('[API][dev][database][tables]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tabelas' },
      { status: 500 }
    );
  }
}
