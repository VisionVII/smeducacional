import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = new Set(['/', '/login', '/register', '/forgot-password', '/courses', '/about']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isAuthRoute = pathname.startsWith('/api/auth');
  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || isAuthRoute;

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token?.role) {
    const userRole = token.role as string;

    // Proteção de rotas por role
    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirecionar para dashboard apropriado se já estiver logado
    if (pathname === '/login' || pathname === '/register') {
      if (userRole === 'STUDENT') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }
      if (userRole === 'TEACHER') {
        return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
      }
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
