import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = new Set(['/', '/login', '/register', '/forgot-password', '/courses', '/about']);

// Security headers para todas as respostas
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Ativar proteção XSS do navegador
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (anteriormente Feature Policy)
  response.headers.set(
    'Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isAuthRoute = pathname.startsWith('/api/auth');
  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || isAuthRoute;

  if (!token && !isPublicRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return addSecurityHeaders(response);
  }

  if (token?.role) {
    const userRole = token.role as string;

    // Proteção de rotas por role
    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
      const response = NextResponse.redirect(new URL('/', request.url));
      return addSecurityHeaders(response);
    }

    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
      const response = NextResponse.redirect(new URL('/', request.url));
      return addSecurityHeaders(response);
    }

    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      const response = NextResponse.redirect(new URL('/', request.url));
      return addSecurityHeaders(response);
    }

    // Redirecionar para dashboard apropriado se já estiver logado
    if (pathname === '/login' || pathname === '/register') {
      let redirectUrl = '/';
      if (userRole === 'STUDENT') {
        redirectUrl = '/student/dashboard';
      } else if (userRole === 'TEACHER') {
        redirectUrl = '/teacher/dashboard';
      } else if (userRole === 'ADMIN') {
        redirectUrl = '/admin/dashboard';
      }
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));
      return addSecurityHeaders(response);
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
