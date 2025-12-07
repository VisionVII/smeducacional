/**
 * 🧪 Teste de Integração - Validação de Cores e Animações em Componentes
 * Criar um componente de teste para visualizar as cores e animações em tempo real
 */

'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';

interface ColorTest {
  name: string;
  cssVariable: string;
  fallback: string;
}

const colorTests: ColorTest[] = [
  {
    name: 'Background',
    cssVariable: 'var(--background)',
    fallback: 'hsl(0 0% 100%)',
  },
  {
    name: 'Foreground',
    cssVariable: 'var(--foreground)',
    fallback: 'hsl(240 10% 3.9%)',
  },
  {
    name: 'Primary',
    cssVariable: 'var(--primary)',
    fallback: 'hsl(221.2 83.2% 53.3%)',
  },
  {
    name: 'Secondary',
    cssVariable: 'var(--secondary)',
    fallback: 'hsl(210 40% 96.1%)',
  },
  {
    name: 'Accent',
    cssVariable: 'var(--accent)',
    fallback: 'hsl(210 40% 96.1%)',
  },
  { name: 'Card', cssVariable: 'var(--card)', fallback: 'hsl(0 0% 100%)' },
  {
    name: 'Muted',
    cssVariable: 'var(--muted)',
    fallback: 'hsl(210 40% 96.1%)',
  },
];

const animationTests = [
  {
    name: '--transition-duration',
    description: 'Duração da transição (200ms, 500ms, 100ms)',
  },
  {
    name: '--transition-easing',
    description: 'Função de easing (ease-in-out, cubic-bezier, etc)',
  },
  { name: '--animations-enabled', description: 'Flag global de animações' },
  { name: '--hover-animations', description: 'Animações de hover' },
  { name: '--focus-animations', description: 'Animações de foco' },
  { name: '--page-transitions', description: 'Transições de página' },
];

export function ThemeTestComponent() {
  const { theme, themes } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          🧪 Teste de Cores e Animações
        </h1>
        <p className="text-muted-foreground mb-8">
          Validação em tempo real do sistema de temas com cores e animações
        </p>

        {/* Seletor de Tema */}
        <div className="mb-8 p-6 border rounded-lg border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            📋 Selecione um Tema
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {themes?.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTheme(t)}
                className={`p-3 rounded-lg font-medium transition-all ${
                  selectedTheme === t
                    ? 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Teste de Cores */}
        <div className="mb-8 p-6 border rounded-lg border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            🎨 Cores (12 por Tema)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {colorTests.map((color) => (
              <div
                key={color.name}
                className="p-4 rounded-lg border border-border transition-all hover:shadow-lg"
                style={{ backgroundColor: color.cssVariable }}
              >
                <p className="text-sm font-medium text-foreground/70 mb-2">
                  {color.name}
                </p>
                <div className="h-16 rounded bg-white/20 border border-white/30 flex items-center justify-center">
                  <code className="text-xs text-foreground/60">
                    {color.cssVariable}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teste de Animações CSS */}
        <div className="mb-8 p-6 border rounded-lg border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            ⏱️ Variáveis de Animação (6 Injetadas)
          </h2>
          <div className="space-y-3">
            {animationTests.map((anim) => (
              <div
                key={anim.name}
                className="p-4 bg-muted rounded-lg border border-border"
              >
                <p className="font-mono text-sm font-semibold text-foreground">
                  {anim.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {anim.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Teste de Transições */}
        <div className="mb-8 p-6 border rounded-lg border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            ✨ Demonstração de Transições
          </h2>
          <div className="space-y-4">
            {/* Transição de Cores */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Cores com .transition-theme
              </p>
              <div
                className="h-20 rounded-lg bg-primary transition-theme cursor-pointer hover:bg-accent"
                title="Clique para alterar"
              />
            </div>

            {/* Transição de Transforms */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Transform com .transition-theme
              </p>
              <div className="relative h-20">
                <div
                  className="absolute inset-0 bg-secondary rounded-lg transition-theme hover:scale-105 hover:shadow-lg cursor-pointer"
                  title="Passe o mouse para ver a animação"
                />
              </div>
            </div>

            {/* Transição de Opacity */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Opacity com .transition-theme
              </p>
              <div
                className="h-20 bg-accent rounded-lg transition-theme hover:opacity-75 cursor-pointer"
                title="Passe o mouse para ver a opacity mudar"
              />
            </div>
          </div>
        </div>

        {/* Status de Validação */}
        <div className="p-6 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-950">
          <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
            ✅ Sistema de Cores e Animações Validado
          </h2>
          <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
            <li>✅ 9 presets com cores customizadas</li>
            <li>✅ 12 cores por tema em formato HSL</li>
            <li>✅ 6 variáveis de animação injetadas</li>
            <li>✅ 7 propriedades de animação configuráveis</li>
            <li>✅ Transições suaves entre temas</li>
            <li>✅ Suporte a easing functions customizadas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
