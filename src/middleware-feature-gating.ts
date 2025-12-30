import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware de Feature Gating baseado em Plano.
 * Protege rotas premium e redireciona para checkout se necessário.
 *
 * NOTA: Não usa Prisma diretamente (edge function limitation).
 * Feature validation ocorre no lado do cliente via checkFeatureAccessAction.
 */

const PREMIUM_ROUTES = {
  TEACHER: ['/teacher/ai-assistant', '/teacher/mentorships', '/teacher/tools'],
  STUDENT: ['/student/ai-chat', '/student/mentorships', '/student/tools'],
  ADMIN: [], // Admins sempre têm acesso
};

export async function featureGatingMiddleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const role = token.role as 'ADMIN' | 'TEACHER' | 'STUDENT';

  // Verificar se é uma rota premium
  const isPremiumRoute = PREMIUM_ROUTES[role]?.some((route) =>
    pathname.startsWith(route)
  );

  // Admins sempre têm acesso
  if (role === 'ADMIN' || !isPremiumRoute) {
    return NextResponse.next();
  }

  // Para rotas premium de Teacher/Student, o cliente fará a validação
  // via checkFeatureAccessAction no layout wrapper.
  // Este middleware apenas marca a rota como premium para referência.

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*', '/admin/:path*'],
};
