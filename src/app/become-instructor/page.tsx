'use client';

import Link from 'next/link';
import { BookOpen, Users, TrendingUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

export default function BecomeInstructorPage() {
  const { t, mounted } = useTranslations();

  const benefits = mounted
    ? t.publicPages.becomeInstructor.benefits
    : [
        {
          title: 'Crie com facilidade',
          description:
            'Ferramentas intuitivas para criar cursos profissionais em minutos',
          icon: 'book',
        },
        {
          title: 'Alcance milhares',
          description: 'Conecte-se com alunos de todo o Brasil',
          icon: 'users',
        },
        {
          title: 'Ganhe renda',
          description: 'Monetize seu conhecimento com recorrência',
          icon: 'trending',
        },
      ];

  const plans = mounted
    ? t.publicPages.becomeInstructor.plans
    : [
        {
          badge: 'Free',
          title: 'R$ 0/mês',
          description: '15% de taxa por venda. Ideal para começar rápido.',
          perks: [
            'Publicação ilimitada de cursos',
            'Suporte e certificação incluídos',
            'Receba 85% do valor por venda',
            'Painel financeiro em tempo real',
          ],
        },
      ];

  const features = mounted
    ? t.publicPages.becomeInstructor.features
    : [
        'Plataforma completa de gerenciamento de cursos',
        'Upload ilimitado de vídeos e materiais',
      ];

  const iconMap = {
    book: BookOpen,
    users: Users,
    trending: TrendingUp,
  } as const;

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {mounted
            ? t.publicPages.becomeInstructor.hero.title
            : 'Compartilhe seu conhecimento'}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {mounted
            ? t.publicPages.becomeInstructor.hero.subtitle
            : 'Junte-se a milhares de instrutores que estão transformando vidas através da educação online'}
        </p>
        <Link href="/register?role=TEACHER">
          <Button size="lg" className="text-lg">
            {mounted
              ? t.publicPages.becomeInstructor.hero.cta
              : 'Começar agora'}
          </Button>
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        {benefits.map((benefit) => {
          const Icon =
            iconMap[benefit.icon as keyof typeof iconMap] || BookOpen;

          return (
            <div key={benefit.title} className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          );
        })}
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          {mounted
            ? t.publicPages.becomeInstructor.plansTitle
            : 'Planos para instrutores'}
        </h2>
        <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
          {mounted
            ? t.publicPages.becomeInstructor.plansSubtitle
            : 'Transparência total: aluno paga o valor do curso ao professor. No plano Free, a plataforma retém 15% por venda. Em planos pagos, cobramos uma mensalidade do professor e repassamos 100% do valor das vendas.'}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.badge}
              className="border rounded-xl p-6 shadow-sm bg-white dark:bg-background"
            >
              <p className="text-sm font-semibold text-primary mb-2">
                {plan.badge}
              </p>
              <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          {mounted
            ? t.publicPages.becomeInstructor.featuresTitle
            : 'O que você ganha como instrutor'}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          {mounted
            ? t.publicPages.becomeInstructor.cta.title
            : 'Pronto para começar sua jornada?'}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          {mounted
            ? t.publicPages.becomeInstructor.cta.subtitle
            : 'Crie sua conta gratuitamente e comece a construir seu primeiro curso hoje mesmo'}
        </p>
        <Link href="/register?role=TEACHER">
          <Button size="lg" className="text-lg">
            {mounted
              ? t.publicPages.becomeInstructor.cta.button
              : 'Cadastrar como instrutor'}
          </Button>
        </Link>
      </section>
    </div>
  );
}
