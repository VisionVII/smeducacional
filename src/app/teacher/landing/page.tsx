'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  LayoutDashboard,
  Plus,
  Trash2,
  Eye,
  Save,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FAQItem {
  question: string;
  answer: string;
}

// Schema Zod para validação de segurança
const landingConfigSchema = z.object({
  heroTitle: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título muito longo'),
  heroSubtitle: z
    .string()
    .min(10, 'Subtítulo deve ter no mínimo 10 caracteres')
    .max(500, 'Subtítulo muito longo'),
  heroImage: z.string().url('URL inválida').or(z.literal('')),
  ctaLabel: z
    .string()
    .min(2, 'Texto do botão muito curto')
    .max(50, 'Texto do botão muito longo'),
  ctaLink: z.string().url('Link inválido'),
  ctaColor: z.enum(['primary', 'secondary', 'accent']),
  highlightOne: z.string().max(200),
  highlightOneIcon: z.string().max(2),
  highlightTwo: z.string().max(200),
  highlightTwoIcon: z.string().max(2),
  highlightThree: z.string().max(200),
  highlightThreeIcon: z.string().max(2),
  testimonial: z.string().max(1000),
  testimonialAuthor: z.string().max(100),
  modules: z.array(z.string().max(200)),
  faqItems: z.array(
    z.object({
      question: z.string().max(300),
      answer: z.string().max(1000),
    })
  ),
  sectionOrder: z.array(z.string()),
  backgroundColor: z.string(),
  textColor: z.string(),
  showSocialProof: z.boolean(),
  showModules: z.boolean(),
  showTestimonial: z.boolean(),
  showFaq: z.boolean(),
});

interface LandingConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  ctaLabel: string;
  ctaLink: string;
  ctaColor: 'primary' | 'secondary' | 'accent';
  highlightOne: string;
  highlightOneIcon: string;
  highlightTwo: string;
  highlightTwoIcon: string;
  highlightThree: string;
  highlightThreeIcon: string;
  testimonial: string;
  testimonialAuthor: string;
  modules: string[];
  faqItems: FAQItem[];
  sectionOrder: string[];
  backgroundColor: string;
  textColor: string;
  showSocialProof: boolean;
  showModules: boolean;
  showTestimonial: boolean;
  showFaq: boolean;
}

