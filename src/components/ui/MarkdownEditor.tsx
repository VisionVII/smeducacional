'use client';

import dynamic from 'next/dynamic';

// Uso dinâmico para evitar SSR e contornar tipagens do pacote
const Markdown = dynamic<any>(
  () =>
    import('@uiw/react-md-editor').then((mod: any) => {
      return mod.default?.Markdown || mod.Markdown || (() => null);
    }),
  { ssr: false }
);

interface MarkdownEditorProps {
  source: string;
}

export function MarkdownEditor({ source }: MarkdownEditorProps) {
  return <Markdown source={source} />;
}
