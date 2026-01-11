'use client';

import Image from 'next/image';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GraduationCap, Home } from 'lucide-react';
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

export default function RegisterPage() {
  const router = useRouter();
  const { branding } = useSystemBranding();
  const { t, mounted } = useTranslations();
  const toast = useTranslatedToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error('passwordsDoNotMatch');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      toast.success('registerSuccess');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('[Register] register error', error);
      toast.error('generic');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/student/dashboard' });
    } catch (error) {
      console.error('[Register] google sign-in error', error);
      toast.error('generic');
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex bg-background"
      suppressHydrationWarning
    >
      <style jsx global>
        {keyframes}
      </style>

      {/* Hero Section - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background com Gradient Profissional */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />

        {/* Background Image (se existir) */}
        <div className="absolute inset-0 z-0">
          {branding.promotedCourse?.thumbnail ? (
            <Image
              src={branding.promotedCourse.thumbnail}
              alt={branding.promotedCourse.title}
              fill
              className="object-cover opacity-20"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
          )}
        </div>

        {/* Overlay sutil */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* Content Area */}
        <div className="relative z-20 flex flex-col justify-between p-12 text-white">
          {/* Logo Area */}
          <div
            className="flex items-center gap-3"
            style={{ animation: 'slideInLeft 0.6s ease-out both' }}
          >
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
          <div
            className="space-y-8 max-w-lg"
            style={{ animation: 'slideInLeft 0.6s ease-out 0.2s both' }}
          >
            {branding.advertisements && branding.advertisements.length > 0 ? (
              <div className="w-full">
                <PromotedCoursesCarousel />
              </div>
            ) : branding.promotedCourse ? (
              <div className="flex justify-center w-full">
                <PromotedCourseCard course={branding.promotedCourse} />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
                    Matrículas rápidas, seguras e com verificação instantânea
                  </h1>
                  <p className="text-lg text-white/90 leading-relaxed max-w-md">
                    Fluxo de criação de conta com validação em camadas, uso
                    obrigatório de senhas fortes e onboarding direto para o
                    catálogo.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                    <p className="text-sm text-white/70">Tempo médio</p>
                    <p className="text-2xl font-semibold">50s</p>
                    <p className="text-xs text-white/60">para iniciar</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                    <p className="text-sm text-white/70">Validação</p>
                    <p className="text-2xl font-semibold">100%</p>
                    <p className="text-xs text-white/60">segura</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                    <p className="text-sm text-white/70">Suporte</p>
                    <p className="text-2xl font-semibold">24/7</p>
                    <p className="text-xs text-white/60">disponível</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} {branding.companyName}. Todos os
            direitos reservados.
          </div>
        </div>
      </div>

      {/* Form Section - Responsivo */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-background">
        <Card
          className="w-full max-w-[440px] border shadow-xl bg-card"
          style={{ animation: 'fadeIn 0.6s ease-out both' }}
        >
          <CardHeader className="space-y-3 text-center pb-6 px-6 sm:px-8 pt-8">
            {/* Logo Mobile */}
            <div className="lg:hidden flex justify-center mb-4">
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

            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
              {mounted ? t.auth.register.title : 'Criar conta'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {mounted
                ? t.auth.register.subtitle
                : 'Preencha os dados para começar'}
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-6 sm:px-8">
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
                {mounted ? t.auth.login.withGoogle : 'Continuar com Google'}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {mounted ? t.auth.login.or : 'Ou registre-se'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {mounted ? t.auth.register.name : 'Nome Completo'}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={mounted ? t.auth.register.name : 'Seu nome'}
                  className="h-11 text-base"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {mounted ? t.auth.register.email : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-11 text-base"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  autoComplete="email"
                />
              </div>

              <PasswordInput
                id="password"
                label={mounted ? t.auth.register.password : 'Senha'}
                placeholder={
                  mounted ? t.auth.register.password : 'Mínimo 8 caracteres'
                }
                value={formData.password}
                onChange={(value) =>
                  setFormData({ ...formData, password: value })
                }
                showStrength
                showGenerator
              />

              <PasswordInput
                id="confirmPassword"
                label={
                  mounted ? t.auth.register.confirmPassword : 'Confirmar senha'
                }
                placeholder={
                  mounted
                    ? t.auth.register.confirmPassword
                    : 'Digite a senha novamente'
                }
                value={formData.confirmPassword}
                onChange={(value) =>
                  setFormData({ ...formData, confirmPassword: value })
                }
                showStrength={false}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 px-6 sm:px-8 pb-8">
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading
                  ? mounted
                    ? t.common.loading
                    : 'Criando conta...'
                  : mounted
                  ? t.auth.register.submit
                  : 'Criar conta'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {mounted ? t.auth.register.hasAccount : 'Já tem uma conta?'}{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/80 hover:underline"
                >
                  {mounted ? t.auth.register.signIn : 'Fazer login'}
                </Link>
              </div>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                {mounted ? t.common.back : 'Voltar'}
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
