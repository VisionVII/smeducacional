import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Log de diagnóstico para confirmar carregamento da rota em dev
if (process.env.NODE_ENV !== 'production') {
  console.log('[nextauth][route] \tRota [...nextauth] carregada');
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
