'use client';

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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { GraduationCap, Home, Sparkles } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { useSystemBranding } from '@/hooks/use-system-branding';

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
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
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

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Redirecionando para o login...',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      toast({
        title: 'Erro ao criar conta',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/student/dashboard' });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer login com Google',
        variant: 'destructive',
      });
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
            <Sparkles className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-sm font-medium text-primary">Junte-se à nossa comunidade</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Criar uma <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">nova conta</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Preencha os dados abaixo para começar sua jornada de aprendizado
          </p>
        </div>

        {/* Card */}
        <Card className="w-full max-w-md relative shadow-2xl backdrop-blur-xl bg-background/80 border border-primary/20 hover:border-primary/40 transition-all duration-300" style={{ animation: 'slideInUp 0.6s ease-out 0.2s both' }}>
      </div>

      <Card className="w-full max-w-md"
        <CardHeader className="space-y-3 text-center px-6 pt-8">
          <div className="flex justify-center mb-4">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-12 w-auto max-w-[180px] object-contain drop-shadow-lg"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold leading-tight">
            Criar conta
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-base border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300"
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
                <span className="w-full border-t border-primary/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/80 px-2 text-muted-foreground">
                  Ou registre-se com email
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                className="h-11 text-base bg-background/50 border-primary/20 hover:border-primary/40 focus:border-primary/60 transition-colors"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="h-11 text-base bg-background/50 border-primary/20 hover:border-primary/40 focus:border-primary/60 transition-colors"
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
              label="Senha"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
              showStrength
              showGenerator
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirmar senha"
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(value) =>
                setFormData({ ...formData, confirmPassword: value })
              }
              showStrength={false}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-6 pb-8">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary via-primary to-purple-600 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary flex items-center gap-1 touch-target no-tap-highlight transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="text-sm">Voltar ao início</span>
              </Link>
              <p className="text-muted-foreground text-center">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium touch-target no-tap-highlight"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </div>
    </div>
  );
}
