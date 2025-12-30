import { NextResponse } from 'next/server';

// @deprecated Centralizado em /api/system/theme
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/api/system/theme', request.url));
}

export async function PUT(request: Request) {
  return NextResponse.redirect(new URL('/api/system/theme', request.url));
}

export async function DELETE(request: Request) {
  return NextResponse.redirect(new URL('/api/system/theme', request.url));
}
