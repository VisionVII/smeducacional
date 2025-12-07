'use client';

import { useState, useEffect } from 'react';
import { useTeacherTheme } from '@/components/teacher-theme-provider';
import { THEME_PRESETS, ThemePreset } from '@/lib/theme-presets';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Sparkles, RotateCcw, Moon, Sun, Laptop } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ThemeCustomizerPage() {
  const {
    theme,
    updateTheme,
    resetTheme,
    isLoading,
    systemTheme,
    setSystemTheme,
  } = useTeacherTheme();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState({
    cardStyle: 'default',
    borderRadius: '0.5rem',
    shadowIntensity: 'medium',
    spacing: 'comfortable',
  });

  useEffect(() => {
    if (theme) {
      // Verificar se tema atual corresponde a algum preset
      const matchingPreset = THEME_PRESETS.find(
        (preset) =>
          JSON.stringify(preset.palette) === JSON.stringify(theme.palette)
      );
      if (matchingPreset) {
        setSelectedPreset(matchingPreset.id);
      }

      setLayoutConfig({
        cardStyle: theme.layout.cardStyle,
        borderRadius: theme.layout.borderRadius,
        shadowIntensity: theme.layout.shadowIntensity,
        spacing: theme.layout.spacing,
      });
    }
  }, [theme]);

  const handleApplyPreset = async (preset: ThemePreset) => {
    setIsSaving(true);
    try {
      await updateTheme({
        palette: preset.palette,
        layout: preset.layout,
        themeName: preset.name,
      });
      setSelectedPreset(preset.id);
      alert(`Tema "${preset.name}" aplicado com sucesso!`);
    } catch (error) {
      alert('Erro ao aplicar tema. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Deseja realmente resetar para o tema padrão do sistema?')) {
      setIsSaving(true);
      try {
        await resetTheme();
        setSelectedPreset('default');
        alert('Tema resetado para o padrão!');
      } catch (error) {
        alert('Erro ao resetar tema. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSystemThemeChange = (value: string) => {
    setSystemTheme(value);
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    try {
      await updateTheme({
        layout: {
          cardStyle:
            layoutConfig.cardStyle as ThemePreset['layout']['cardStyle'],
          borderRadius: layoutConfig.borderRadius,
          shadowIntensity:
            layoutConfig.shadowIntensity as ThemePreset['layout']['shadowIntensity'],
          spacing: layoutConfig.spacing as ThemePreset['layout']['spacing'],
        },
      });
      alert('Layout atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao salvar layout. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Personalização de Tema</h1>
        <p className="text-muted-foreground">
          Escolha um tema e controle o modo claro/escuro independentemente
        </p>
        <div className="mt-3 flex gap-3 flex-wrap">
          <Button variant="outline" asChild>
            <a href="/teacher/landing" target="_blank" rel="noreferrer">
              Ver landing com tema atual
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="/teacher/landing" target="_blank" rel="noreferrer">
              Pré-visualizar link de campanha
            </a>
          </Button>
        </div>
      </div>

      {/* Modo Dark/Light */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {systemTheme === 'dark' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            Modo de Exibição
          </CardTitle>
          <CardDescription>
            Escolha entre modo claro, escuro ou automático (sistema)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-mode" className="flex flex-col gap-1">
              <span>Modo de Tema</span>
              <span className="text-sm text-muted-foreground font-normal">
                Esta configuração é independente do tema de cores
              </span>
            </Label>
            <Select value={systemTheme} onValueChange={handleSystemThemeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Claro
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Escuro
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" />
                    Sistema
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Temas Prontos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Temas Prontos
          </CardTitle>
          <CardDescription>
            Selecione um dos temas pré-configurados. As mudanças são aplicadas
            instantaneamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEME_PRESETS.map((preset) => (
              <Card
                key={preset.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPreset === preset.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => !isSaving && handleApplyPreset(preset)}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {preset.name}
                    {selectedPreset === preset.id && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Ativo
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ background: `hsl(${preset.palette.primary})` }}
                      title="Primary"
                    />
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ background: `hsl(${preset.palette.secondary})` }}
                      title="Secondary"
                    />
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ background: `hsl(${preset.palette.accent})` }}
                      title="Accent"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações avançadas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalização Avançada
          </CardTitle>
          <CardDescription>
            Ajuste estrutura dos cards, espaçamentos e sombras do layout. O modo
            escuro usa base escura, mantendo as cores principais do tema.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estilo de Card</Label>
            <Select
              value={layoutConfig.cardStyle}
              onValueChange={(value) =>
                setLayoutConfig((prev) => ({ ...prev, cardStyle: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="bordered">Bordas marcadas</SelectItem>
                <SelectItem value="elevated">Elevado</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Raio dos cantos</Label>
            <Select
              value={layoutConfig.borderRadius}
              onValueChange={(value) =>
                setLayoutConfig((prev) => ({ ...prev, borderRadius: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25rem">XS</SelectItem>
                <SelectItem value="0.5rem">Padrão</SelectItem>
                <SelectItem value="0.75rem">MD</SelectItem>
                <SelectItem value="1rem">LG</SelectItem>
                <SelectItem value="1.25rem">XL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sombras</Label>
            <Select
              value={layoutConfig.shadowIntensity}
              onValueChange={(value) =>
                setLayoutConfig((prev) => ({ ...prev, shadowIntensity: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem sombra</SelectItem>
                <SelectItem value="light">Leve</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="strong">Forte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Espaçamento</Label>
            <Select
              value={layoutConfig.spacing}
              onValueChange={(value) =>
                setLayoutConfig((prev) => ({ ...prev, spacing: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="comfortable">Confortável</SelectItem>
                <SelectItem value="spacious">Espaçoso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setLayoutConfig(theme?.layout || layoutConfig)}
            >
              Restaurar layout atual
            </Button>
            <Button onClick={handleSaveLayout} disabled={isSaving}>
              Salvar layout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={handleReset} variant="outline" disabled={isSaving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Pré-visualização
          </CardTitle>
          <CardDescription>
            Veja como seu tema aparece nos componentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Card de Exemplo</CardTitle>
                <CardDescription>
                  Este é um card com o tema aplicado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Este texto usa a cor muted-foreground para informações
                  secundárias.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button>Botão Primary</Button>
                  <Button variant="secondary">Botão Secondary</Button>
                  <Button variant="outline">Botão Outline</Button>
                  <Button variant="destructive">Botão Destrutivo</Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    Área com fundo muted para destacar conteúdo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
