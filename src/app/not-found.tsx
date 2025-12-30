'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">
          Página não encontrada
        </p>
        {mounted ? (
          <Link href="/" className="text-primary hover:underline">
            Voltar para a página inicial
          </Link>
        ) : (
          <div className="h-6" />
        )}
      </div>
    </div>
  );
}
