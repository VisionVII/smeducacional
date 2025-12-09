import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Recarregar dados do usuário do banco se necessário
      if (token.id && !user) {
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
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      // Atualizar sessão com dados mais recentes do token
      if (session.user && token.id && token.role) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
        session.user.avatar = token.avatar as string | null | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se está tentando acessar a página de login/register após autenticado, redireciona para dashboard
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Após login bem-sucedido, redireciona baseado no papel do usuário
      // O signIn retorna para callbackUrl ou baseUrl por padrão
      return baseUrl;
    },
    async signIn({ user, account }) {
      // Permitir login se é credentials ou google
      if (
        account?.provider === 'credentials' ||
        account?.provider === 'google'
      ) {
        return true;
      }
      return false;
    },
  },
});
