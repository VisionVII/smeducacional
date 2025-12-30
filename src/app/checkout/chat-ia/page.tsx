'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  MessageSquare,
  Sparkles,
  BookOpen,
  Lock,
  Loader2,
} from 'lucide-react';

/**
 * Página de Checkout para Chat IA (Feature Add-on)
 * Permite que usuários em plano Free comprem acesso à ferramenta Chat IA
 */
export default function ChatIACheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feature pricing e metadata
  const feature = {
    id: 'ai-assistant',
    name: 'Chat IA - Professor Virtual',
    price: 29.9,
    description:
      'Assistente de IA que funciona como um professor 100% dedicado aos seus cursos matriculados',
    benefits: [
      'Respostas instantâneas sobre conteúdo dos cursos',
      'Explicações personalizadas e exemplos práticos',
      'Ajuda com exercícios e dúvidas de aulas',
      'Disponível 24/7 sem limites de mensagens',
      'Foco exclusivo nos seus cursos matriculados',
    ],
    icon: MessageSquare,
  };

  const handleCheckout = async () => {
    if (!session?.user) {
      router.push('/login?callbackUrl=/checkout/chat-ia');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/checkout/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId: feature.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao processar checkout';
      setError(message);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Recurso Premium
          </Badge>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Chat IA - Professor Virtual
          </h1>
          <p className="text-muted-foreground text-lg">
            Seu assistente pessoal para tirar dúvidas e aprofundar conhecimentos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Benefícios */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <feature.icon className="h-6 w-6 text-purple-600" />
                O que você ganha?
              </CardTitle>
              <CardDescription>
                Um professor 100% dedicado aos seus cursos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefícios */}
              <div className="space-y-3">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Como funciona */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Como funciona?
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>✅ Inteligente:</strong> A IA analisa os cursos em
                    que você está matriculado e só responde sobre esses
                    conteúdos.
                  </p>
                  <p>
                    <strong>🔒 Focado:</strong> Se você perguntar sobre um
                    curso que não está matriculado, a IA sugere que você se
                    inscreva primeiro.
                  </p>
                  <p>
                    <strong>💬 Ilimitado:</strong> Sem limite de perguntas ou
                    conversas. Use quando e quanto precisar.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Segurança */}
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Acesso Exclusivo aos Seus Cursos
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      A IA só tem acesso ao conteúdo dos cursos em que você está
                      matriculado. Seus dados e progresso são protegidos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coluna Direita - Checkout */}
          <div className="space-y-6">
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-2xl">Plano Básico</CardTitle>
                <CardDescription>Pagamento único</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preço */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      R$ {feature.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Acesso vitalício ao Chat IA
                  </p>
                </div>

                <Separator />

                {/* Resumo */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Feature:</span>
                    <span className="font-semibold">{feature.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <Badge variant="secondary">Pagamento Único</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="text-lg font-bold text-purple-600">
                      R$ {feature.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botão de Checkout */}
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Comprar Agora
                    </>
                  )}
                </Button>

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                {/* Garantia */}
                <div className="text-xs text-center text-muted-foreground pt-2">
                  <p>✅ Pagamento seguro via Stripe</p>
                  <p>🔒 Seus dados estão protegidos</p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Rápido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <p className="font-semibold mb-1">
                    Posso usar em qualquer curso?
                  </p>
                  <p className="text-muted-foreground">
                    Sim! A IA funciona para todos os cursos que você está
                    matriculado, presentes e futuros.
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-semibold mb-1">Tem limite de perguntas?</p>
                  <p className="text-muted-foreground">
                    Não! Você pode fazer quantas perguntas quiser, 24/7.
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-semibold mb-1">É pagamento recorrente?</p>
                  <p className="text-muted-foreground">
                    Não! É um pagamento único. Você paga uma vez e tem acesso
                    para sempre.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Ao clicar em &quot;Comprar Agora&quot;, você será redirecionado para o
            checkout seguro do Stripe.
          </p>
          <p className="mt-1">
            Tem dúvidas?{' '}
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href="/suporte">Entre em contato</a>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
