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
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as configurações globais do sistema educacional
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            SEO & Social
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Sistema
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
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
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
                  <Label htmlFor="systemName">Nome do Sistema *</Label>
                  <Input
                    id="systemName"
                    value={config.systemName}
                    onChange={(e) => updateConfig('systemName', e.target.value)}
                    placeholder="SM Educacional"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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

        {/* Marca Visual */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>
                Logos e imagens de marca (URLs públicas)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo Principal (URL)</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={config.logoUrl || ''}
                  onChange={(e) =>
                    updateConfig('logoUrl', e.target.value || null)
                  }
                  placeholder="https://exemplo.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Esta logo aparecerá em todos os menus (admin, professor,
                  aluno) e páginas públicas
                </p>
                {config.logoUrl && (
                  <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                    <img
                      src={config.logoUrl}
                      alt="Logo Preview"
                      className="h-12 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon (URL)</Label>
                <Input
                  id="faviconUrl"
                  type="url"
                  value={config.faviconUrl || ''}
                  onChange={(e) =>
                    updateConfig('faviconUrl', e.target.value || null)
                  }
                  placeholder="https://exemplo.com/favicon.ico"
                />
                {config.faviconUrl && (
                  <div className="mt-2 p-4 border rounded-lg bg-muted/50 flex items-center gap-3">
                    <img
                      src={config.faviconUrl}
                      alt="Favicon Preview"
                      className="h-6 w-6 object-contain"
                    />
                    <span className="text-sm text-muted-foreground">
                      Preview do favicon
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginBgUrl">
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
                />
                {config.loginBgUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={config.loginBgUrl}
                      alt="Login BG Preview"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cores do Tema */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cores do Sistema</CardTitle>
              <CardDescription>
                Cores primárias e secundárias para páginas públicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={config.primaryColor || '#3b82f6'}
                      onChange={(e) =>
                        updateConfig('primaryColor', e.target.value)
                      }
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.primaryColor || '#3b82f6'}
                      onChange={(e) =>
                        updateConfig('primaryColor', e.target.value)
                      }
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-3">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={config.secondaryColor || '#8b5cf6'}
                      onChange={(e) =>
                        updateConfig('secondaryColor', e.target.value)
                      }
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.secondaryColor || '#8b5cf6'}
                      onChange={(e) =>
                        updateConfig('secondaryColor', e.target.value)
                      }
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Preview das cores:
                </p>
                <div className="flex gap-4">
                  <div
                    className="h-16 w-full rounded-md flex items-center justify-center text-white font-medium"
                    style={{
                      backgroundColor: config.primaryColor || '#3b82f6',
                    }}
                  >
                    Primária
                  </div>
                  <div
                    className="h-16 w-full rounded-md flex items-center justify-center text-white font-medium"
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
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Tags</CardTitle>
              <CardDescription>
                Otimização para mecanismos de busca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Título</Label>
                <Input
                  id="metaTitle"
                  value={config.metaTitle || ''}
                  onChange={(e) =>
                    updateConfig('metaTitle', e.target.value || null)
                  }
                  placeholder="SM Educacional - Cursos Online"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo 60 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Descrição</Label>
                <Textarea
                  id="metaDescription"
                  value={config.metaDescription || ''}
                  onChange={(e) =>
                    updateConfig('metaDescription', e.target.value || null)
                  }
                  placeholder="Plataforma completa de educação online com cursos EJA, profissionalizantes e livres"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo 160 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Palavras-chave</Label>
                <Input
                  id="metaKeywords"
                  value={config.metaKeywords || ''}
                  onChange={(e) =>
                    updateConfig('metaKeywords', e.target.value || null)
                  }
                  placeholder="educação, cursos online, EJA, profissionalizante"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Links para perfis nas redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    type="url"
                    value={config.facebookUrl || ''}
                    onChange={(e) =>
                      updateConfig('facebookUrl', e.target.value || null)
                    }
                    placeholder="https://facebook.com/smeducacional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    value={config.instagramUrl || ''}
                    onChange={(e) =>
                      updateConfig('instagramUrl', e.target.value || null)
                    }
                    placeholder="https://instagram.com/smeducacional"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={config.linkedinUrl || ''}
                    onChange={(e) =>
                      updateConfig('linkedinUrl', e.target.value || null)
                    }
                    placeholder="https://linkedin.com/company/smeducacional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter/X</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={config.twitterUrl || ''}
                    onChange={(e) =>
                      updateConfig('twitterUrl', e.target.value || null)
                    }
                    placeholder="https://twitter.com/smeducacional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube</Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  value={config.youtubeUrl || ''}
                  onChange={(e) =>
                    updateConfig('youtubeUrl', e.target.value || null)
                  }
                  placeholder="https://youtube.com/@smeducacional"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Controles administrativos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="maintenanceMode"
                    className="text-base font-medium"
                  >
                    Modo Manutenção
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Desabilita o acesso público ao sistema
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={config.maintenanceMode || false}
                  onCheckedChange={(checked) =>
                    updateConfig('maintenanceMode', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="registrationEnabled"
                    className="text-base font-medium"
                  >
                    Permitir Cadastro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que novos usuários se cadastrem
                  </p>
                </div>
                <Switch
                  id="registrationEnabled"
                  checked={config.registrationEnabled !== false}
                  onCheckedChange={(checked) =>
                    updateConfig('registrationEnabled', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}
