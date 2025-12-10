import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
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
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        if (!user.password) {
          throw new Error(
            'Este usuário foi criado via OAuth. Use o provedor original para fazer login.'
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Credenciais inválidas');
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          password: user.password,
          emailVerified: user.emailVerified,
        } as any;
      },
    }),
    // Adicionar Google Provider apenas se credenciais estiverem configuradas
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Login com Google OAuth
      if (account?.provider === 'google' && profile?.email) {
        try {
          // Buscar ou criar usuário no banco
          let dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });

          if (!dbUser) {
            // Criar novo usuário
            dbUser = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                avatar: (profile as any).picture || null,
                emailVerified: new Date(),
                role: 'STUDENT', // Padrão para novos usuários
              },
            });
            console.log('[auth][jwt] Novo usuário Google criado:', dbUser.id);
          }

          token.id = dbUser.id;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar;
          token.name = dbUser.name;
          token.email = dbUser.email;
        } catch (error) {
          console.error('[auth][jwt] Erro ao criar usuário Google:', error);
        }
      }

      // Login com credenciais (tem user)
      if (user && !account) {
        console.log(
          '[auth][jwt] Login bem-sucedido, salvando dados no token:',
          {
            id: user.id,
            email: user.email,
            role: (user as any).role,
          }
        );
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
        token.name = user.name || '';
        token.email = user.email || '';
      }

      // Se não tem user mas tem token.id, recarregar do banco
      if (token.id && !user && !account) {
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
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
};

// Helper function para usar nos Server Components
export const auth = () => getServerSession(authOptions);
