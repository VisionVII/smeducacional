'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Info } from 'lucide-react';
import Link from 'next/link';

export default function ThemeCustomizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Card */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[200px]"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-primary/80 to-primary rounded-2xl shadow-xl">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Personalização de Tema
                </h1>
                <p className="text-muted-foreground mt-1">
                  Sistema de Temas V2.0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Sistema de Temas Migrado</CardTitle>
            </div>
            <CardDescription>
              A personalização de temas foi movida para as configurações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Com o novo Sistema Hierárquico de Temas V2.0, os temas agora seguem esta estrutura:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li><strong>Admin:</strong> Controla o tema global (rotas públicas + área administrativa)</li>
              <li><strong>Professor:</strong> Suas rotas privadas herdam automaticamente o tema admin</li>
              <li><strong>Aluno:</strong> Suas rotas privadas herdam automaticamente o tema admin</li>
            </ul>
            <div className="pt-4">
              <Button asChild className="bg-gradient-to-r from-primary to-purple-600">
                <Link href="/teacher/dashboard">
                  Voltar ao Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Personalização de Tema
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Escolha um tema e controle o modo claro/escuro independentemente
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <a href="/teacher/landing" target="_blank" rel="noreferrer">
              Ver landing com tema atual
            </a>
          </Button>
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <a href="/teacher/landing" target="_blank" rel="noreferrer">
              Pré-visualizar link de campanha
            </a>
          </Button>
        </div>
      </div>

      {/* Modo Dark/Light */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            {systemTheme === 'dark' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            Modo de Exibição
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Escolha entre modo claro, escuro ou automático (sistema)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <Label htmlFor="theme-mode" className="flex flex-col gap-1">
              <span className="text-sm sm:text-base">Modo de Tema</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-normal">
                Esta configuração é independente do tema de cores
              </span>
            </Label>
            <Select value={systemTheme} onValueChange={handleSystemThemeChange}>
              <SelectTrigger className="w-full sm:w-[180px] min-h-[44px]">
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
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Temas Prontos
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Selecione um dos temas pré-configurados. As mudanças são aplicadas
            instantaneamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {THEME_PRESETS.map((preset) => (
              <Card
                key={preset.id}
                className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden ${
                  selectedPreset === preset.id ? 'ring-2 ring-primary' : ''
                } ${savingTheme === preset.id ? 'pointer-events-none' : ''}`}
                onClick={() => !isSaving && handleApplyPreset(preset)}
              >
                {/* Loading overlay elegante com cores do tema */}
                {savingTheme === preset.id && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                    <div className="relative">
                      {/* Anel externo girando */}
                      <div
                        className="w-16 h-16 rounded-full animate-spin"
                        style={{
                          background: `conic-gradient(from 0deg, 
                            hsl(${preset.palette.primary}), 
                            hsl(${preset.palette.secondary}), 
                            hsl(${preset.palette.accent}), 
                            hsl(${preset.palette.primary}))`,
                          opacity: 0.8,
                        }}
                      />
                      {/* Centro branco */}
                      <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                        <Sparkles
                          className="w-6 h-6 animate-pulse"
                          style={{ color: `hsl(${preset.palette.primary})` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <CardHeader className="px-3 sm:px-6 py-3 sm:py-5">
                  <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                    {preset.name}
                    {selectedPreset === preset.id && (
                      <span className="text-[10px] sm:text-xs bg-primary text-primary-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        Ativo
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {preset.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
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
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalização Avançada
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ajuste estrutura dos cards, espaçamentos e sombras do layout. O modo
            escuro usa base escura, mantendo as cores principais do tema.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Estilo de Card</Label>
            <Select
              value={layoutConfig.cardStyle}
              onValueChange={(value) =>
                setLayoutConfig((prev) => ({ ...prev, cardStyle: value }))
              }
            >
              <SelectTrigger className="min-h-[44px]">
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
            <Label className="text-sm sm:text-base">Raio dos cantos</Label>
            <Select
              value={layoutConfig.borderRadius}
              onValueChange={(value) =>
                setLayoutConfig((prev) => ({ ...prev, borderRadius: value }))
              }
            >
              <SelectTrigger className="min-h-[44px]">
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
            <Label className="text-sm sm:text-base">Sombras</Label>
            <Select
              value={layoutConfig.shadowIntensity}
              onValueChange={(value) =>
                setLayoutConfig((prev) => ({ ...prev, shadowIntensity: value }))
              }
            >
              <SelectTrigger className="min-h-[44px]">
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
            <Label className="text-sm sm:text-base">Espaçamento</Label>
            <Select
              value={layoutConfig.spacing}
              onValueChange={(value) =>
                setLayoutConfig((prev) => ({ ...prev, spacing: value }))
              }
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="comfortable">Confortável</SelectItem>
                <SelectItem value="spacious">Espaçoso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setLayoutConfig(theme?.layout || layoutConfig)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Restaurar layout atual
            </Button>
            <Button
              onClick={handleSaveLayout}
              disabled={isSaving}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Salvar layout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
          <CardTitle className="text-base sm:text-lg">Ações</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isSaving}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Pré-visualização
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Veja como seu tema aparece nos componentes
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
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
