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
  onSuccess,
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

      const response = await fetch('/api/checkout/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
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
