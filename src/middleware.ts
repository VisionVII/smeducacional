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

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthRoute = pathname.startsWith('/api/auth');
  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || isAuthRoute;

  console.log(
    `[middleware] path: ${pathname}, hasToken: ${!!token}, role: ${token?.role}`
  );

  // Se não tem token e não é rota pública, redirecionar para login
  if (!token && !isPublicRoute) {
    console.log(`[middleware] Sem token, redirecionando para /login`);
    const response = NextResponse.redirect(new URL('/login', request.url));
    return addSecurityHeaders(response);
  }

  // Se tem token, validar permissões de rota
  if (token) {
    const userRole = token.role as string;
    console.log(`[middleware] Token válido com role: ${userRole}`);

    // Validar rotas protegidas por role
    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
      console.log(`[middleware] Acesso negado /student para role ${userRole}`);
      const response = NextResponse.redirect(new URL('/', request.url));
      return addSecurityHeaders(response);
    }

    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
      console.log(`[middleware] Acesso negado /teacher para role ${userRole}`);
      const response = NextResponse.redirect(new URL('/', request.url));
      return addSecurityHeaders(response);
    }

    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      console.log(`[middleware] Acesso negado /admin para role ${userRole}`);
      const response = NextResponse.redirect(new URL('/', request.url));
      return addSecurityHeaders(response);
    }

    // Se já está logado e tenta acessar /login ou /register, redirecionar para dashboard
    if (pathname === '/login' || pathname === '/register') {
      console.log(
        `[middleware] Usuário logado tentando acessar ${pathname}, redirecionando para dashboard`
      );

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
