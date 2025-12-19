'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useConfigSync, broadcastConfigChange } from '@/hooks/useConfigSync';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Palette,
  Globe,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { BrandingTab } from '@/components/admin/settings/branding-tab';

interface SystemConfig {
  companyName: string;
  systemName: string;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyAddress?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  loginBgUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  publicTheme?: any | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const { invalidateAdminConfig } = useConfigSync();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({
    companyName: '',
    systemName: '',
    maintenanceMode: false,
    registrationEnabled: true,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const res = await fetch('/api/admin/system-config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/system-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Configurações atualizadas com sucesso',
        });
        // Invalidar cache e notificar outras abas
        await invalidateAdminConfig();
        broadcastConfigChange('admin');
        // Recarregar para garantir sincronização
        await loadConfig();
      } else {
        throw new Error(data.error || 'Erro ao salvar');
      }
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description:
          error.message || 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  const updateConfig = (field: keyof SystemConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePublicTheme = async (theme: any) => {
    try {
      const res = await fetch('/api/admin/system-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, publicTheme: theme }),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setConfig((prev) => ({ ...prev, publicTheme: theme }));
      await invalidateAdminConfig();
      broadcastConfigChange('admin');

      toast({
        title: 'Tema público atualizado',
        description: 'O tema foi aplicado às páginas públicas.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o tema público.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Premium */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-2xl shadow-2xl">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Configurações do Sistema
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Sistema Online
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gerencie todas as configurações da plataforma
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="company" className="space-y-8">
          {/* Tabs Navigation Premium */}
          <div className="relative">
            <TabsList className="w-full p-1 bg-muted/50 backdrop-blur-sm rounded-xl border-2 shadow-sm flex overflow-x-auto overflow-y-hidden lg:grid lg:grid-cols-5 gap-1">
              <TabsTrigger
                value="company"
                className="flex items-center gap-2 text-xs sm:text-sm px-4 py-3 whitespace-nowrap rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="font-medium">Empresa</span>
              </TabsTrigger>
              <TabsTrigger
                value="branding"
                className="flex items-center gap-2 text-xs sm:text-sm px-4 py-3 whitespace-nowrap rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span className="font-medium">Marca</span>
              </TabsTrigger>
              <TabsTrigger
                value="theme"
                className="flex items-center gap-2 text-xs sm:text-sm px-4 py-3 whitespace-nowrap rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Palette className="h-4 w-4 shrink-0" />
                <span className="font-medium">Cores</span>
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="flex items-center gap-2 text-xs sm:text-sm px-4 py-3 whitespace-nowrap rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span className="font-medium">SEO & Social</span>
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="flex items-center gap-2 text-xs sm:text-sm px-4 py-3 whitespace-nowrap rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <SettingsIcon className="h-4 w-4 shrink-0" />
                <span className="font-medium">Sistema</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Informações da Empresa */}
          <TabsContent value="company" className="space-y-6">
            <Card className="overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="px-6 py-6 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      Informações da Empresa
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Dados básicos da instituição educacional
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="companyName"
                      className="text-sm sm:text-base"
                    >
                      Nome da Empresa <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={config.companyName}
                      onChange={(e) =>
                        updateConfig('companyName', e.target.value)
                      }
                      placeholder="SM Educacional"
                      className="min-h-11 text-base px-3 py-3"
                      aria-label="Nome da empresa"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="systemName"
                      className="text-sm sm:text-base"
                    >
                      Nome do Sistema <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="systemName"
                      value={config.systemName}
                      onChange={(e) =>
                        updateConfig('systemName', e.target.value)
                      }
                      placeholder="SM Educacional"
                      className="min-h-11 text-base px-3 py-3"
                      aria-label="Nome do sistema"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="companyEmail"
                      className="text-sm sm:text-base"
                    >
                      E-mail
                    </Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={config.companyEmail || ''}
                      onChange={(e) =>
                        updateConfig('companyEmail', e.target.value || null)
                      }
                      placeholder="contato@smeducacional.com"
                      className="min-h-11 text-base px-3 py-3"
                      aria-label="Email da empresa"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="companyPhone"
                      className="text-sm sm:text-base"
                    >
                      Telefone
                    </Label>
                    <Input
                      id="companyPhone"
                      value={config.companyPhone || ''}
                      onChange={(e) =>
                        updateConfig('companyPhone', e.target.value || null)
                      }
                      placeholder="(11) 1234-5678"
                      className="min-h-11 text-base px-3 py-3"
                      aria-label="Telefone da empresa"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label
                    htmlFor="companyAddress"
                    className="text-sm sm:text-base"
                  >
                    Endereço
                  </Label>
                  <Textarea
                    id="companyAddress"
                    value={config.companyAddress || ''}
                    onChange={(e) =>
                      updateConfig('companyAddress', e.target.value || null)
                    }
                    placeholder="Rua, número, bairro, cidade - UF"
                    rows={3}
                    className="min-h-[110px] text-base px-3 py-3"
                    aria-label="Endereço da empresa"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marca Visual */}
          <TabsContent value="branding" className="space-y-6 sm:space-y-8">
            <BrandingTab
              assets={{
                logoUrl: config.logoUrl,
                faviconUrl: config.faviconUrl,
                loginBgUrl: config.loginBgUrl,
              }}
              onUpdate={updateConfig}
            />
          </TabsContent>

          {/* Cores do Tema */}
          <TabsContent value="theme" className="space-y-6 sm:space-y-8">
            {/* Tema Público - Desativado temporariamente */}
            {/* <ThemePreview currentThemeName={config.publicTheme?.themeName} />
            <PublicThemeEditor
              currentTheme={config.publicTheme}
              onSave={handleSavePublicTheme}
            /> */}
          </TabsContent>

          {/* SEO & Redes Sociais */}
          <TabsContent value="seo" className="space-y-6 sm:space-y-8">
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-xl sm:text-2xl">
                  SEO & Meta Tags
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Otimização para mecanismos de busca
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6 space-y-6 sm:space-y-8">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="metaTitle" className="text-sm sm:text-base">
                    Meta Título
                  </Label>
                  <Input
                    id="metaTitle"
                    value={config.metaTitle || ''}
                    onChange={(e) =>
                      updateConfig('metaTitle', e.target.value || null)
                    }
                    placeholder="SM Educacional - Cursos Online"
                    maxLength={60}
                    className="min-h-11 text-base px-3 py-3"
                    aria-label="Meta título"
                    aria-describedby="metaTitleHelp"
                  />
                  <p
                    id="metaTitleHelp"
                    className="text-xs sm:text-sm text-muted-foreground"
                  >
                    Máximo 60 caracteres ({config.metaTitle?.length || 0}/60)
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label
                    htmlFor="metaDescription"
                    className="text-sm sm:text-base"
                  >
                    Meta Descrição
                  </Label>
                  <Textarea
                    id="metaDescription"
                    value={config.metaDescription || ''}
                    onChange={(e) =>
                      updateConfig('metaDescription', e.target.value || null)
                    }
                    placeholder="Plataforma completa de educação online com cursos EJA, profissionalizantes e livres"
                    rows={3}
                    maxLength={160}
                    className="min-h-[110px] text-base px-3 py-3"
                    aria-label="Meta descrição"
                    aria-describedby="metaDescriptionHelp"
                  />
                  <p
                    id="metaDescriptionHelp"
                    className="text-xs sm:text-sm text-muted-foreground"
                  >
                    Máximo 160 caracteres ({config.metaDescription?.length || 0}
                    /160)
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label
                    htmlFor="metaKeywords"
                    className="text-sm sm:text-base"
                  >
                    Palavras-chave
                  </Label>
                  <Input
                    id="metaKeywords"
                    value={config.metaKeywords || ''}
                    onChange={(e) =>
                      updateConfig('metaKeywords', e.target.value || null)
                    }
                    placeholder="educação, cursos online, EJA, profissionalizante"
                    className="min-h-11 text-base px-3 py-3"
                    aria-label="Palavras-chave para SEO"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-xl sm:text-2xl">
                  Redes Sociais
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Links para perfis nas redes sociais
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6 space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="facebookUrl"
                      className="text-sm sm:text-base"
                    >
                      Facebook
                    </Label>
                    <Input
                      id="facebookUrl"
                      type="url"
                      value={config.facebookUrl || ''}
                      onChange={(e) =>
                        updateConfig('facebookUrl', e.target.value || null)
                      }
                      placeholder="https://facebook.com/smeducacional"
                      className="min-h-11 text-base px-3 py-3"
                      aria-label="URL do Facebook"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="instagramUrl"
                      className="text-sm sm:text-base"
                    >
                      Instagram
                    </Label>
                    <Input
                      id="instagramUrl"
                      type="url"
                      value={config.instagramUrl || ''}
                      onChange={(e) =>
                        updateConfig('instagramUrl', e.target.value || null)
                      }
                      placeholder="https://instagram.com/smeducacional"
                      className="min-h-11 text-base px-3 py-3"
                      aria-label="URL do Instagram"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="linkedinUrl"
                      className="text-sm sm:text-base"
                    >
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      value={config.linkedinUrl || ''}
                      onChange={(e) =>
                        updateConfig('linkedinUrl', e.target.value || null)
                      }
                      placeholder="https://linkedin.com/company/smeducacional"
                      className="min-h-11 text-base px-3 py-3"
                      aria-label="URL do LinkedIn"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="twitterUrl"
                      className="text-sm sm:text-base"
                    >
                      Twitter/X
                    </Label>
                    <Input
                      id="twitterUrl"
                      type="url"
                      value={config.twitterUrl || ''}
                      onChange={(e) =>
                        updateConfig('twitterUrl', e.target.value || null)
                      }
                      placeholder="https://twitter.com/smeducacional"
                      className="min-h-11 text-base px-3 py-3"
                      aria-label="URL do Twitter"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="youtubeUrl" className="text-sm sm:text-base">
                    YouTube
                  </Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    value={config.youtubeUrl || ''}
                    onChange={(e) =>
                      updateConfig('youtubeUrl', e.target.value || null)
                    }
                    placeholder="https://youtube.com/@smeducacional"
                    className="min-h-11 text-base px-3 py-3"
                    aria-label="URL do YouTube"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações do Sistema */}
          <TabsContent value="system" className="space-y-6 sm:space-y-8">
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-xl sm:text-2xl">
                  Configurações Gerais
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Controles administrativos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-0.5 sm:space-y-1 flex-1">
                    <Label
                      htmlFor="maintenanceMode"
                      className="text-sm sm:text-base font-medium block"
                    >
                      Modo Manutenção
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                      Desabilita o acesso público ao sistema
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={config.maintenanceMode || false}
                    onCheckedChange={(checked) =>
                      updateConfig('maintenanceMode', checked)
                    }
                    aria-label="Ativar modo manutenção"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-0.5 sm:space-y-1 flex-1">
                    <Label
                      htmlFor="registrationEnabled"
                      className="text-sm sm:text-base font-medium block"
                    >
                      Permitir Cadastro
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                      Permite que novos usuários se cadastrem
                    </p>
                  </div>
                  <Switch
                    id="registrationEnabled"
                    checked={config.registrationEnabled !== false}
                    onCheckedChange={(checked) =>
                      updateConfig('registrationEnabled', checked)
                    }
                    aria-label="Ativar registro de novos usuários"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botão de Salvar Premium - Fixo no Mobile */}
        <div className="sticky bottom-0 sm:relative bg-background/95 backdrop-blur-lg sm:bg-transparent border-t-2 sm:border-t-0 border-primary/10 shadow-2xl sm:shadow-none p-4 sm:p-0 sm:pt-8 -mx-4 sm:mx-0 z-40">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden lg:flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <SettingsIcon className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold">Salvar Configurações</p>
                <p className="text-xs text-muted-foreground">
                  Aplicar todas as alterações realizadas
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold shadow-2xl hover:shadow-primary/50 bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 transition-all duration-300 hover:-translate-y-0.5"
            >
              {saving ? (
                <>
                  <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
