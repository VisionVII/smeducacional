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
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
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
        twoFactorCode: { label: '2FA Code', type: 'text', optional: true },
      },
      async authorize(credentials) {
        console.log('[auth][authorize] Iniciando autorização:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          has2FA: !!credentials?.twoFactorCode,
        });

        if (!credentials?.email || !credentials?.password) {
          console.error('[auth][authorize] Credenciais faltando');
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
            password: true,
            emailVerified: true,
            twoFactorEnabled: true,
            twoFactorSecret: true,
          },
        });

        console.log('[auth][authorize] Usuário encontrado:', {
          found: !!user,
          email: user?.email,
          hasPassword: !!user?.password,
          role: user?.role,
        });

        if (!user) {
          console.error('[auth][authorize] Usuário não encontrado');
          throw new Error('Usuário não encontrado');
        }

        if (!user.password) {
          console.error('[auth][authorize] Usuário sem senha (OAuth)');
          throw new Error(
            'Este usuário foi criado via OAuth. Use o provedor original para fazer login.'
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log('[auth][authorize] Validação de senha:', {
          isValid: isPasswordValid,
          passwordLength: credentials.password.length,
          hashLength: user.password.length,
        });

        if (!isPasswordValid) {
          console.error('[auth][authorize] Senha inválida');
          throw new Error('Credenciais inválidas');
        }

        // 🔐 VALIDAÇÃO 2FA OBRIGATÓRIA
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          console.log('[auth][authorize] 🔐 Usuário possui 2FA habilitado');

          const twoFactorCode = credentials.twoFactorCode?.trim();

          if (!twoFactorCode) {
            console.log(
              '[auth][authorize] ⚠️ 2FA requerido mas código não fornecido'
            );
            throw new Error('2FA_REQUIRED');
          }

          // Importar função de verificação TOTP
          const { verifyTOTP } = await import('@/lib/totp');
          // Aumentar tolerância para 3 passos (~90s) para lidar com clock skew
          const isValid = verifyTOTP(user.twoFactorSecret, twoFactorCode, 3);

          if (!isValid) {
            console.error('[auth][authorize] ❌ Código 2FA inválido');
            throw new Error('Código 2FA inválido ou expirado');
          }

          console.log('[auth][authorize] ✅ Código 2FA validado com sucesso');
        }

        console.log('[auth][authorize] Login autorizado com sucesso:', {
          id: user.id,
          email: user.email,
          role: user.role,
          twoFactorValidated: user.twoFactorEnabled,
        });

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          password: user.password,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        } as any;
      },
    }),
    // Adicionar Google Provider apenas se credenciais estiverem configuradas
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[auth][signIn] Iniciando sign in:', {
        provider: account?.provider,
        userEmail: user?.email,
      });

      // Google OAuth
      if (account?.provider === 'google') {
        try {
          console.log('[auth][signIn] Validando conta Google:', profile?.email);

          // Validar que email existe
          if (!profile?.email) {
            console.error('[auth][signIn] Google profile sem email');
            return false;
          }

          console.log('[auth][signIn] ✅ Google sign in permitido');
          return true;
        } catch (error) {
          console.error('[auth][signIn] Erro no Google sign in:', error);
          return false;
        }
      }

      // Credentials provider
      if (account?.provider === 'credentials') {
        console.log('[auth][signIn] ✅ Credentials sign in permitido');
        return true;
      }

      console.log('[auth][signIn] Provider desconhecido:', account?.provider);
      return true;
    },
    async jwt({ token, user, account, profile, trigger }) {
      console.log('[auth][jwt] ========== JWT CALLBACK ==========');
      console.log(
        '[auth][jwt] trigger:',
        trigger,
        'hasUser:',
        !!user,
        'hasAccount:',
        !!account
      );

      // PRIMEIRO LOGIN - account existe (Google ou Credentials)
      if (account?.provider === 'google') {
        const email = (profile?.email || user?.email) as string;
        console.log('[auth][jwt] 🔵 Google login inicial para:', email);

        let dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            twoFactorEnabled: true,
          },
        });

        if (!dbUser) {
          console.log('[auth][jwt] Criando novo usuário Google');
          dbUser = await prisma.user.create({
            data: {
              email,
              name: (profile as any)?.name || user?.name || email.split('@')[0],
              avatar: (profile as any)?.picture || null,
              emailVerified: new Date(),
              role: 'STUDENT',
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true,
              twoFactorEnabled: true,
            },
          });
        }

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.role = dbUser.role;
        token.avatar = dbUser.avatar;
        token.twoFactorEnabled = dbUser.twoFactorEnabled;
        if (process.env.NODE_ENV === 'development') {
          console.log('[auth][jwt] ✅ Token Google populado');
        }
        return token;
      }

      // Credentials login
      if (account?.provider === 'credentials' && user) {
        token.id = user.id;
        token.email = user.email!;
        token.name = user.name || '';
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
        token.twoFactorEnabled = (user as any).twoFactorEnabled || false;
        if (process.env.NODE_ENV === 'development') {
          console.log('[auth][jwt] ✅ Token Credentials populado');
        }
        return token;
      }

      // REQUISIÇÕES SUBSEQUENTES - account é null, recarregar do banco
      // NextAuth v4 não passa account/profile em cada request, só no primeiro login
      if (!account && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            twoFactorEnabled: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar;
          token.twoFactorEnabled = dbUser.twoFactorEnabled;
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar;
          if (process.env.NODE_ENV === 'development') {
            console.log('[auth][jwt] 🔄 Token recarregado do banco');
          }
        } else {
          console.error(
            '[auth][jwt] ❌ Usuário não encontrado no banco:',
            token.email
          );
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[auth][jwt] Token final');
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log('[auth][redirect] Processando redirect:', { url, baseUrl });

      // NUNCA redirecionar rotas da API (causa erro CLIENT_FETCH_ERROR)
      if (url.includes('/api/')) {
        return url;
      }

      // Se URL é relativa e começa com /, usar direto com baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Se URL já tem baseUrl, usar direto
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Fallback: voltar para baseUrl
      return baseUrl;
    },
    async session({ session, token }) {
      // Adicionar todas as informações do token na sessão
      if (session?.user) {
        console.log('[auth][session] Criando sessão para:', {
          id: token.id,
          email: token.email,
          role: token.role,
          twoFactorEnabled: token.twoFactorEnabled,
        });
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
        (session.user as any).twoFactorEnabled =
          token.twoFactorEnabled || false;
      }
      return session;
    },
  },
};

// Helper para obter sessão nos Server Components e API Routes
export const auth = () => getServerSession(authOptions);
