'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { BookOpen, GraduationCap, Award, Users, Moon, Sun, TrendingUp, Clock, CheckCircle, Star } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </Link>
          
          <nav className="hidden sm:flex gap-4 md:gap-6 items-center">
            <Link href="/courses" className="text-sm md:text-base hover:text-primary transition-colors">
              Cursos
            </Link>
            <Link href="/about" className="text-sm md:text-base hover:text-primary transition-colors">
              Sobre
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>
            )}

            <Button asChild variant="ghost" size="sm" className="text-sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="text-sm">
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center flex-1">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
          Aprenda no seu ritmo,<br />conquiste seus objetivos
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          Plataforma completa de ensino com cursos, certificados e acompanhamento personalizado
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
          <Button asChild size="lg" className="w-full sm:w-auto min-w-[160px]">
            <Link href="/courses">Explorar Cursos</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px]">
            <Link href="/about">Saiba Mais</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12">
          Por que escolher a SM Educacional?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <BookOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Cursos Completos</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Aulas em vídeo, materiais extras e exercícios práticos
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <Award className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Certificados</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Certificado digital ao concluir cada curso
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Suporte Dedicado</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Professores disponíveis para tirar suas dúvidas
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 dark:bg-primary/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100+</div>
              <p className="text-sm md:text-base text-muted-foreground">Cursos Disponíveis</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5.000+</div>
              <p className="text-sm md:text-base text-muted-foreground">Alunos Ativos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-sm md:text-base text-muted-foreground">Professores</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-sm md:text-base text-muted-foreground">Satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12">
            Benefícios para você
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Aprenda no seu tempo</h3>
                <p className="text-muted-foreground">
                  Acesse os cursos quando quiser, de onde estiver. Aprenda no seu ritmo, sem pressão.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Acompanhe seu progresso</h3>
                <p className="text-muted-foreground">
                  Sistema completo de acompanhamento com estatísticas e relatórios detalhados.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Certificação reconhecida</h3>
                <p className="text-muted-foreground">
                  Certificados digitais válidos que comprovam seu conhecimento e habilidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12">
            O que nossos alunos dizem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Excelente plataforma! Os cursos são muito bem estruturados e os professores são atenciosos."
              </p>
              <p className="font-semibold">Maria Silva</p>
              <p className="text-sm text-muted-foreground">Desenvolvedora Web</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Consegui mudar de carreira graças aos cursos da plataforma. Recomendo muito!"
              </p>
              <p className="font-semibold">João Santos</p>
              <p className="text-sm text-muted-foreground">Analista de Dados</p>
            </div>
            <div className="bg-card p-6 rounded-lg border md:col-span-2 lg:col-span-1">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Material de qualidade e certificados que realmente agregam valor ao currículo."
              </p>
              <p className="font-semibold">Ana Costa</p>
              <p className="text-sm text-muted-foreground">Designer UX/UI</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Comece sua jornada hoje
          </h2>
          <p className="text-muted-foreground mb-6 md:mb-8 text-base md:text-lg">
            Cadastre-se gratuitamente e tenha acesso a cursos de qualidade
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px]">
            <Link href="/register">Criar conta gratuita</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
