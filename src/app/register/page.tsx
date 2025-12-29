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

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <style>{keyframes}</style>

      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        {/* Gradient overlays para efeito mais sofisticado */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5 opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Card com design sofisticado */}
              style={{ animationDuration: '3s' }}
            />
            <span className="text-sm font-medium text-primary">
              {mounted
                ? t.auth.register.subtitle
                : 'Junte-se à nossa comunidade'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {mounted ? t.auth.register.title : 'Criar uma nova conta'}
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            {mounted
              ? t.auth.register.subtitle
              : 'Preencha os dados abaixo para começar sua jornada de aprendizado'}
          </p>
        </div>

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
              {mounted ? t.auth.register.title : 'Criar conta'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {mounted ? t.auth.register.subtitle : 'Preencha os dados para começar'}
            </p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-6">
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
                {mounted ? t.auth.login.withGoogle : 'Continuar com Google'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/15" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background/90 px-2 text-muted-foreground">
                    {mounted ? t.auth.login.or : 'Ou registre-se'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide">
                  {mounted ? t.auth.register.name : 'Nome Completo'}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={mounted ? t.auth.register.name : 'Seu nome'}
                  className="h-10 text-sm bg-background/40 border border-primary/20 hover:border-primary/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors rounded-md"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide">
                  {mounted ? t.auth.register.email : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-10 text-sm bg-background/40 border border-primary/20 hover:border-primary/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors rounded-md"
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
            <CardFooter className="flex flex-col space-y-3 px-6 pb-6 pt-2">
              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary via-primary to-purple-600 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300"
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
              <div className="pt-3 border-t border-primary/10">
                <div className="space-y-2 text-center text-xs">
                  <p className="text-muted-foreground">
                    {mounted ? t.auth.register.hasAccount : 'Já tem uma conta?'}{' '}
                    <Link
                      href="/login"
                      className="text-primary hover:text-primary/80 font-semibold hover:underline"
                    >
                      {mounted ? t.auth.register.signIn : 'Fazer login'}
                    </Link>
                  </p>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
                  >
                    <Home className="h-3 w-3" />
                    <span>
                      {mounted ? t.common.back : 'Voltar'}
                    </span>
                  </Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
