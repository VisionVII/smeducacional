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
} from 'lucide-react';

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
    <div className="container max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Gerencie as configurações globais do sistema educacional
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full sm:w-auto min-h-11 text-base"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6 sm:space-y-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <TabsTrigger
            value="company"
            className="flex items-center gap-1 text-xs sm:text-sm p-2 sm:p-3"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
            <span className="sm:hidden">Emp.</span>
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="flex items-center gap-1 text-xs sm:text-sm p-2 sm:p-3"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Marca</span>
            <span className="sm:hidden">Marc.</span>
          </TabsTrigger>
          <TabsTrigger
            value="theme"
            className="flex items-center gap-1 text-xs sm:text-sm p-2 sm:p-3"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Cores</span>
            <span className="sm:hidden">Cor</span>
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="flex items-center gap-1 text-xs sm:text-sm p-2 sm:p-3"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">SEO & Social</span>
            <span className="sm:hidden">SEO</span>
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="flex items-center gap-1 text-xs sm:text-sm p-2 sm:p-3"
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
            <span className="sm:hidden">Sis.</span>
          </TabsTrigger>
        </TabsList>

        {/* Informações da Empresa */}
        <TabsContent value="company" className="space-y-6 sm:space-y-8">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="text-xl sm:text-2xl">Informações da Empresa</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Dados básicos da instituição educacional
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="companyName" className="text-sm sm:text-base">
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
                  <Label htmlFor="systemName" className="text-sm sm:text-base">
                    Nome do Sistema <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="systemName"
                    value={config.systemName}
                    onChange={(e) => updateConfig('systemName', e.target.value)}
                    placeholder="SM Educacional"
                    className="min-h-11 text-base px-3 py-3"
                    aria-label="Nome do sistema"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="companyEmail" className="text-sm sm:text-base">
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
                  <Label htmlFor="companyPhone" className="text-sm sm:text-base">
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
                <Label htmlFor="companyAddress" className="text-sm sm:text-base">
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
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="text-xl sm:text-2xl">Identidade Visual</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Logos e imagens de marca (URLs públicas)
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="logoUrl" className="text-sm sm:text-base">
                  Logo Principal (URL)
                </Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={config.logoUrl || ''}
                  onChange={(e) =>
                    updateConfig('logoUrl', e.target.value || null)
                  }
                  placeholder="https://exemplo.com/logo.png"
                  className="min-h-11 text-base px-3 py-3"
                  aria-label="URL da logo principal"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  Esta logo aparecerá em todos os menus (admin, professor,
                  aluno) e páginas públicas
                </p>
                {config.logoUrl && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 border rounded-lg bg-muted/50 flex items-center justify-center">
                    <img
                      src={config.logoUrl}
                      alt="Logo Preview"
                      className="h-12 sm:h-16 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="faviconUrl" className="text-sm sm:text-base">
                  Favicon (URL)
                </Label>
                <Input
                  id="faviconUrl"
                  type="url"
                  value={config.faviconUrl || ''}
                  onChange={(e) =>
                    updateConfig('faviconUrl', e.target.value || null)
                  }
                  placeholder="https://exemplo.com/favicon.ico"
                  className="min-h-11 text-base px-3 py-3"
                  aria-label="URL do favicon"
                />
                {config.faviconUrl && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 border rounded-lg bg-muted/50 flex items-center gap-3">
                    <img
                      src={config.faviconUrl}
                      alt="Favicon Preview"
                      className="h-6 sm:h-8 w-6 sm:w-8 object-contain"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Preview do favicon
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="loginBgUrl" className="text-sm sm:text-base">
                  Imagem de Fundo do Login (URL)
                </Label>
                <Input
                  id="loginBgUrl"
                  type="url"
                  value={config.loginBgUrl || ''}
                  onChange={(e) =>
                    updateConfig('loginBgUrl', e.target.value || null)
                  }
                  placeholder="https://exemplo.com/login-bg.jpg"
                  className="min-h-11 text-base px-3 py-3"
                  aria-label="URL da imagem de fundo do login"
                />
                {config.loginBgUrl && (
                  <div className="mt-3 sm:mt-4 rounded-lg overflow-hidden border">
                    <img
                      src={config.loginBgUrl}
                      alt="Login BG Preview"
                      className="w-full h-24 sm:h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cores do Tema */}
        <TabsContent value="theme" className="space-y-6 sm:space-y-8">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="text-xl sm:text-2xl">Cores do Sistema</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Cores primárias e secundárias para páginas públicas
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="primaryColor" className="text-sm sm:text-base block">
                    Cor Primária
                  </Label>
                  <div className="flex gap-2 sm:gap-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={config.primaryColor || '#3b82f6'}
                      onChange={(e) =>
                        updateConfig('primaryColor', e.target.value)
                      }
                      className="w-16 sm:w-20 h-11 sm:h-12 cursor-pointer p-1 sm:p-2"
                      aria-label="Cor primária"
                    />
                    <Input
                      type="text"
                      value={config.primaryColor || '#3b82f6'}
                      onChange={(e) =>
                        updateConfig('primaryColor', e.target.value)
                      }
                      placeholder="#3b82f6"
                      className="flex-1 min-h-11 text-base px-3 py-3 font-mono"
                      aria-label="Código hexadecimal da cor primária"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="secondaryColor" className="text-sm sm:text-base block">
                    Cor Secundária
                  </Label>
                  <div className="flex gap-2 sm:gap-3">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={config.secondaryColor || '#8b5cf6'}
                      onChange={(e) =>
                        updateConfig('secondaryColor', e.target.value)
                      }
                      className="w-16 sm:w-20 h-11 sm:h-12 cursor-pointer p-1 sm:p-2"
                      aria-label="Cor secundária"
                    />
                    <Input
                      type="text"
                      value={config.secondaryColor || '#8b5cf6'}
                      onChange={(e) =>
                        updateConfig('secondaryColor', e.target.value)
                      }
                      placeholder="#8b5cf6"
                      className="flex-1 min-h-11 text-base px-3 py-3 font-mono"
                      aria-label="Código hexadecimal da cor secundária"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 border rounded-lg bg-muted/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Preview das cores:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div
                    className="h-14 sm:h-16 w-full rounded-md flex items-center justify-center text-white font-medium text-sm sm:text-base"
                    style={{
                      backgroundColor: config.primaryColor || '#3b82f6',
                    }}
                  >
                    Primária
                  </div>
                  <div
                    className="h-14 sm:h-16 w-full rounded-md flex items-center justify-center text-white font-medium text-sm sm:text-base"
                    style={{
                      backgroundColor: config.secondaryColor || '#8b5cf6',
                    }}
                  >
                    Secundária
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Redes Sociais */}
        <TabsContent value="seo" className="space-y-6 sm:space-y-8">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="text-xl sm:text-2xl">SEO & Meta Tags</CardTitle>
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
                <p id="metaTitleHelp" className="text-xs sm:text-sm text-muted-foreground">
                  Máximo 60 caracteres ({config.metaTitle?.length || 0}/60)
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="metaDescription" className="text-sm sm:text-base">
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
                <p id="metaDescriptionHelp" className="text-xs sm:text-sm text-muted-foreground">
                  Máximo 160 caracteres ({config.metaDescription?.length || 0}/160)
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
              <CardTitle className="text-xl sm:text-2xl">Redes Sociais</CardTitle>
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
                  <Label htmlFor="instagramUrl" className="text-sm sm:text-base">
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
              <CardTitle className="text-xl sm:text-2xl">Configurações Gerais</CardTitle>
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

      {/* Footer com botão de salvar fixa em mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end sticky bottom-0 sm:relative bg-background sm:bg-transparent border-t sm:border-t-0 p-4 sm:p-0 sm:pt-6 -mx-4 sm:mx-0 sm:px-0">
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto min-h-11 text-base">
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}
