'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { AdaptiveNavbar } from '@/components/adaptive-navbar';
import { useTranslations } from '@/hooks/use-translations';
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
  const [mounted, setMounted] = useState(false);
  const { t, mounted: translationsLoaded } = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  const testimonials = translationsLoaded
    ? [
        {
          name: t.home.testimonials.author1,
          role: t.home.testimonials.role1,
          text: t.home.testimonials.quote1,
          stars: 5,
        },
        {
          name: t.home.testimonials.author2,
          role: t.home.testimonials.role2,
          text: t.home.testimonials.quote2,
          stars: 5,
        },
        {
          name: t.home.testimonials.author3,
          role: t.home.testimonials.role3,
          text: t.home.testimonials.quote3,
          stars: 5,
        },
      ]
    : [
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
      ];

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
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles
              className="h-4 w-4 text-primary animate-spin"
              style={{ animationDuration: '3s' }}
            />
            <span className="text-sm font-semibold text-primary">
              {translationsLoaded
                ? t.home.hero.badge
                : 'Transforme sua carreira agora'}
            </span>
          </div>

          {/* Heading com animação */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight px-2 bg-gradient-to-r from-gray-900 via-primary to-purple-600 dark:from-white dark:via-primary dark:to-purple-400 bg-clip-text text-transparent transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {translationsLoaded ? t.home.hero.title : 'Aprenda no seu ritmo,'}
            <br />
            <span className="relative">
              {translationsLoaded
                ? t.home.hero.titleHighlight
                : 'conquiste seus objetivos'}
              <span className="absolute bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-transparent opacity-50" />
            </span>
          </h1>

          {/* Subtítulo com delay */}
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {translationsLoaded
              ? t.home.hero.subtitle
              : 'Plataforma completa de ensino com cursos estruturados, certificados reconhecidos e acompanhamento personalizado. Junte-se a mais de 5.000 alunos em busca de transformação.'}
          </p>

          {/* CTAs com efeito stagger */}
          <div
            className={`flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-stretch sm:items-center px-4 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-14 text-base font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative group overflow-hidden"
            >
              <Link
                href="/courses"
                className="flex items-center gap-2"
                suppressHydrationWarning
              >
                <span>
                  {translationsLoaded ? t.home.hero.cta : 'Explorar Cursos'}
                </span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-w-[200px] h-14 text-base font-semibold hover:scale-105 transition-all duration-300"
            >
              <Link
                href="/about"
                className="flex items-center gap-2"
                suppressHydrationWarning
              >
                {translationsLoaded ? t.home.hero.ctaSecondary : 'Saiba Mais'}
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
                key: 'courses',
              },
              {
                icon: Award,
                key: 'certificates',
              },
              {
                icon: Users,
                key: 'support',
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
                  {translationsLoaded
                    ? t.home.features[feature.key].title
                    : feature.key === 'courses'
                    ? 'Cursos Completos'
                    : feature.key === 'certificates'
                    ? 'Certificados'
                    : 'Suporte Dedicado'}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {translationsLoaded
                    ? t.home.features[feature.key].description
                    : feature.key === 'courses'
                    ? 'Aulas em vídeo, materiais extras e exercícios práticos'
                    : feature.key === 'certificates'
                    ? 'Certificado digital ao concluir cada curso'
                    : 'Professores disponíveis para tirar suas dúvidas'}
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

      {/* Stats Section com Contadores Animados - Como Camada */}
      <section className="bg-gradient-to-b from-transparent via-primary/5 to-purple-500/5 dark:via-primary/10 dark:to-purple-500/10 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              {
                icon: BookOpen,
                value: 100,
                key: 'courses',
                suffix: '+',
              },
              { icon: Users, value: 5000, key: 'students', suffix: '+' },
              {
                icon: GraduationCap,
                value: 50,
                key: 'hours',
                suffix: '+',
              },
              { icon: Star, value: 98, key: 'satisfaction', suffix: '%' },
            ].map((stat, idx) => (
              <div
                key={idx}
                id={`counter-${stat.value}`}
                className="text-center p-4 md:p-6 group transition-all duration-300 hover:scale-110"
                style={{
                  animation: `slideUp 0.6s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div className="flex justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                  <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:from-primary/30 group-hover:to-purple-500/30">
                    <stat.icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2 font-mono">
                  <AnimatedCounter target={stat.value} />
                  <span className="text-2xl ml-1">{stat.suffix}</span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  {translationsLoaded
                    ? t.home.stats[stat.key]
                    : stat.key === 'courses'
                    ? 'Cursos Disponíveis'
                    : stat.key === 'students'
                    ? 'Alunos Ativos'
                    : stat.key === 'hours'
                    ? 'Professores'
                    : 'Satisfação'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes slideUp {
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

      {/* Benefits Section com efeitos de camada */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 px-2">
            {mounted ? t.home.benefits.title : 'Benefícios para você'}
          </h2>
          <p className="text-center text-muted-foreground mb-12 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
            {mounted
              ? t.home.benefits.subtitle
              : 'Tudo que você precisa para aprender, crescer e alcançar sucesso'}
          </p>

          <div className="space-y-6 md:space-y-8">
            {[
              {
                icon: Clock,
                title: mounted
                  ? t.home.benefits.learn.title
                  : 'Aprenda no seu tempo',
                desc: mounted
                  ? t.home.benefits.learn.description
                  : 'Acesse os cursos quando quiser, de onde estiver. Aprenda no seu ritmo, sem pressão ou prazos apertados.',
              },
              {
                icon: TrendingUp,
                title: mounted
                  ? t.home.benefits.progress.title
                  : 'Acompanhe seu progresso',
                desc: mounted
                  ? t.home.benefits.progress.description
                  : 'Sistema completo de acompanhamento com estatísticas detalhadas e relatórios personalizados.',
              },
              {
                icon: CheckCircle,
                title: mounted
                  ? t.home.benefits.certification.title
                  : 'Certificação reconhecida',
                desc: mounted
                  ? t.home.benefits.certification.description
                  : 'Certificados digitais válidos que comprovam seu conhecimento e habilidades no mercado.',
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

      {/* Testimonials Section Melhorada - Como Camada */}
      <section className="bg-gradient-to-b from-transparent via-primary/8 to-purple-500/5 dark:via-primary/12 dark:to-purple-500/8 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full mix-blend-multiply filter blur-3xl opacity-75 animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-2">
              {translationsLoaded
                ? t.home.testimonials.title
                : 'O que nossos alunos dizem'}
            </h2>
            <p className="text-center text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              {translationsLoaded
                ? t.home.testimonials.subtitle
                : 'Veja como estamos transformando vidas de pessoas que acreditam na educação contínua'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-card/90 to-card/70 dark:from-card/80 dark:to-card/60 backdrop-blur-md p-6 md:p-8 rounded-2xl border-2 border-primary/20 hover:border-primary/60 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                style={{
                  animation: `slideUp 0.6s ease-out ${0.2 + idx * 0.15}s both`,
                }}
              >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Decorative element */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150 duration-300" />

                {/* Stars */}
                <div className="relative flex gap-1 mb-5">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-orange-400 text-orange-400 group-hover:scale-125 transition-all"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="relative text-muted-foreground mb-6 text-sm md:text-base leading-relaxed font-medium italic">
                  <span className="text-4xl text-primary/20 absolute -top-4 -left-2">
                    &ldquo;
                  </span>
                  {testimonial.text}
                  <span className="text-4xl text-primary/20 absolute -bottom-6 -right-2">
                    &rdquo;
                  </span>
                </p>

                {/* Author */}
                <div className="relative pt-6 border-t border-primary/10 group-hover:border-primary/30 transition-colors">
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {testimonial.name}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground group-hover:text-muted-foreground/80">
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

      {/* Modelos de receita para professores */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {mounted ? t.home.instructorPlans.title : 'Para professores'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-3">
            {mounted
              ? t.home.instructorPlans.subtitle
              : 'Planos claros e receita transparente'}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {mounted
              ? t.home.instructorPlans.description
              : 'Aluno paga diretamente o valor do curso ao professor. No plano Free aplicamos 15% de taxa por venda. Em planos pagos cobramos uma mensalidade do professor e repassamos 100% das vendas.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">
                {mounted ? t.home.instructorPlans.freePlan.badge : 'Plano Free'}
              </h3>
              <span className="text-sm font-semibold text-primary">
                {mounted ? '15% por venda' : '15% por venda'}
              </span>
            </div>
            <p className="text-3xl font-bold mb-3">
              {mounted ? t.home.instructorPlans.freePlan.title : 'R$ 0/mês'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {mounted
                ? t.home.instructorPlans.freePlan.description
                : 'Comece sem mensalidade. Repasse líquido de 85% por venda.'}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(mounted
                ? t.home.instructorPlans.freePlan.perks
                : [
                    'Publicação de cursos sem limite',
                    'Certificados e suporte incluídos',
                    'Painel financeiro em tempo real',
                  ]
              ).map((perk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl border bg-gradient-to-br from-primary/10 via-white to-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">
                {mounted ? t.home.instructorPlans.paidPlan.badge : 'Plano Pago'}
              </h3>
              <span className="text-sm font-semibold text-primary">
                {mounted ? '0% por venda' : '0% por venda'}
              </span>
            </div>
            <p className="text-3xl font-bold mb-3">
              {mounted
                ? t.home.instructorPlans.paidPlan.title
                : 'Mensalidade ao admin'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {mounted
                ? t.home.instructorPlans.paidPlan.description
                : 'Mensalidade fixa para remover taxas por venda e destravar benefícios extras.'}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(mounted
                ? t.home.instructorPlans.paidPlan.perks
                : [
                    'Repasse integral das vendas',
                    'Destaque no catálogo e slots de anúncios opcionais',
                    'Analytics avançado e suporte prioritário',
                  ]
              ).map((perk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
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
              {translationsLoaded
                ? t.home.cta.title
                : 'Comece sua jornada hoje'}
            </h2>

            <p className="text-muted-foreground mb-8 md:mb-10 text-base md:text-lg leading-relaxed max-w-xl">
              {translationsLoaded
                ? t.home.cta.subtitle
                : 'Cadastre-se gratuitamente e tenha acesso imediato a cursos de qualidade. Sem cartão de crédito. Sem compromisso.'}
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
                  suppressHydrationWarning
                >
                  <span>
                    {translationsLoaded
                      ? t.home.cta.button
                      : 'Criar conta gratuita'}
                  </span>
                  <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <p className="text-sm text-muted-foreground flex items-center gap-1">
                ✓{' '}
                {translationsLoaded
                  ? t.home.cta.noCreditCard
                  : 'Sem cartão de crédito'}
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
