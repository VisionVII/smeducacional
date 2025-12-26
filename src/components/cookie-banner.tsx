'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'sm-cookie-consent';

type ConsentValue = 'accepted' | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
      if (saved === 'accepted') {
        setConsent('accepted');
      }
    } catch (error) {
      console.error('[cookie-consent] load error', error);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      setConsent('accepted');
    } catch (error) {
      console.error('[cookie-consent] save error', error);
      setConsent('accepted');
    }
  };

  if (consent === 'accepted') return null;

  return (
    <div className="fixed inset-x-3 md:inset-x-6 bottom-4 z-50">
      <div className="rounded-lg border bg-background/95 shadow-lg backdrop-blur">
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="text-foreground font-medium">Nós usamos cookies</p>
            <p>
              Utilizamos cookies essenciais para segurança e funcionamento do
              sistema e cookies adicionais para medir uso. Você pode saber mais
              em
              <Link
                href="/cookies"
                className="text-primary hover:underline ml-1"
                suppressHydrationWarning
              >
                Política de Cookies
              </Link>{' '}
              e
              <Link
                href="/lgpd"
                className="text-primary hover:underline ml-1"
                suppressHydrationWarning
              >
                LGPD
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 shrink-0">
            <Button variant="outline" asChild>
              <Link href="/cookies" suppressHydrationWarning>
                Configurar
              </Link>
            </Button>
            <Button onClick={accept}>Aceitar cookies</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
