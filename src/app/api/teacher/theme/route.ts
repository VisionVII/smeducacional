import { NextResponse } from 'next/server';

// @deprecated Centralizado em /api/system/theme
export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/api/system/theme', request.url));
}

// @deprecated Centralizado em /api/system/theme
export async function PUT(request: Request) {
  return NextResponse.redirect(new URL('/api/system/theme', request.url));
}

// @deprecated Centralizado em /api/system/theme
export async function DELETE(request: Request) {
  return NextResponse.redirect(new URL('/api/system/theme', request.url));
}
