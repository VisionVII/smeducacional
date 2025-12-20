'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { AdaptiveNavbar } from '@/components/adaptive-navbar';
import {
  BookOpen,
  GraduationCap,
  Award,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
} from 'lucide-react';
// Removido redirecionamento automático para permitir navegação livre em páginas públicas

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Não redirecionar automaticamente usuários logados na Home */}

      {/* Menu adaptativo - simples para não logados, completo para logados */}
      <AdaptiveNavbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center flex-1">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2">
          Aprenda no seu ritmo,
          <br />
          conquiste seus objetivos
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
          Plataforma completa de ensino com cursos, certificados e
          acompanhamento personalizado
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center px-4 max-w-md sm:max-w-none mx-auto">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto min-w-[160px] h-12 text-base font-semibold"
          >
            <Link href="/courses">Explorar Cursos</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto min-w-[160px] h-12 text-base font-semibold"
          >
            <Link href="/about">Saiba Mais</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-14 px-2">
          Por que escolher a SM Educacional?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6 md:p-8 rounded-xl border-2 bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3">
              Cursos Completos
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Aulas em vídeo, materiais extras e exercícios práticos
            </p>
          </div>
          <div className="text-center p-6 md:p-8 rounded-xl border-2 bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Award className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3">Certificados</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Certificado digital ao concluir cada curso
            </p>
          </div>
          <div className="text-center p-6 md:p-8 rounded-xl border-2 bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Users className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3">
              Suporte Dedicado
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Professores disponíveis para tirar suas dúvidas
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 dark:bg-primary/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 max-w-5xl mx-auto">
            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                100+
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                Cursos Disponíveis
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                5.000+
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                Alunos Ativos
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                50+
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                Professores
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                98%
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                Satisfação
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-14 px-2">
            Benefícios para você
          </h2>
          <div className="space-y-6 md:space-y-8">
            <div className="flex gap-4 md:gap-6 items-start p-4 md:p-6 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Aprenda no seu tempo
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Acesse os cursos quando quiser, de onde estiver. Aprenda no
                  seu ritmo, sem pressão.
                </p>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6 items-start p-4 md:p-6 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Acompanhe seu progresso
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Sistema completo de acompanhamento com estatísticas e
                  relatórios detalhados.
                </p>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6 items-start p-4 md:p-6 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Certificação reconhecida
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Certificados digitais válidos que comprovam seu conhecimento e
                  habilidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-14 px-2">
            O que nossos alunos dizem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="bg-card p-6 md:p-8 rounded-xl border-2 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                &ldquo;Excelente plataforma! Os cursos são muito bem
                estruturados e os professores são atenciosos.&rdquo;
              </p>
              <p className="font-semibold">Maria Silva</p>
              <p className="text-sm text-muted-foreground">
                Desenvolvedora Web
              </p>
            </div>
            <div className="bg-card p-6 md:p-8 rounded-xl border-2 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                &ldquo;Consegui mudar de carreira graças aos cursos da
                plataforma. Recomendo muito!&rdquo;
              </p>
              <p className="font-bold">João Santos</p>
              <p className="text-sm text-muted-foreground">Analista de Dados</p>
            </div>
            <div className="bg-card p-6 md:p-8 rounded-xl border-2 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                &ldquo;Material de qualidade e certificados que realmente
                agregam valor ao currículo.&rdquo;
              </p>
              <p className="font-semibold">Ana Costa</p>
              <p className="text-sm text-muted-foreground">Designer UX/UI</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 rounded-2xl p-8 md:p-12 border-2 border-primary/20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Comece sua jornada hoje
          </h2>
          <p className="text-muted-foreground mb-8 md:mb-10 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Cadastre-se gratuitamente e tenha acesso a cursos de qualidade
          </p>
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            <Link href="/register">Criar conta gratuita</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
