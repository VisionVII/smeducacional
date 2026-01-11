'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { GraduationCap, ArrowLeft, Mail } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { useTranslatedToast } from '@/lib/translation-helpers';
import { useSystemBranding } from '@/hooks/use-system-branding';
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, mounted } = useTranslations();
  const toast = useTranslatedToast();
  const { branding } = useSystemBranding();
  const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar código');
      }

      toast.success('codeSent');

      setStep('code');
    } catch (error) {
      console.error('[forgot-password step1]', error);
      toast.error('generic');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido');
      }

      toast.success('codeVerified');

      setStep('newPassword');
    } catch (error) {
      console.error('[forgot-password step2]', error);
      toast.error('generic');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('passwordsDoNotMatch');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('passwordTooShort');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha');
      }

      toast.success('passwordReset');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('[forgot-password step3]', error);
      toast.error('generic');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
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
                alt={branding.companyName || 'Logo'}
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
                    {mounted
                      ? t.auth.forgotPassword.title
                      : 'Recupere o acesso com segurança'}
                  </h1>
                  <p className="text-lg text-white/90 leading-relaxed max-w-md">
                    {step === 'email' &&
                      (mounted
                        ? t.auth.forgotPassword.subtitle
                        : 'Envie seu e-mail para receber o código de validação instantaneamente.')}
                    {step === 'code' &&
                      (mounted
                        ? t.auth.forgotPassword.codeSubtitle
                        : 'Digite o código enviado para seu email')}
                    {step === 'newPassword' &&
                      (mounted
                        ? t.auth.forgotPassword.newPasswordSubtitle
                        : 'Crie uma nova senha segura')}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                    <p className="text-sm text-white/70">Tempo médio</p>
                    <p className="text-2xl font-semibold">45s</p>
                    <p className="text-xs text-white/60">para recuperar</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                    <p className="text-sm text-white/70">99,9%</p>
                    <p className="text-2xl font-semibold">uptime</p>
                    <p className="text-xs text-white/60">infra segura</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                    <p className="text-sm text-white/70">Suporte</p>
                    <p className="text-2xl font-semibold">24/7</p>
                    <p className="text-xs text-white/60">monitorado</p>
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
              {step === 'email' &&
                (mounted ? t.auth.forgotPassword.title : 'Recuperar Senha')}
              {step === 'code' &&
                (mounted
                  ? t.auth.forgotPassword.codeTitle
                  : 'Verificar Código')}
              {step === 'newPassword' &&
                (mounted
                  ? t.auth.forgotPassword.newPasswordTitle
                  : 'Nova Senha')}
            </CardTitle>
          </CardHeader>
          <Card
            className="w-full max-w-md relative justify-self-center shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-background/95 to-background/90 border border-primary/30 hover:border-primary/50 transition-all duration-500"
            style={{ animation: 'slideInUp 0.6s ease-out 0.2s both' }}
          >
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold leading-tight">
                {step === 'email' &&
                  (mounted ? t.auth.forgotPassword.title : 'Recuperar Senha')}
                {step === 'code' &&
                  (mounted
                    ? t.auth.forgotPassword.codeTitle
                    : 'Verificar Código')}
                {step === 'newPassword' &&
                  (mounted
                    ? t.auth.forgotPassword.newPasswordTitle
                    : 'Nova Senha')}
              </CardTitle>
            </CardHeader>

            {step === 'email' && (
              <form onSubmit={handleSendCode}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {mounted ? t.auth.forgotPassword.email : 'Email'}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 text-base bg-background/50 border-primary/20 hover:border-primary/40 focus:border-primary/60 transition-colors"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary via-primary to-purple-600 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? mounted
                        ? t.common.loading
                        : 'Enviando...'
                      : mounted
                      ? t.auth.forgotPassword.submit
                      : 'Enviar Código'}
                  </Button>
                  <Button asChild variant="ghost" className="w-full" size="sm">
                    <Link href="/login" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {mounted
                        ? t.auth.forgotPassword.backToLogin
                        : 'Voltar para o login'}
                    </Link>
                  </Button>
                </CardFooter>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleVerifyCode}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      {mounted
                        ? t.auth.forgotPassword.code
                        : 'Código de Verificação'}
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      className="text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      {mounted
                        ? t.auth.forgotPassword.codeSubtitle
                        : 'Código enviado para'}{' '}
                      <strong>{email}</strong>
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary via-primary to-purple-600 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
                    disabled={isLoading || code.length !== 6}
                  >
                    {isLoading
                      ? mounted
                        ? t.common.loading
                        : 'Verificando...'
                      : mounted
                      ? t.auth.forgotPassword.verify
                      : 'Verificar Código'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    size="sm"
                    onClick={() => setStep('email')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {mounted ? t.common.back : 'Voltar'}
                  </Button>
                </CardFooter>
              </form>
            )}

            {step === 'newPassword' && (
              <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {mounted
                        ? t.auth.forgotPassword.newPassword
                        : 'Nova Senha'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {mounted
                        ? t.auth.forgotPassword.confirmPassword
                        : 'Confirmar Nova Senha'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? mounted
                        ? t.common.loading
                        : 'Salvando...'
                      : mounted
                      ? t.auth.forgotPassword.reset
                      : 'Redefinir Senha'}
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </Card>
      </div>
    </div>
  );
}
