'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  courseId: string;
  price: number | null;
  isPaid: boolean;
  isEnrolled?: boolean;
  onSuccess?: () => void;
}

export function CheckoutButton({
  courseId,
  price,
  isPaid,
  isEnrolled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPaid || !price || price <= 0) {
    return (
      <Button disabled variant="outline">
        Gratuito
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <Button disabled variant="outline">
        Já matriculado
      </Button>
    );
  }

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[CheckoutButton] Iniciando checkout para curso:', courseId);

      const response = await fetch('/api/checkout/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      console.log('[CheckoutButton] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
      });

      // Primeiro, tentar ler como JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error(
          '[CheckoutButton] Erro ao fazer parse da resposta JSON:',
          parseError
        );
        const text = await response.text();
        console.error('[CheckoutButton] Texto da resposta:', text);
        throw new Error(
          `Resposta inválida do servidor: ${text.substring(0, 100)}`
        );
      }

      if (!response.ok) {
        console.error('[CheckoutButton] Erro na resposta:', data);
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      const { url, sessionId } = data;

      console.log('[CheckoutButton] Sessão criada com sucesso:', {
        sessionId,
        hasUrl: !!url,
      });

      if (url) {
        console.log('[CheckoutButton] Redirecionando para Stripe...');
        window.location.href = url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao processar checkout';
      setError(message);
      console.error('[CheckoutButton] Erro completo:', {
        message,
        error: err,
        stack: err instanceof Error ? err.stack : 'N/A',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleCheckout} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          `Comprar - R$ ${price.toFixed(2)}`
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