export default function TeacherLandingBuilder() {
  const { toast } = useToast();
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadLanding = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/teacher/landing', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else if (response.status === 401) {
        toast({
          title: 'Acesso negado',
          description: 'Você precisa estar autenticado como professor.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao carregar',
          description: 'Não foi possível carregar a landing page.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: 'Tempo esgotado',
          description: 'A requisição demorou muito. Tente novamente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro inesperado',
          description: 'Ocorreu um erro ao carregar os dados.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLanding();
  }, [loadLanding]);

  const saveLanding = async () => {
    if (!config) return;

    // Validação Zod client-side (segurança)
    const validation = landingConfigSchema.safeParse(config);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: 'Dados inválidos',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/teacher/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Landing page salva com sucesso!',
        });
      } else if (response.status === 401) {
        toast({
          title: 'Acesso negado',
          description: 'Você precisa estar autenticado.',
          variant: 'destructive',
        });
      } else if (response.status === 403) {
        toast({
          title: 'Sem permissão',
          description: 'Você não tem permissão para esta ação.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: 'Tempo esgotado',
          description: 'A operação demorou muito. Tente novamente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro inesperado',
          description: 'Ocorreu um erro ao salvar.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetLanding = async () => {
    if (
      !confirm(
        'Deseja realmente resetar a landing page? Esta ação não pode ser desfeita.'
      )
    )
      return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/teacher/landing', {
        method: 'DELETE',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        toast({
          title: 'Resetado com sucesso',
          description: 'Landing page foi restaurada ao padrão.',
        });
        await loadLanding();
      } else {
        toast({
          title: 'Erro ao resetar',
          description: 'Não foi possível resetar a landing page.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: 'Tempo esgotado',
          description: 'A operação demorou muito.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro inesperado',
          description: 'Ocorreu um erro ao resetar.',
          variant: 'destructive',
        });
      }
    }
  };

  const copyPreviewLink = () => {
    const link = `${window.location.origin}/landing-preview`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Link copiado',
      description: 'Link da landing page copiado para a área de transferência.',
    });
  };

  const updateField = (
    key: keyof LandingConfig,
    value: LandingConfig[keyof LandingConfig]
  ) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const updateModule = (index: number, value: string) => {
    setConfig((prev) => {
      if (!prev) return null;
      const modules = [...prev.modules];
      modules[index] = value;
      return { ...prev, modules };
    });
  };

  const addModule = () => {
    setConfig((prev) =>
      prev ? { ...prev, modules: [...prev.modules, 'Novo módulo'] } : null
    );
  };

  const removeModule = (index: number) => {
    setConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        modules: prev.modules.filter((_, i) => i !== index),
      };
    });
  };

  const updateFAQ = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    setConfig((prev) => {
      if (!prev) return null;
      const faqItems = [...prev.faqItems];
      faqItems[index] = { ...faqItems[index], [field]: value };
      return { ...prev, faqItems };
    });
  };

  const addFAQ = () => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            faqItems: [...prev.faqItems, { question: '', answer: '' }],
          }
        : null
    );
  };

  const removeFAQ = (index: number) => {
    setConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        faqItems: prev.faqItems.filter((_, i) => i !== index),
      };
    });
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getCtaButtonClass = () => {
    const colors = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
    };
    return colors[config.ctaColor];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                Landing Page do Professor
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                Crie uma página persuasiva com seu tema e dados personalizados.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={copyPreviewLink}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Link de campanha
                </>
              )}
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto min-h-[44px]"
            >
              <a href="/landing-preview" target="_blank" rel="noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Painel de Edição */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Seção Hero */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <CardTitle className="text-base sm:text-lg">
                  Seção Hero
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Título e subtítulo principais que capturam atenção
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">
                    Título Principal
                  </label>
                  <Input
                    className="min-h-[44px]"
                    placeholder="Ex: Transforme conhecimento em impacto real"
                    value={config.heroTitle}
                    onChange={(e) => updateField('heroTitle', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">
                    Subtítulo
                  </label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[88px]"
                    placeholder="Descreva brevemente o valor do seu curso"
                    value={config.heroSubtitle}
                    rows={3}
                    onChange={(e) =>
                      updateField('heroSubtitle', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">
                    URL da Imagem (opcional)
                  </label>
                  <Input
                    className="min-h-[44px]"
                    placeholder="https://..."
                    value={config.heroImage}
                    onChange={(e) => updateField('heroImage', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção CTA */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <CardTitle className="text-base sm:text-lg">
                  Call-to-Action (CTA)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Botão principal que convida para ação
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Texto do Botão
                    </label>
                    <Input
                      className="min-h-[44px]"
                      value={config.ctaLabel}
                      onChange={(e) => updateField('ctaLabel', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Link
                    </label>
                    <Input
                      className="min-h-[44px]"
                      placeholder="https://..."
                      value={config.ctaLink}
                      onChange={(e) => updateField('ctaLink', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">
                    Cor do Botão
                  </label>
                  <Select
                    value={config.ctaColor}
                    onValueChange={(
                      value: 'primary' | 'secondary' | 'accent'
                    ) => updateField('ctaColor', value)}
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primária</SelectItem>
                      <SelectItem value="secondary">Secundária</SelectItem>
                      <SelectItem value="accent">Destaque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Seção Diferenciais */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <CardTitle className="text-base sm:text-lg">
                  Diferenciais
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Principais vantagens e benefícios
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
                {[
                  { key: 'highlightOne', iconKey: 'highlightOneIcon', num: 1 },
                  { key: 'highlightTwo', iconKey: 'highlightTwoIcon', num: 2 },
                  {
                    key: 'highlightThree',
                    iconKey: 'highlightThreeIcon',
                    num: 3,
                  },
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Diferencial {item.num}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ícone"
                        value={
                          config[item.iconKey as keyof LandingConfig] as string
                        }
                        onChange={(e) =>
                          updateField(
                            item.iconKey as keyof LandingConfig,
                            e.target.value
                          )
                        }
                        maxLength={2}
                        className="w-16"
                      />
                      <Input
                        placeholder={`Digite o diferencial ${item.num}`}
                        value={
                          config[item.key as keyof LandingConfig] as string
                        }
                        onChange={(e) =>
                          updateField(
                            item.key as keyof LandingConfig,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Seção Módulos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Módulos</CardTitle>
                    <CardDescription>
                      Estruture o conteúdo do curso
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={addModule} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.modules?.map((module, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={module}
                      onChange={(e) => updateModule(idx, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModule(idx)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Seção Depoimento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Depoimento</CardTitle>
                <CardDescription>
                  Prova social de alunos satisfeitos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Depoimento</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={config.testimonial}
                    rows={3}
                    onChange={(e) => updateField('testimonial', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Autor</label>
                  <Input
                    placeholder="Nome do aluno"
                    value={config.testimonialAuthor}
                    onChange={(e) =>
                      updateField('testimonialAuthor', e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção FAQ */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Perguntas Frequentes
                    </CardTitle>
                    <CardDescription>
                      Tire dúvidas dos interessados
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={addFAQ} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.faqItems?.map((item, idx) => (
                  <div key={idx} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Pergunta"
                        value={item.question}
                        onChange={(e) =>
                          updateFAQ(idx, 'question', e.target.value)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFAQ(idx)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Resposta"
                      value={item.answer}
                      rows={2}
                      onChange={(e) => updateFAQ(idx, 'answer', e.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button
                onClick={saveLanding}
                disabled={isSaving}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Landing'}
              </Button>
              <Button
                variant="outline"
                onClick={resetLanding}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>
          </div>

          {/* Pré-visualização */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pré-visualização
                </CardTitle>
                <CardDescription className="text-xs">
                  Modo de visualização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {/* Hero Preview */}
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                  <Badge variant="outline" className="text-xs">
                    HERO
                  </Badge>
                  <h3 className="font-bold line-clamp-2 text-foreground">
                    {config.heroTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {config.heroSubtitle}
                  </p>
                  <button
                    className={`w-full py-1 rounded text-xs font-semibold ${getCtaButtonClass()}`}
                  >
                    {config.ctaLabel}
                  </button>
                </div>

                {/* Highlights Preview */}
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    DIFERENCIAIS
                  </Badge>
                  {[
                    config.highlightOne,
                    config.highlightTwo,
                    config.highlightThree,
                  ].map((h, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-card/50 border text-xs"
                    >
                      ✓ {h}
                    </div>
                  ))}
                </div>

                {/* Modules Preview */}
                {config.modules.length > 0 && (
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      MÓDULOS ({config.modules.length})
                    </Badge>
                    {config.modules.slice(0, 2).map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-muted/50 border text-xs truncate"
                      >
                        {m}
                      </div>
                    ))}
                    {config.modules.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{config.modules.length - 2} módulos
                      </div>
                    )}
                  </div>
                )}

                {/* Testimonial Preview */}
                {config.showTestimonial && (
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      DEPOIMENTO
                    </Badge>
                    <blockquote className="p-2 rounded border-l-2 border-primary bg-card/50 text-xs italic line-clamp-2">
                      {config.testimonial}
                    </blockquote>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
