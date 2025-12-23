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
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// Componente de contador animado
function AnimatedCounter({
  target,
  duration = 2000,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${target}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible, target]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return <span>{count}</span>;
}

export default function HomePage() {
  const [heroInView, setHeroInView] = useState(false);
  const [testimonialInView, setTestimonialInView] = useState(false);

  useEffect(() => {
    setHeroInView(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <AdaptiveNavbar />

      {/* Hero Section com camadas e efeitos */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 md:pb-32">
        {/* Background gradient animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10" />

        {/* Elementos decorativos */}
        <div className="absolute top-10 left-5 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div
          className="absolute -bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: '2s' }}
        />

        {/* Conteúdo do Hero */}
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center flex-1">
          {/* Badge com efeito */}
          <div
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 transition-all duration-700 ${
              heroInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles
              className="h-4 w-4 text-primary animate-spin"
              style={{ animationDuration: '3s' }}
            />
            <span className="text-sm font-semibold text-primary">
              Transforme sua carreira agora
            </span>
          </div>

          {/* Heading com animação */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight px-2 bg-gradient-to-r from-gray-900 via-primary to-purple-600 dark:from-white dark:via-primary dark:to-purple-400 bg-clip-text text-transparent transition-all duration-700 ${
              heroInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            Aprenda no seu ritmo,
            <br />
            <span className="relative">
              conquiste seus objetivos
              <span className="absolute bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-transparent opacity-50" />
            </span>
          </h1>

          {/* Subtítulo com delay */}
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 transition-all duration-700 delay-100 ${
              heroInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            Plataforma completa de ensino com{' '}
            <strong>cursos estruturados</strong>,{' '}
            <strong>certificados reconhecidos</strong> e{' '}
            <strong>acompanhamento personalizado</strong>. Junte-se a mais de
            5.000 alunos em busca de transformação.
          </p>

          {/* CTAs com efeito stagger */}
          <div
            className={`flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-stretch sm:items-center px-4 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              heroInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-14 text-base font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative group overflow-hidden"
            >
              <Link href="/courses" className="flex items-center gap-2">
                <span>Explorar Cursos</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-w-[200px] h-14 text-base font-semibold hover:scale-105 transition-all duration-300"
            >
              <Link href="/about" className="flex items-center gap-2">
                Saiba Mais
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section como Segunda Camada ao Fundo */}
        <div className="relative container mx-auto px-4 py-12 md:py-16 mt-8 md:mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: 'Cursos Completos',
                desc: 'Aulas em vídeo, materiais extras e exercícios práticos',
              },
              {
                icon: Award,
                title: 'Certificados',
                desc: 'Certificado digital ao concluir cada curso',
              },
              {
                icon: Users,
                title: 'Suporte Dedicado',
                desc: 'Professores disponíveis para tirar suas dúvidas',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group text-center p-6 md:p-7 rounded-xl border-2 bg-card/80 backdrop-blur hover:shadow-xl hover:border-primary/50 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{
                  animation: `slideIn 0.6s ease-out ${0.2 + idx * 0.1}s both`,
                }}
              >
                <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 mb-4 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all">
                  <feature.icon className="h-10 w-10 md:h-12 md:w-12 text-primary group-hover:rotate-12 transition-transform" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* Stats Section com Contadores Animados */}
      <section className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent dark:from-primary/15 dark:to-transparent py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 max-w-5xl mx-auto">
            {[
              {
                icon: BookOpen,
                value: 100,
                label: 'Cursos Disponíveis',
                suffix: '+',
              },
              { icon: Users, value: 5000, label: 'Alunos Ativos', suffix: '+' },
              {
                icon: GraduationCap,
                value: 50,
                label: 'Professores',
                suffix: '+',
              },
              { icon: Star, value: 98, label: 'Satisfação', suffix: '%' },
            ].map((stat, idx) => (
              <div
                key={idx}
                id={`counter-${stat.value}`}
                className="text-center p-4 group"
              >
                <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-8 w-8 md:h-10 md:w-10 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2 font-mono">
                  <AnimatedCounter target={stat.value} />
                  <span className="text-2xl">{stat.suffix}</span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section com efeitos de camada */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 px-2">
            Benefícios para você
          </h2>
          <p className="text-center text-muted-foreground mb-12 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
            Tudo que você precisa para aprender, crescer e alcançar sucesso
          </p>

          <div className="space-y-6 md:space-y-8">
            {[
              {
                icon: Clock,
                title: 'Aprenda no seu tempo',
                desc: 'Acesse os cursos quando quiser, de onde estiver. Aprenda no seu ritmo, sem pressão ou prazos apertados.',
              },
              {
                icon: TrendingUp,
                title: 'Acompanhe seu progresso',
                desc: 'Sistema completo de acompanhamento com estatísticas detalhadas e relatórios personalizados.',
              },
              {
                icon: CheckCircle,
                title: 'Certificação reconhecida',
                desc: 'Certificados digitais válidos que comprovam seu conhecimento e habilidades no mercado.',
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="group flex gap-4 md:gap-6 items-start p-6 md:p-8 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 hover:from-primary/10 hover:to-purple-500/10 dark:hover:from-primary/15 dark:hover:to-purple-500/15 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-102"
                style={{
                  animation: `slideIn 0.6s ease-out ${0.1 + idx * 0.15}s both`,
                }}
              >
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-7 w-7 md:h-8 md:w-8 text-primary group-hover:rotate-12 transition-transform" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .hover\:scale-102:hover {
            transform: scale(1.02);
          }
        `}</style>
      </section>

      {/* Testimonials Section Melhorada */}
      <section className="bg-gradient-to-b from-transparent via-primary/5 to-purple-500/5 dark:via-primary/10 dark:to-purple-500/10 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-75 animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="relative container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 px-2">
            O que nossos alunos dizem
          </h2>
          <p className="text-center text-muted-foreground mb-12 md:mb-16 text-base md:text-lg">
            Veja como estamos transformando vidas
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Maria Silva',
                role: 'Desenvolvedora Web',
                text: 'Excelente plataforma! Os cursos são muito bem estruturados e os professores são atenciosos.',
                stars: 5,
              },
              {
                name: 'João Santos',
                role: 'Analista de Dados',
                text: 'Consegui mudar de carreira graças aos cursos da plataforma. Recomendo muito!',
                stars: 5,
              },
              {
                name: 'Ana Costa',
                role: 'Designer UX/UI',
                text: 'Material de qualidade e certificados que realmente agregam valor ao currículo.',
                stars: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="group bg-card/80 backdrop-blur p-6 md:p-8 rounded-xl border-2 border-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                style={{
                  animation: `slideUp 0.6s ease-out ${0.2 + idx * 0.15}s both`,
                }}
              >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Stars */}
                <div className="relative flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary group-hover:scale-110 transition-transform"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="relative text-muted-foreground mb-6 text-sm md:text-base leading-relaxed font-medium">
                  <span className="text-3xl text-primary/30 absolute -top-2 -left-2">
                    &ldquo;
                  </span>
                  {testimonial.text}
                  <span className="text-3xl text-primary/30 absolute -bottom-6 -right-2">
                    &rdquo;
                  </span>
                </p>

                {/* Author */}
                <div className="relative pt-4 border-t border-primary/10">
                  <p className="font-bold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* CTA Section - Comece sua jornada com efeitos chamativo */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto relative">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-10 blur-2xl rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl animate-pulse" />

          {/* Conteúdo */}
          <div className="relative bg-gradient-to-br from-card/95 to-card/80 dark:from-card/90 dark:to-card/70 backdrop-blur-sm rounded-3xl p-8 md:p-14 border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 group">
            {/* Badge no topo */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary animate-bounce" />
              <span className="text-xs md:text-sm font-semibold text-primary">
                Oferta Especial
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-gray-900 to-primary dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
              Comece sua jornada hoje
            </h2>

            <p className="text-muted-foreground mb-8 md:mb-10 text-base md:text-lg leading-relaxed max-w-xl">
              Cadastre-se <strong>gratuitamente</strong> e tenha acesso imediato
              a cursos de qualidade. Sem cartão de crédito. Sem compromisso.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto min-w-[240px] h-14 text-base font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative group/btn overflow-hidden"
              >
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2"
                >
                  <span>Criar conta gratuita</span>
                  <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <p className="text-sm text-muted-foreground flex items-center gap-1">
                ✓ Sem cartão de crédito
              </p>
            </div>

            {/* Decorative element */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
