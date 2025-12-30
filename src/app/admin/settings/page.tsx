'use client';

import { useState, useEffect } from 'react';
import { useConfigSync, broadcastConfigChange } from '@/hooks/useConfigSync';
import { clearBrandingCache } from '@/hooks/use-system-branding';
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
  Globe,
  Settings as SettingsIcon,
  Image as ImageIcon,
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
  publicTheme?: unknown | null;
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
  promotedCourseId?: string | null;
}

export default function AdminSettingsPage() {
  const { invalidateAdminConfig } = useConfigSync();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
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
    if (!config.companyName?.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome da empresa é obrigatório.',
        variant: 'destructive',
      });
      setActiveTab('company');
      return;
    }

    if (!config.systemName?.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do sistema é obrigatório.',
        variant: 'destructive',
      });
      setActiveTab('company');
      return;
    }

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
        // Limpar cache de branding (logo, favicon, etc) para forçar recarregamento
        clearBrandingCache();
        // Recarregar para garantir sincronização
        await loadConfig();
      } else {
        throw new Error(data.error || 'Erro ao salvar');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  const updateConfig = (
    field: keyof SystemConfig,
    value: string | boolean | null
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {/* Tabs Navigation */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-muted/50">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Identidade Visual</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">SEO & Social</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Informações da Empresa */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Dados básicos da instituição educacional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Nome da Empresa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={config.companyName}
                    onChange={(e) =>
                      updateConfig('companyName', e.target.value)
                    }
                    placeholder="SM Educacional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemName">
                    Nome do Sistema <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="systemName"
                    value={config.systemName}
                    onChange={(e) => updateConfig('systemName', e.target.value)}
                    placeholder="SM Educacional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">E-mail</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={config.companyEmail || ''}
                    onChange={(e) =>
                      updateConfig('companyEmail', e.target.value || null)
                    }
                    placeholder="contato@smeducacional.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefone</Label>
                  <Input
                    id="companyPhone"
                    value={config.companyPhone || ''}
                    onChange={(e) =>
                      updateConfig('companyPhone', e.target.value || null)
                    }
                    placeholder="(11) 1234-5678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Endereço</Label>
                <Textarea
                  id="companyAddress"
                  value={config.companyAddress || ''}
                  onChange={(e) =>
                    updateConfig('companyAddress', e.target.value || null)
                  }
                  placeholder="Rua, número, bairro, cidade - UF"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Identidade Visual */}
        <TabsContent value="branding" className="space-y-6 sm:space-y-8">
          <BrandingTab
            assets={{
              logoUrl: config.logoUrl,
              faviconUrl: config.faviconUrl,
              loginBgUrl: config.loginBgUrl,
              promotedCourseId: config.promotedCourseId,
            }}
            onUpdate={updateConfig}
          />
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
                <Label htmlFor="metaKeywords" className="text-sm sm:text-base">
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
                  <Label htmlFor="facebookUrl" className="text-sm sm:text-base">
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
                  <Label htmlFor="linkedinUrl" className="text-sm sm:text-base">
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
                  <Label htmlFor="twitterUrl" className="text-sm sm:text-base">
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

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={handleSave}
          disabled={saving || !config.companyName || !config.systemName}
          size="lg"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Salvando...
            </>
          ) : (
            <>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
