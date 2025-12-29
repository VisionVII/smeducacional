'use client';

import { useState } from 'react';
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
import { GraduationCap, ArrowLeft, Mail, Sparkles } from 'lucide-react';
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
`;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, mounted } = useTranslations();
  const toast = useTranslatedToast();
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
    <div className="min-h-screen w-full overflow-hidden">
      <style>{keyframes}</style>

      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent opacity-40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 mb-6 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/20 transition-all duration-300">
            <Sparkles
              className="h-4 w-4 text-primary animate-spin"
              style={{ animationDuration: '3s' }}
            />
            <span className="text-sm font-medium text-primary">
              {mounted ? t.auth.forgotPassword.title : 'Recuperação de conta'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {mounted ? t.auth.forgotPassword.title : 'Recuperar sua senha'}
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            {step === 'email' &&
              (mounted
                ? t.auth.forgotPassword.subtitle
                : 'Digite seu email para receber o código de recuperação')}
            {step === 'code' &&
              (mounted
                ? t.auth.forgotPassword.codeSubtitle
                : 'Digite o código de 6 dígitos enviado para seu email')}
            {step === 'newPassword' &&
              (mounted
                ? t.auth.forgotPassword.newPasswordSubtitle
                : 'Crie uma nova senha segura para sua conta')}
          </p>
        </div>

        {/* Card */}
        <Card
          className="w-full max-w-md relative shadow-2xl backdrop-blur-xl bg-background/80 border border-primary/20 hover:border-primary/40 transition-all duration-300"
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
                    {mounted ? t.auth.forgotPassword.newPassword : 'Nova Senha'}
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
      </div>
    </div>
  );
}
