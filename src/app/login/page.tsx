'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GraduationCap, Home, ShieldCheck, Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { useSystemBranding } from '@/hooks/use-system-branding';
import { useTranslations } from '@/hooks/use-translations';
import { useTranslatedToast } from '@/lib/translation-helpers';
import { PromotedCourseCard } from '@/components/promoted-course-card';
import { PromotedCoursesCarousel } from '@/components/promoted-courses-carousel';

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
`;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { branding } = useSystemBranding();
  const { t, mounted } = useTranslations();
  const toast = useTranslatedToast();

  const [isLoading, setIsLoading] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [twofaCode, setTwofaCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Handle URL errors
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'OAuthAccountNotLinked') {
      toast.error('oauthAccountNotLinked');
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        twoFactorCode: require2FA ? twofaCode : undefined,
      });

      if (result?.error) {
        if (result.error.includes('2FA')) {
          setRequire2FA(true);
          toast.info('twofaRequired');
        } else {
          toast.error('invalidCredentials');
        }
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success('loginSuccess');

        // Polling: Aguardar session estar disponível antes de redirecionar
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          try {
            const sessionRes = await fetch('/api/auth/session', {
              cache: 'no-store',
            });
            const session = await sessionRes.json();

            if (session?.user) {
              console.log(
                '[LOGIN] ✅ Session disponível, redirecionando...',
                session.user.role
              );

              // Redirecionar baseado em role
              const dashboardUrl =
                session.user.role === 'ADMIN'
                  ? '/admin'
                  : session.user.role === 'TEACHER'
                  ? '/teacher/dashboard'
                  : '/student/dashboard';

              window.location.href = dashboardUrl;
              return;
            }

            console.log(
              '[LOGIN] ⏳ Aguardando session...',
              attempts + 1,
              '/',
              maxAttempts
            );
          } catch (error) {
            console.error('[LOGIN] Erro ao buscar session:', error);
          }

          await new Promise((resolve) => setTimeout(resolve, 300));
          attempts++;
        }

        // Se chegou aqui, deu timeout
        console.error('[LOGIN] ❌ Timeout aguardando session');
        toast.error('generic');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('[Login] error', error);
      toast.error('generic');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/student/dashboard' });
    } catch (error) {
      console.error('[Login] google sign-in error', error);
      toast.error('generic');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      <style jsx global>
        {keyframes}
      </style>

      {/* Lado Esquerdo - Branding e Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-muted text-primary-foreground flex-col justify-between p-12 overflow-hidden">
        <div
          className={`absolute inset-0 z-10 ${
            branding.promotedCourse
              ? 'bg-gradient-to-t from-black/90 via-black/50 to-black/30'
              : 'bg-primary/90'
          }`}
        />
        <div className="absolute inset-0 z-0">
          {branding.promotedCourse?.thumbnail ? (
            <Image
              src={branding.promotedCourse.thumbnail}
              alt={branding.promotedCourse.title}
              fill
              className="object-cover"
              priority
            />
          ) : branding.loginBgUrl ? (
            <Image
              src={branding.loginBgUrl}
              alt="Background"
              fill
              className="object-cover opacity-50"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-purple-900" />
          )}
        </div>

        {/* Logo Area */}
        <div className="relative z-20 flex items-center gap-3">
          {branding.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt={branding.companyName}
              width={150}
              height={40}
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                {branding.companyName}
              </span>
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 space-y-6 max-w-lg w-full flex flex-col justify-center flex-1">
          {branding.advertisements && branding.advertisements.length > 0 ? (
            <div className="w-full max-w-5xl mx-auto">
              <PromotedCoursesCarousel />
            </div>
          ) : branding.promotedCourse ? (
            <div className="flex justify-center w-full">
              <PromotedCourseCard course={branding.promotedCourse} />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
                {t.auth.login.heroTitle ||
                  'Transforme seu futuro com educação de qualidade.'}
              </h1>
              <p className="text-lg text-white/80 leading-relaxed">
                {t.auth.login.heroSubtitle ||
                  'Acesse nossa plataforma e descubra um mundo de conhecimento preparado especialmente para você.'}
              </p>

              {/* Stats/Features */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">+1000</h3>
                  <p className="text-sm text-white/70">Alunos ativos</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">4.9/5</h3>
                  <p className="text-sm text-white/70">Avaliação média</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-20 text-sm text-white/60">
          © {new Date().getFullYear()} {branding.companyName}. Todos os direitos
          reservados.
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

        <Card
          className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-xl bg-transparent sm:bg-card/50 sm:backdrop-blur-xl"
          style={{ animation: 'slideInUp 0.6s ease-out both' }}
        >
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="lg:hidden flex justify-center mb-6">
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt={branding.companyName}
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {t.auth.login.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t.auth.login.subtitle}
            </p>

            {/* Credenciais de Teste */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🧪 Credenciais de Teste (Dev):
                </p>
                <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                  <div>
                    <strong>Admin:</strong> admin@smeducacional.com / admin123
                  </div>
                  <div>
                    <strong>Professor:</strong> professor@smeducacional.com /
                    teacher123
                  </div>
                  <div>
                    <strong>Aluno:</strong> aluno@smeducacional.com / student123
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Quick Login Buttons para Dev */}
              {process.env.NODE_ENV === 'development' && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      setFormData({
                        email: 'admin@smeducacional.com',
                        password: 'admin123',
                        rememberMe: false,
                      })
                    }
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      setFormData({
                        email: 'professor@smeducacional.com',
                        password: 'teacher123',
                        rememberMe: false,
                      })
                    }
                  >
                    Professor
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      setFormData({
                        email: 'aluno@smeducacional.com',
                        password: 'student123',
                        rememberMe: false,
                      })
                    }
                  >
                    Aluno
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.login.email}</Label>
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
                  className="h-11 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t.auth.login.password}</Label>
                </div>
                <PasswordInput
                  id="password"
                  value={formData.password}
                  onChange={(value) =>
                    setFormData({ ...formData, password: value })
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  showStrength={false}
                />
              </div>

              <div className="flex items-center justify-between">
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
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t.auth.login.rememberMe}
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  {t.auth.login.forgotPassword}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.common.loading}
                  </>
                ) : (
                  t.auth.login.submit
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t.auth.login.or}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
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
            </CardContent>
          </form>

          <CardFooter className="flex flex-col gap-4 pb-8">
            <div className="text-center text-sm text-muted-foreground">
              {t.auth.login.noAccount}{' '}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary/80 hover:underline"
              >
                {t.auth.login.signUp}
              </Link>
            </div>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              {t.common.back}
            </Link>
          </CardFooter>
        </Card>
      </div>

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
              <ShieldCheck className="h-5 w-5 text-primary" />
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
                className="text-center text-lg tracking-widest"
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
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Verificar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
