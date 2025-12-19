import { NextRequest, NextResponse } from 'next/server';

/**
 * API de DEBUG para verificar variáveis de ambiente
 */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    url: url ? 'SET' : 'NOT SET',
    urlValue: url || null,
    key: key ? 'SET' : 'NOT SET',
    keyLength: key?.length || 0,
    keyStart: key?.substring(0, 40) || null,
    keyParts: key?.split('.').length || 0,
  });
}
