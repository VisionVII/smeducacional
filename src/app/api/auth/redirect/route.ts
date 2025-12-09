import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Endpoint que redireciona para o dashboard correto baseado no role do usuário
 * Usado após login para determinar para qual dashboard redirecionar
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = session.user.role as string;
    let dashboardUrl = '/student/dashboard'; // padrão

    if (role === 'ADMIN') {
      dashboardUrl = '/admin/dashboard';
    } else if (role === 'TEACHER') {
      dashboardUrl = '/teacher/dashboard';
    }

    console.log(
      `[auth/redirect] Redirecionando ${session.user.email} (${role}) para ${dashboardUrl}`
    );

    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  } catch (error) {
    console.error('[auth/redirect] Erro:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
