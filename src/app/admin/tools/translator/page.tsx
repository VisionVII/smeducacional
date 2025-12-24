'use client';

import { Translator } from '@/components/Translator';

export default function TranslatorToolPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tradutor (IA)</h1>
      <p className="text-muted-foreground mb-6">
        Utilize o tradutor para auxiliar na criação de conteúdos multilíngues.
      </p>
      <Translator />
    </div>
  );
}
