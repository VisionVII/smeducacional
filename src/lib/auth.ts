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
      },
      async authorize(credentials) {
        console.log('[auth][authorize] Iniciando autorização:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.error('[auth][authorize] Credenciais faltando');
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
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

        console.log('[auth][authorize] Login autorizado com sucesso:', {
          id: user.id,
          email: user.email,
          role: user.role,
        });

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
    async jwt({ token, user, account, profile }) {
      console.log('[auth][jwt] ========== INICIANDO JWT CALLBACK ==========');
      console.log('[auth][jwt] Estado:', {
        hasUser: !!user,
        hasAccount: !!account,
        accountProvider: account?.provider,
        profileEmail: profile?.email,
        userEmail: user?.email,
        tokenId: token.id,
        tokenRole: token.role,
      });

      // Login com Google OAuth
      // Em produção, alguns provedores podem não preencher profile.email.
      // Garantimos usando user.email como fallback.
      if (account?.provider === 'google' && (profile?.email || user?.email)) {
        try {
          const oauthEmail = profile?.email || user?.email!;
          console.log('[auth][jwt] Processando login Google para:', oauthEmail);

          // Buscar ou criar usuário no banco
          let dbUser = await prisma.user.findUnique({
            where: { email: oauthEmail },
          });

          if (!dbUser) {
            console.log(
              '[auth][jwt] Usuário não existe, criando novo:',
              oauthEmail
            );
            // Criar novo usuário
            dbUser = await prisma.user.create({
              data: {
                email: oauthEmail,
                name:
                  (profile as any)?.name ||
                  (user as any)?.name ||
                  oauthEmail.split('@')[0],
                avatar: (profile as any).picture || null,
                emailVerified: new Date(),
                role: 'STUDENT', // Padrão para novos usuários
              },
            });
            console.log('[auth][jwt] Novo usuário Google criado:', dbUser.id);
          } else {
            console.log('[auth][jwt] Usuário existente encontrado:', dbUser.id);
          }

          token.id = dbUser.id;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar;
          token.name = dbUser.name;
          token.email = dbUser.email;
          console.log('[auth][jwt] ✅ Token Google preenchido com sucesso:', {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
          });
          console.log(
            '[auth][jwt] ========== FIM JWT CALLBACK (GOOGLE) =========='
          );
          return token;
        } catch (error) {
          console.error('[auth][jwt] ❌ Erro ao processar login Google:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          console.log(
            '[auth][jwt] ========== FIM JWT CALLBACK (ERRO) =========='
          );
          throw error;
        }
      }

      // Login com credenciais (tem user e não é OAuth já processado)
      if (user && account?.provider !== 'google') {
        console.log(
          '[auth][jwt] Login bem-sucedido, salvando dados no token:',
          {
            id: user.id,
            email: user.email,
            role: (user as any).role,
            hasAccount: !!account,
          }
        );
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
        token.name = user.name || '';
        token.email = user.email || '';
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
            console.log('[auth][jwt] Recarregado do banco:', {
              id: dbUser.id,
              role: dbUser.role,
            });
          }
        } catch (error) {
          console.error('Erro ao recarregar usuário no JWT:', error);
        }
      }

      console.log('[auth][jwt] ========== FIM JWT CALLBACK (FINAL) ==========');
      console.log('[auth][jwt] Token retornado:', {
        id: token.id,
        role: token.role,
        email: token.email,
      });
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log('[auth][redirect] Processando redirect:', { url, baseUrl });

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
        });
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
};

// Helper para obter sessão nos Server Components e API Routes
export const auth = () => getServerSession(authOptions);
