'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Palette, Layers, Sparkles, Settings } from 'lucide-react';

/**
 * ThemeDashboard: Painel inteligente de ajustes de UI
 * - Ajuste de raio, sombra, borda e espaçamento via CSS vars
 * - Preview em tempo real (sessão atual)
 * - Sem persistência em backend (não há API para isso); armazena em localStorage
 */
type ShadowLevel = 'none' | 'light' | 'medium' | 'strong' | 'xl';
type SpacingOpt = 'compact' | 'comfortable' | 'spacious';

export function ThemeDashboard() {
  const [radius, setRadius] = useState(8); // px
  const [shadowLevel, setShadowLevel] = useState<ShadowLevel>('none');
  const [bordered, setBordered] = useState(false);
  const [glass, setGlass] = useState(false);
  const [spacing, setSpacing] = useState<SpacingOpt>('comfortable');
  const [fastTransitions, setFastTransitions] = useState(false);

  // Aplica CSS vars ao :root
  const applyVars = () => {
    const root = document.documentElement;
    root.style.setProperty('--radius', `${radius / 16}rem`);
    root.style.setProperty('--radius-sm', `${Math.max(4, radius - 4) / 16}rem`);
    root.style.setProperty('--radius-md', `${radius / 16}rem`);
    root.style.setProperty(
      '--radius-lg',
      `${Math.min(24, radius + 8) / 16}rem`
    );
    root.style.setProperty(
      '--radius-xl',
      `${Math.min(32, radius + 16) / 16}rem`
    );

    const shadowMap: Record<string, string> = {
      none: 'var(--shadow-none)',
      light: 'var(--shadow-light)',
      medium: 'var(--shadow-medium)',
      strong: 'var(--shadow-strong)',
      xl: 'var(--shadow-xl)',
    };
    root.style.setProperty('--card-shadow', shadowMap[shadowLevel]);
    root.style.setProperty('--card-border-width', bordered ? '2px' : '1px');
    root.style.setProperty('--spacing-active', `var(--spacing-${spacing})`);
    root.style.setProperty(
      '--transition-duration',
      fastTransitions ? '150ms' : '200ms'
    );

    // Persistência leve
    const snapshot = {
      radius,
      shadowLevel,
      bordered,
      glass,
      spacing,
      fastTransitions,
    };
    localStorage.setItem('theme-dashboard', JSON.stringify(snapshot));
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('theme-dashboard');
      if (raw) {
        const data = JSON.parse(raw);
        setRadius(data.radius ?? 8);
        setShadowLevel(data.shadowLevel ?? 'none');
        setBordered(Boolean(data.bordered));
        setGlass(Boolean(data.glass));
        setSpacing(data.spacing ?? 'comfortable');
        setFastTransitions(Boolean(data.fastTransitions));
      }
    } catch {}
  }, []);

  useEffect(() => {
    applyVars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, shadowLevel, bordered, glass, spacing, fastTransitions]);

  const previewCardClass = useMemo(() => {
    if (glass) return 'card-glass';
    if (bordered) return 'card-bordered';
    if (shadowLevel !== 'none') return 'card-elevated';
    return 'card-flat';
  }, [glass, bordered, shadowLevel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-theme-quad p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Laboratório de Tema</h2>
            <p className="text-white/80">
              Ajuste cartões, espaçamento e animações em tempo real
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Cartões
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Layout
          </TabsTrigger>
          <TabsTrigger value="motion" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Motion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <Card className="card-flat">
            <CardHeader>
              <CardTitle>Estilo de Cartão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div className="space-y-2">
                  <Label>Raio da Borda (px)</Label>
                  <Input
                    type="range"
                    min={4}
                    max={24}
                    step={2}
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sombra</Label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'none',
                        'light',
                        'medium',
                        'strong',
                        'xl',
                      ] as ShadowLevel[]
                    ).map((lvl) => (
                      <Button
                        key={lvl}
                        variant={shadowLevel === lvl ? 'default' : 'outline'}
                        onClick={() => setShadowLevel(lvl)}
                      >
                        {lvl}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={bordered} onCheckedChange={setBordered} />
                  <Label>Borda destacada</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={glass} onCheckedChange={setGlass} />
                  <Label>Efeito vidro (blur)</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`${previewCardClass} p-[var(--spacing-active)] transition-theme`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Card de Preview {i}</div>
                    <div className="text-sm text-muted-foreground">
                      Ajustes aplicados via CSS vars
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card className="card-flat">
            <CardHeader>
              <CardTitle>Layout & Espaçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['compact', 'comfortable', 'spacious'] as SpacingOpt[]).map(
                  (opt) => (
                    <Button
                      key={opt}
                      variant={spacing === opt ? 'default' : 'outline'}
                      onClick={() => setSpacing(opt)}
                    >
                      {opt}
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motion" className="space-y-4">
          <Card className="card-flat">
            <CardHeader>
              <CardTitle>Animações & Transições</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={fastTransitions}
                  onCheckedChange={setFastTransitions}
                />
                <Label>Transições rápidas</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button
          onClick={applyVars}
          className="bg-primary text-primary-foreground"
        >
          Aplicar na sessão
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem('theme-dashboard');
            setRadius(8);
            setShadowLevel('none');
            setBordered(false);
            setGlass(false);
            setSpacing('comfortable');
            setFastTransitions(false);
            applyVars();
          }}
        >
          Resetar
        </Button>
      </div>
    </div>
  );
}
