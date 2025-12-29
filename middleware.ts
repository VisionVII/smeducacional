import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/courses',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/teacher',
  '/admin',
  '/become-instructor',
  '/help',
  '/cookies',
]);

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

  // Content Security Policy - Permitir Next.js HMR e scripts inline
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https: http:;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' https: http: ws: wss:;
    media-src 'self' https: data: blob:;
    frame-src 'self' https://www.youtube.com https://player.vimeo.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
  });

  const isAuthRoute = pathname.startsWith('/api/auth');
  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || isAuthRoute;

  // Se não tem token e não é rota pública, redirecionar para login
  if (!token && !isPublicRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return addSecurityHeaders(response);
  }

  // Se tem token, validar permissões de rota
  if (token) {
    const userRole = token.role as string;

    // Validar rotas protegidas por role
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

    // Se já está logado e tenta acessar /login ou /register, redirecionar para dashboard
    if (pathname === '/login' || pathname === '/register') {
      let dashboardUrl = '/';
      if (userRole === 'ADMIN') {
        dashboardUrl = '/admin/dashboard';
      } else if (userRole === 'TEACHER') {
        dashboardUrl = '/teacher/dashboard';
      } else if (userRole === 'STUDENT') {
        dashboardUrl = '/student/dashboard';
      }

      const response = NextResponse.redirect(
        new URL(dashboardUrl, request.url)
      );
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
