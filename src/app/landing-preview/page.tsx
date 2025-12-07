'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Check,
  Users,
  Star,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import {
  TeacherThemeProvider,
  useTeacherTheme,
} from '@/components/teacher-theme-provider';

interface FAQItem {
  question: string;
  answer: string;
}

interface LandingConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  ctaLabel: string;
  ctaLink: string;
  ctaColor: 'primary' | 'secondary' | 'accent';
  highlightOne: string;
  highlightOneIcon: string;
  highlightTwo: string;
  highlightTwoIcon: string;
  highlightThree: string;
  highlightThreeIcon: string;
  testimonial: string;
  testimonialAuthor: string;
  modules: string[];
  faqItems: FAQItem[];
  sectionOrder: string[];
  backgroundColor: string;
  textColor: string;
  showSocialProof: boolean;
  showModules: boolean;
  showTestimonial: boolean;
  showFaq: boolean;
}

function LandingPageContent() {
  const { theme } = useTeacherTheme();
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    loadLanding();
  }, []);

  const loadLanding = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos

      const response = await fetch('/api/teacher/landing', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else if (response.status === 401) {
        console.error('Usuário não autorizado');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Timeout ao carregar landing (8s)');
      } else {
        console.error('Erro ao carregar landing:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getCtaButtonClass = () => {
    const colors = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
    };
    return colors[config.ctaColor];
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Conteúdo */}
            <div className="space-y-6">
              <Badge variant="outline" className="w-fit">
                🚀 Seu Curso Aguarda
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {config.heroTitle}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {config.heroSubtitle}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  asChild
                  className={`${getCtaButtonClass()} rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all gap-2`}
                >
                  <a href={config.ctaLink}>
                    {config.ctaLabel}
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg font-semibold"
                >
                  Fale conosco
                </Button>
              </div>

              {/* Social Proof */}
              {config.showSocialProof && (
                <div className="flex items-center gap-4 pt-6 border-t border-border">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-semibold"
                      >
                        +{i}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Centenas de alunos já transformaram suas vidas
                  </p>
                </div>
              )}
            </div>

            {/* Imagem Hero */}
            {config.heroImage && (
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={config.heroImage}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Diferenciais Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Por que escolher nossos cursos?
            </h2>
            <p className="text-muted-foreground text-lg">
              Tudo que você precisa para alcançar seus objetivos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: config.highlightOneIcon,
                title: config.highlightOne,
              },
              {
                icon: config.highlightTwoIcon,
                title: config.highlightTwo,
              },
              {
                icon: config.highlightThreeIcon,
                title: config.highlightThree,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-border bg-background hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Desenvolvido com expertise para sua melhor aprendizagem
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Módulos Section */}
      {config.showModules && config.modules.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Estrutura do Programa</h2>
              <p className="text-muted-foreground text-lg">
                {config.modules.length} módulos cuidadosamente organizados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.modules.map((module, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl border-2 border-primary/20 bg-background hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">{idx + 1}</span>
                    </div>
                    <p className="font-semibold text-foreground">{module}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial Section */}
      {config.showTestimonial && config.testimonial && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
          <div className="max-w-2xl mx-auto text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <blockquote className="text-2xl font-semibold mb-4 leading-relaxed">
              "{config.testimonial}"
            </blockquote>
            <p className="text-lg text-muted-foreground font-medium">
              — {config.testimonialAuthor}
            </p>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {config.showFaq && config.faqItems.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
                <HelpCircle className="h-8 w-8 text-primary" />
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-4">
              {config.faqItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === idx ? null : idx)
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold text-foreground">
                      {item.question}
                    </span>
                    <span
                      className={`transform transition-transform ${
                        expandedFAQ === idx ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {expandedFAQ === idx && (
                    <div className="p-4 bg-muted/30 border-t border-border">
                      <p className="text-muted-foreground">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Pronto para começar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Junte-se a centenas de alunos satisfeitos que já transformaram suas
            carreiras
          </p>
          <Button
            size="lg"
            asChild
            className={`${getCtaButtonClass()} rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all gap-2 mx-auto`}
          >
            <a href={config.ctaLink}>
              {config.ctaLabel}
              <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 SM Educacional. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPreviewPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TeacherThemeProvider>
        <LandingPageContent />
      </TeacherThemeProvider>
    </ThemeProvider>
  );
}
