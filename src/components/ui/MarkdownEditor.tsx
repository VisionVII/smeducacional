'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

type MarkdownComponent = ComponentType<{
  source: string;
  style?: React.CSSProperties;
}>;

// Uso dinâmico para evitar SSR e contornar tipagens do pacote
const Markdown = dynamic<{ source: string; style?: React.CSSProperties }>(
  () =>
    import('@uiw/react-markdown-preview').then((mod: any) => {
      return mod.default || mod.Markdown || (() => null);
    }),
  { ssr: false }
);

interface MarkdownEditorProps {
  source: string;
}

export function MarkdownEditor({ source }: MarkdownEditorProps) {
  return <Markdown source={source} />;
}
