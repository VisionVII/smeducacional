'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Lock,
  Users,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function AdminAccessPage() {
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simular validação de código de acesso
    // Em produção, isso seria validado com uma API segura
    if (accessCode === 'ADMIN2025') {
      // Redirecionar para login de admin
      window.location.href = '/admin/login';
    } else {
      setError(
        'Código de acesso inválido. Entre em contato com o gerenciador de sistema.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-red-600">
            SM Educa
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Voltar</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Aluno?</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center space-y-6 mb-16">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Gerenciamento central da plataforma SM Educa. Apenas
              administradores autorizados têm acesso.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: Users,
                title: 'Gestão de Usuários',
                description: 'Gerencie alunos, professores e administradores',
              },
              {
                icon: BarChart3,
                title: 'Analytics Avançados',
                description: 'Estatísticas detalhadas de toda a plataforma',
              },
              {
                icon: Settings,
                title: 'Configurações Globais',
                description: 'Controle total das configurações do sistema',
              },
              {
                icon: Lock,
                title: 'Segurança',
                description: 'Monitoramento e auditoria de todas as ações',
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="mb-3">
                    <div className="bg-gradient-to-br from-red-300/30 to-red-300/10 ring-1 ring-red-400/30 ring-offset-1 ring-offset-background shadow-md rounded-lg h-10 w-10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-red-600 drop-shadow-sm" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Info */}
          <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 mb-12">
            <CardContent className="pt-6 flex gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                  Acesso Restrito
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Este é um painel administrativo protegido. Apenas usuários com
                  credenciais de administrador podem acessar as funções
                  completas do sistema.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Access Form or Button */}
          {!showAccessForm ? (
            <div className="text-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setShowAccessForm(true)}
              >
                Solicitar Acesso
              </Button>
            </div>
          ) : (
            <Card className="max-w-md mx-auto border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle>Verificação de Acesso</CardTitle>
                <CardDescription>
                  Digite o código de acesso de administrador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAccessRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Código de Acesso</Label>
                    <Input
                      id="accessCode"
                      type="password"
                      placeholder="••••••••"
                      value={accessCode}
                      onChange={(e) => {
                        setAccessCode(e.target.value);
                        setError('');
                      }}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Acessar Painel
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowAccessForm(false);
                        setAccessCode('');
                        setError('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Info Section */}
        <section className="bg-gray-50 dark:bg-gray-800/50 py-16 mt-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Responsabilidades do Administrador
                </h3>
                <ul className="space-y-3">
                  {[
                    'Gerenciar contas de usuários e permissões',
                    'Monitorar atividades e garantir segurança',
                    'Processar relatórios e estatísticas',
                    'Manter integridade dos dados',
                    'Resolver problemas técnicos',
                    'Implementar políticas da plataforma',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                  Precisa de ajuda?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Se você é um administrador autorizado e não possui o código de
                  acesso, entre em contato com o gerenciador de segurança.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">Entre em Contato</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-900 border-t mt-20">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-4">SMEducacional</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Plataforma educacional profissional
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">Plataforma</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link href="/" className="hover:text-red-600">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-red-600">
                      Student Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses" className="hover:text-red-600">
                      Cursos
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">Administração</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link href="/teacher/page" className="hover:text-red-600">
                      Para Professores
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-red-600">
                      Segurança
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-red-600">
                      Política
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">Suporte</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link href="/faq" className="hover:text-red-600">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-red-600">
                      Contato
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-red-600">
                      Termos
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>© 2025 SMEducacional. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
