'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShoppingCart, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  price: number | null;
  compareAtPrice: number | null;
  instructor: {
    name: string;
    avatar: string | null;
  };
  _count: {
    enrollments: number;
  };
}

interface MultiCourseCheckoutProps {
  courses: Course[];
}

export function MultiCourseCheckout({ courses }: MultiCourseCheckoutProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular totais
  const subtotal = courses.reduce(
    (acc, course) => acc + (course.price || 0),
    0
  );

  const savings = courses.reduce((acc, course) => {
    if (course.compareAtPrice && course.price) {
      return acc + (course.compareAtPrice - course.price);
    }
    return acc;
  }, 0);

  const total = subtotal;

  // Formatador de moeda simples
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[Multi-Course-Checkout] Iniciando checkout para cursos:', {
        courseIds: courses.map((c) => c.id),
        count: courses.length,
      });

      const response = await fetch('/api/checkout/multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseIds: courses.map((c) => c.id),
        }),
      });

      console.log('[Multi-Course-Checkout] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
      });

      // Primeiro, tentar ler como JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error(
          '[Multi-Course-Checkout] Erro ao fazer parse da resposta JSON:',
          parseError
        );
        const text = await response.text();
        console.error(
          '[Multi-Course-Checkout] Texto da resposta:',
          text.substring(0, 200)
        );
        throw new Error(
          `Resposta inválida do servidor: ${text.substring(0, 100)}`
        );
      }

      if (!response.ok) {
        console.error('[Multi-Course-Checkout] Erro na resposta:', {
          status: response.status,
          error: data.error,
          details: data.details,
        });
        throw new Error(data.error || 'Erro ao processar checkout');
      }

      const { url } = data;

      console.log('[Multi-Course-Checkout] Sessão criada com sucesso:', {
        hasUrl: !!url,
      });

      if (url) {
        console.log('[Multi-Course-Checkout] Redirecionando para Stripe...');
        window.location.href = url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao processar checkout';

      console.error('[Multi-Course-Checkout] Erro completo:', {
        message,
        error,
        stack: error instanceof Error ? error.stack : 'N/A',
      });

      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Finalizar Compra
        </h1>
        <p className="text-muted-foreground">
          Você está comprando {courses.length}{' '}
          {courses.length === 1 ? 'curso' : 'cursos'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista de Cursos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cursos Selecionados</CardTitle>
              <CardDescription>
                Revise os cursos antes de finalizar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex gap-4 p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Por {course.instructor.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {course.compareAtPrice &&
                        course.compareAtPrice > (course.price || 0) && (
                          <span className="text-sm line-through text-muted-foreground">
                            {formatCurrency(course.compareAtPrice)}
                          </span>
                        )}
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(course.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Aviso de Segurança */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Pagamento Seguro</p>
                  <p>
                    Seus dados são protegidos com criptografia SSL. Processamos
                    pagamentos através do Stripe.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Valores */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(savings)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Checkout */}
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pagar {formatCurrency(total)}
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Garantia */}
              <div className="text-center text-xs text-muted-foreground">
                <p>💳 Garantia de 30 dias</p>
                <p className="mt-1">Acesso vitalício aos cursos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
