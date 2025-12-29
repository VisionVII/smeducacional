'use client';

import Image from 'next/image';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GraduationCap, Home, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/password-input';
import { useSystemBranding } from '@/hooks/use-system-branding';
import { useTranslations } from '@/hooks/use-translations';
import { useTranslatedToast } from '@/lib/translation-helpers';

const keyframes = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export default function LoginPage() {
  const { branding } = useSystemBranding();
  const { t, mounted } = useTranslations();
  const toast = useTranslatedToast();
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
        toast.error('generic');
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
        setIsLoading(false);
        return;
      }

      if (result.error) {
        console.error('Login error:', result.error);
        toast.error('invalidCredentials');
        setIsLoading(false);
        return;
      }

      if (result.ok) {
        console.log('✅ Login bem-sucedido (com 2FA validado se aplicável)');
        toast.success('loginSuccess');

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
        toast.error('generic');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('generic');
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
      toast.error('generic');
      setIsLoading(false);
    }
  };

  const loginBgStyle = branding.loginBgUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${branding.loginBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <style>{keyframes}</style>

      {/* Background */}
      <div className="fixed inset-0">
        {branding.loginBgUrl ? (
          <div className="absolute inset-0" style={loginBgStyle} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        )}
        {/* Gradient overlays para efeito mais sofisticado */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5 opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-20" />
      </div>

      {/* Content - só renderiza após mounted para evitar hydration mismatch */}
      {!mounted ? (
        <div className="relative z-10 h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="relative z-10 h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Card com design sofisticado */}
          <Card
            className="w-full max-w-sm relative shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-background/95 to-background/90 border border-primary/30 hover:border-primary/50 transition-all duration-500"
            style={{ animation: 'slideInUp 0.8s ease-out both' }}
          >
            {/* Borda luminosa subtle */}
            <div className="absolute -inset-px bg-gradient-to-r from-primary/50 via-primary/20 to-primary/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />

            <CardHeader className="space-y-2 text-center px-6 pt-8 pb-4">
              <div className="flex justify-center mb-6">
                {branding.logoUrl ? (
                  <Image
                    src={branding.logoUrl}
                    alt={branding.companyName}
                    width={180}
                    height={48}
                    className="h-10 w-auto max-w-[160px] object-contain drop-shadow-lg"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary via-primary to-purple-600 flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-semibold leading-tight text-foreground">
                {branding.loginTitle || t.auth.login.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t.auth.login.subtitle || 'Acesse sua conta para continuar'}
              </p>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 px-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wide"
                  >
                    {t.auth.login.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    autoComplete="username"
                    inputMode="email"
                    className="h-10 text-sm bg-background/40 border border-primary/20 hover:border-primary/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors rounded-md"
                  />
                </div>

                <PasswordInput
                  id="password"
                  label={t.auth.login.password}
                  placeholder={'Digite sua senha'}
                  value={formData.password}
                  onChange={(value) =>
                    setFormData({ ...formData, password: value })
                  }
                  showStrength={false}
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          rememberMe: checked as boolean,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                    >
                      {t.auth.login.rememberMe}
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                  >
                    {t.auth.login.forgotPassword}
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 px-6 pb-6 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 text-sm border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
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
                  {t.auth.login.withGoogle}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/15" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background/90 px-2 text-muted-foreground">
                      {t.auth.login.or}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary via-primary to-purple-600 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? t.common.loading : t.auth.login.submit}
                </Button>

                <div className="pt-3 border-t border-primary/10">
                  <div className="space-y-2 text-center text-xs">
                    <p className="text-muted-foreground">
                      {t.auth.login.noAccount}{' '}
                      <Link
                        href="/register"
                        className="text-primary hover:text-primary/80 font-semibold hover:underline"
                      >
                        {t.auth.login.signUp}
                      </Link>
                    </p>
                    <Link
                      href="/"
                      className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
                    >
                      <Home className="h-3 w-3" />
                      <span>{t.common.back}</span>
                    </Link>
                  </div>
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
                      toast.error('invalidCode');
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
      )}
    </div>
  );
}
