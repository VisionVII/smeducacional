'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { GraduationCap, Mail, Home, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/password-input';
import { useSystemBranding } from '@/hooks/use-system-branding';

export default function LoginPage() {
  const router = useRouter();
  const { branding } = useSystemBranding();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [require2FA, setRequire2FA] = useState(false);
  const [twofaCode, setTwofaCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalized2FA = twofaCode.replace(/\s+/g, '');

      console.log('Iniciando login com:', {
        email: formData.email,
        has2FA: !!normalized2FA,
      });

      // Usar signIn com redirect: false para controlar o fluxo
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        twoFactorCode: normalized2FA || undefined,
        redirect: false,
      });

      console.log('Resultado do signIn:', result);

      if (!result) {
        toast({
          title: 'Erro',
          description: 'Resposta inválida do servidor',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // 🔐 Detectar necessidade de 2FA
      const errorMessage = result.error || '';

      if (
        errorMessage === '2FA_REQUIRED' ||
        errorMessage.includes('2FA') ||
        errorMessage.includes('TOTP')
      ) {
        console.log(
          '⚠️ 2FA requerido ou código inválido, exibindo UI para código'
        );
        setRequire2FA(true);
        toast({
          title: 'Autenticação 2FA necessária',
          description:
            errorMessage === '2FA_REQUIRED'
              ? 'Digite o código do app autenticador.'
              : errorMessage,
          variant: errorMessage === '2FA_REQUIRED' ? 'default' : 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (result.error) {
        console.error('Login error:', result.error);
        toast({
          title: 'Erro ao fazer login',
          description: result.error,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (result.ok) {
        console.log('✅ Login bem-sucedido (com 2FA validado se aplicável)');
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando...',
        });

        // CRÍTICO: Aguardar 1.5s para garantir que o cookie foi definido no browser e server
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Buscar sessão para obter o role do usuário
        try {
          const sessionRes = await fetch('/api/auth/session', {
            cache: 'no-store',
          });
          const session = await sessionRes.json();

          console.log('Session obtida:', session);

          if (session?.user?.role) {
            let dashboardUrl = '/student/dashboard'; // padrão
            if (session.user.role === 'ADMIN') {
              dashboardUrl = '/admin';
            } else if (session.user.role === 'TEACHER') {
              dashboardUrl = '/teacher/dashboard';
            }
            console.log(
              `Redirecionando para ${dashboardUrl} (role: ${session.user.role})`
            );
            // Flag para permitir apenas um redirecionamento pós-login
            sessionStorage.setItem('postLoginRedirect', '1');
            // Usar window.location.href para forçar full page reload e garantir cookies
            window.location.href = dashboardUrl;
          } else {
            // Se não conseguir obter role, redireciona para student como fallback
            console.log(
              'Role não encontrado na sessão, redirecionando para student/dashboard'
            );
            sessionStorage.setItem('postLoginRedirect', '1');
            window.location.href = '/student/dashboard';
          }
        } catch (error) {
          console.error('Erro ao obter sessão:', error);
          // Fallback: tentar redirecionar mesmo sem sessão, middleware vai redirecionar se necessário
          sessionStorage.setItem('postLoginRedirect', '1');
          window.location.href = '/student/dashboard';
        }
        // Não chamar setIsLoading(false) porque estamos redirecionando
      } else {
        toast({
          title: 'Erro',
          description: 'Falha ao fazer login',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao fazer login',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Redirecionar para endpoint que detectará o role após Google login
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer login com Google',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-16 object-contain"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-sm">
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="min-h-[44px]"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                autoComplete="username"
              />
            </div>

            <PasswordInput
              id="password"
              label="Senha"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
              showStrength={false}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, rememberMe: checked as boolean })
                  }
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Lembrar-me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="flex items-center justify-between w-full text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Voltar ao início
              </Link>
              <p className="text-muted-foreground">
                Não tem uma conta?{' '}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>

            <div className="pt-4 border-t text-center text-xs text-muted-foreground space-y-2">
              <p>
                É professor?{' '}
                <Link
                  href="/teacher"
                  className="text-primary hover:underline font-medium"
                >
                  Conheça nosso programa
                </Link>
              </p>
              <p className="text-muted-foreground/70">
                Esqueceu sua senha?{' '}
                <Link
                  href="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Recuperar acesso
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>

        <Dialog
          open={require2FA}
          onOpenChange={(open) => {
            setRequire2FA(open);
            if (!open) setTwofaCode('');
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Verificação 2FA necessária
              </DialogTitle>
              <DialogDescription>
                Digite o código de 6 dígitos do seu app autenticador para
                continuar.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = twofaCode.trim();
                if (code.length !== 6) {
                  toast({
                    title: 'Código inválido',
                    description: 'Informe os 6 dígitos do autenticador.',
                    variant: 'destructive',
                  });
                  return;
                }
                handleSubmit(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="twofaCode">Código 2FA</Label>
                <Input
                  id="twofaCode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={twofaCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setTwofaCode(val);
                  }}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRequire2FA(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Verificar 2FA
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
