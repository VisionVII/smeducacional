import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

// Configurar providers baseado nas variáveis de ambiente disponíveis
const providers: NextAuthConfig['providers'] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email e senha são obrigatórios');
      }

      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email as string,
        },
      });

      if (!user || !user.password) {
        throw new Error('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      };
    },
  }),
];

// Adicionar Google Provider apenas se as credenciais estiverem configuradas
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      // Quando usuário faz login (tem user)
      if (user) {
        console.log(
          '[auth][jwt] Login bem-sucedido, salvando dados no token:',
          {
            id: user.id,
            email: user.email,
            role: user.role,
          }
        );
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
        token.name = user.name;
        token.email = user.email;
      }

      // Se não tem user mas tem token.id, recarregar do banco
      if (token.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true,
            },
          });
          if (dbUser) {
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.role = dbUser.role;
            token.avatar = dbUser.avatar;
          }
        } catch (error) {
          console.error('Erro ao recarregar usuário no JWT:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Adicionar todas as informações do token na sessão
      if (session?.user) {
        console.log('[auth][session] Criando sessão para:', {
          id: token.id,
          email: token.email,
          role: token.role,
        });
        session.user.id = token.id as string;
        session.user.role = token.role as string as typeof session.user.role;
        session.user.avatar = token.avatar as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirecionar para a URL solicitada se estiver no mesmo domínio
      if (url.startsWith(baseUrl)) return url;
      // Fallback para home
      return baseUrl;
    },
  },
});
