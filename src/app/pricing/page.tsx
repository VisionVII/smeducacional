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
import { Badge } from '@/components/ui/badge';
import { AdaptiveNavbar } from '@/components/adaptive-navbar';
import { Footer } from '@/components/footer';
import {
  Check,
  X,
  Crown,
  Rocket,
  Users,
  MessageSquare,
  DollarSign,
  Sparkles,
} from 'lucide-react';

/**
 * Página de Pricing - Planos e Preços
 *
 * SEO & AEO Otimizado:
 * - Título: "Planos e Preços - Plataforma de Cursos Online para Professores"
 * - Meta Description: "Compare planos e escolha o ideal para vender cursos online. A partir de R$ 0/mês para começar"
 * - Schema.org: Product, PriceSpecification
 * - FAQ Schema para AEO
 *
 * Keywords:
 * - plataforma de cursos online preço
 * - quanto custa criar cursos online
 * - planos para professores vender cursos
 * - marketplace de cursos preço
 */

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  );

  const plans = [
    {
      id: 'free',
      name: 'Plano Free',
      description: 'Ideal para começar e testar a plataforma',
      price: { monthly: 0, yearly: 0 },
      popular: false,
      icon: Users,
      color: 'from-gray-500 to-gray-600',
      features: [
        { text: 'Até 3 cursos publicados', included: true },
        { text: 'Upload de vídeos ilimitado', included: true },
        { text: 'Certificados personalizados', included: true },
        { text: 'Dashboard básico de vendas', included: true },
        { text: 'Taxa de 15% por venda', included: true, highlight: true },
        { text: 'Chat IA Professor Virtual', included: false, addon: true },
        { text: 'Relatórios avançados', included: false },
        { text: 'Landing page personalizada', included: false },
        { text: 'Suporte prioritário', included: false },
      ],
      cta: 'Começar Grátis',
      ctaLink: '/register?plan=free',
    },
    {
      id: 'pro',
      name: 'Plano Pro',
      description: 'Para professores que vendem ativamente',
      price: { monthly: 97, yearly: 970 },
      popular: true,
      icon: Crown,
      color: 'from-purple-500 to-blue-600',
      features: [
        { text: 'Cursos ilimitados', included: true },
        { text: 'Upload de vídeos ilimitado', included: true },
        { text: 'Certificados personalizados', included: true },
        { text: 'Dashboard completo + Analytics', included: true },
        { text: 'Taxa de 8% por venda', included: true, highlight: true },
        {
          text: 'Chat IA Professor Virtual INCLUSO',
          included: true,
          highlight: true,
        },
        { text: 'Landing page personalizada', included: true },
        { text: 'Relatórios avançados de alunos', included: true },
        { text: 'Suporte prioritário via email', included: true },
      ],
      cta: 'Começar Agora',
      ctaLink: '/register?plan=pro',
    },
    {
      id: 'enterprise',
      name: 'Plano Enterprise',
      description: 'Para escolas e empresas de treinamento',
      price: { monthly: 297, yearly: 2970 },
      popular: false,
      icon: Rocket,
      color: 'from-orange-500 to-red-600',
      features: [
        { text: 'Tudo do Plano Pro +', included: true },
        { text: 'Múltiplos instrutores (até 10)', included: true },
        { text: 'API para integrações', included: true },
        { text: 'White label (sua marca)', included: true },
        { text: 'Taxa de 5% por venda', included: true, highlight: true },
        { text: 'Gerente de conta dedicado', included: true },
        { text: 'Suporte telefônico 24/7', included: true },
        { text: 'Treinamento personalizado', included: true },
        { text: 'SLA de 99.9% uptime', included: true },
      ],
      cta: 'Falar com Vendas',
      ctaLink: '/contato?plan=enterprise',
    },
  ];

  const addons = [
    {
      name: 'Chat IA - Professor Virtual',
      description:
        'Assistente de IA que responde dúvidas dos alunos 24/7 sobre o conteúdo dos cursos',
      price: 29.9,
      icon: MessageSquare,
      availableFor: ['free'],
      benefits: [
        'Reduz tempo respondendo alunos em 80%',
        'Aumenta satisfação dos alunos',
        'Respostas instantâneas e precisas',
        'Funciona para todos os seus cursos',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Qual é o melhor plano para começar a vender cursos online?',
      answer:
        'O Plano Free é perfeito para testar a plataforma e publicar seus primeiros cursos sem custo inicial. Quando começar a vender ativamente, recomendamos migrar para o Plano Pro, que reduz as taxas de 15% para 8% e inclui recursos avançados como Chat IA e landing page personalizada.',
    },
    {
      question: 'Como funcionam as taxas por venda?',
      answer:
        'As taxas são cobradas apenas quando você vende. No Plano Free: 15%, no Pro: 8%, e no Enterprise: 5%. Isso significa que você só paga quando ganha. Por exemplo, em uma venda de R$ 100 no Plano Pro, você recebe R$ 92 e a plataforma fica com R$ 8.',
    },
    {
      question: 'Posso trocar de plano depois?',
      answer:
        'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O upgrade é instantâneo. No downgrade, as mudanças entram em vigor no próximo ciclo de cobrança.',
    },
    {
      question: 'O Chat IA realmente funciona?',
      answer:
        'Sim! O Chat IA é treinado especificamente no conteúdo dos seus cursos e responde dúvidas dos alunos com precisão. Professores que usam reportam redução de 80% no tempo gasto respondendo mensagens, mantendo alta satisfação dos alunos.',
    },
    {
      question: 'Existe período de teste no Plano Pro?',
      answer:
        'Sim! Oferecemos 14 dias de garantia no Plano Pro. Se não ficar satisfeito, reembolsamos 100% do valor sem perguntas.',
    },
  ];

  const getYearlySavings = (monthly: number) => {
    const yearlyCost = monthly * 12;
    const yearlyPrice = monthly * 10; // 2 meses grátis
    return (((yearlyCost - yearlyPrice) / yearlyCost) * 100).toFixed(0);
  };

  return (
    <>
      <AdaptiveNavbar />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              <DollarSign className="h-3 w-3 mr-1" />
              Planos Transparentes
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Escolha o Plano Ideal para Você
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Comece grátis e escale conforme suas vendas crescem. Sem taxas
              escondidas, sem surpresas.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span
                className={`font-semibold ${
                  billingCycle === 'monthly'
                    ? 'text-purple-600'
                    : 'text-muted-foreground'
                }`}
              >
                Mensal
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === 'monthly' ? 'yearly' : 'monthly'
                  )
                }
                className="relative inline-flex h-8 w-16 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    billingCycle === 'yearly'
                      ? 'translate-x-9'
                      : 'translate-x-1'
                  }`}
                />
              </button>
              <span
                className={`font-semibold ${
                  billingCycle === 'yearly'
                    ? 'text-purple-600'
                    : 'text-muted-foreground'
                }`}
              >
                Anual
                <Badge variant="secondary" className="ml-2">
                  -17% 🎉
                </Badge>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const pricePerMonth =
                billingCycle === 'yearly'
                  ? plan.price.yearly / 12
                  : plan.price.monthly;

              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular
                      ? 'border-2 border-purple-500 shadow-2xl scale-105'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>

                    <div className="mt-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold">
                          R$ {pricePerMonth.toFixed(0)}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                      {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          Economize {getYearlySavings(plan.price.monthly)}% no
                          plano anual
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              feature.highlight
                                ? 'font-semibold text-purple-600 dark:text-purple-400'
                                : feature.included
                                ? 'text-foreground'
                                : 'text-muted-foreground line-through'
                            }`}
                          >
                            {feature.text}
                            {feature.addon && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Add-on R$ 29,90
                              </Badge>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      asChild
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      <Link href={plan.ctaLink}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add-ons Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Recursos Adicionais</h2>
              <p className="text-muted-foreground">
                Potencialize sua plataforma com recursos avançados
              </p>
            </div>

            <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto">
              {addons.map((addon) => {
                const Icon = addon.icon;
                return (
                  <Card
                    key={addon.name}
                    className="border-2 border-blue-200 dark:border-blue-800"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle>{addon.name}</CardTitle>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                R$ {addon.price.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                pagamento único
                              </div>
                            </div>
                          </div>
                          <CardDescription>{addon.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        {addon.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/checkout/chat-ia">Adicionar ao Plano</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Comparação Detalhada</h2>
              <p className="text-muted-foreground">
                Veja tudo que está incluído em cada plano
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 font-semibold">Recurso</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold bg-purple-50 dark:bg-purple-950/20">
                      Pro
                    </th>
                    <th className="text-center p-4 font-semibold">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="p-4 font-medium">Cursos Publicados</td>
                    <td className="text-center p-4">Até 3</td>
                    <td className="text-center p-4 bg-purple-50 dark:bg-purple-950/20">
                      Ilimitado
                    </td>
                    <td className="text-center p-4">Ilimitado</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Taxa por Venda</td>
                    <td className="text-center p-4">15%</td>
                    <td className="text-center p-4 bg-purple-50 dark:bg-purple-950/20">
                      8%
                    </td>
                    <td className="text-center p-4">5%</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Chat IA Incluso</td>
                    <td className="text-center p-4">
                      <X className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-purple-50 dark:bg-purple-950/20">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">
                      Landing Page Personalizada
                    </td>
                    <td className="text-center p-4">
                      <X className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-purple-50 dark:bg-purple-950/20">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Suporte</td>
                    <td className="text-center p-4 text-sm">Email (48h)</td>
                    <td className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 text-sm">
                      Email Prioritário (12h)
                    </td>
                    <td className="text-center p-4 text-sm">24/7 + Telefone</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
              <p className="text-muted-foreground">
                Dúvidas sobre planos e preços? Respondemos aqui.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <Rocket className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Pronto para Transformar Conhecimento em Renda?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de professores que já vendem cursos na nossa
              plataforma. Comece grátis e escale sem limites.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Link href="/register">Começar Grátis Agora</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/contato">Falar com Especialista</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
