'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export default function TeacherSignupPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Gerenciamento de Cursos',
      description:
        'Crie, organize e gerencie seus cursos com ferramentas intuitivas',
    },
    {
      icon: Users,
      title: 'Turmas Ilimitadas',
      description:
        'Ensine quantos alunos quiser em múltiplos cursos simultâneos',
    },
    {
      icon: DollarSign,
      title: 'Monetização Direta',
      description:
        'Receba pagamentos diretos pelos seus cursos sem intermediários',
    },
    {
      icon: BarChart3,
      title: 'Analíticos Detalhados',
      description: 'Acompanhe o desempenho de seus alunos em tempo real',
    },
    {
      icon: Clock,
      title: 'Flexibilidade Total',
      description: 'Trabalhe no seu próprio ritmo e horário',
    },
    {
      icon: TrendingUp,
      title: 'Crescimento Garantido',
      description: 'Ferramentas integradas para aumentar suas vendas',
    },
  ];

  const benefits = [
    'Comissão de até 70% do valor dos cursos',
    'Dashboard analytics avançado',
    'Suporte 24/7 dedicado',
    'Certificados digitais automáticos',
    'Integração com múltiplas plataformas',
    'Marketing tools inclusos',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            SMEducacional
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
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full px-4 py-2">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Oportunidade para Educadores
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Monetize seu Conhecimento
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Crie cursos online, ganhe dinheiro e impacte a vida de milhares de
              alunos. Tudo em uma plataforma segura e profissional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
                asChild
              >
                <Link href="/teacher/login" className="flex items-center gap-2">
                  Teacher Signup <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Saiba Mais</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            {[
              { number: '10K+', label: 'Professores Ativos' },
              { number: '500K+', label: 'Alunos Satisfeitos' },
              { number: 'R$ 50M+', label: 'Pagos aos Educadores' },
              { number: '98%', label: 'Taxa de Satisfação' },
            ].map((stat, index) => (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {stat.number}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 dark:bg-gray-800/50 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                Tudo que você precisa
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Ferramentas completas para criar, vender e gerenciar seus cursos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                Por que escolher a gente?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="lg:col-span-1 border-emerald-200 dark:border-emerald-900">
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-900/20">
                <CardTitle>Comece Hoje</CardTitle>
                <CardDescription>
                  Junte-se a milhares de educadores bem-sucedidos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✅ Cadastro rápido (5 minutos)
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✅ Nenhum custo inicial
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✅ Primeiro curso gratuito
                </p>
                <Button
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  asChild
                >
                  <Link href="/teacher/login">Teacher Signup</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-xl text-emerald-50">
              Crie seu primeiro curso agora e comece a ganhar dinheiro
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-white hover:bg-gray-100"
            >
              <Link href="/teacher/login" className="flex items-center gap-2">
                Teacher Signup <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-900 border-t">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-4">SMEducacional</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conectando educadores e alunos
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">Platform</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link href="/" className="hover:text-emerald-600">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-emerald-600">
                      Student Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses" className="hover:text-emerald-600">
                      Cursos
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">Para Educadores</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link
                      href="/teacher/login"
                      className="hover:text-emerald-600"
                    >
                      Teacher Signup
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-emerald-600">
                      Como Funciona
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-emerald-600">
                      Ganhe Dinheiro
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">Suporte</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link href="/faq" className="hover:text-emerald-600">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-emerald-600">
                      Contato
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-emerald-600">
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
