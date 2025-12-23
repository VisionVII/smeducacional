'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  User,
  Lock,
  Save,
  ShieldCheck,
  ShieldOff,
  QrCode,
  Upload,
  Camera,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TwoFactorModal } from '@/components/two-factor-modal';

export default function AdminProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFA, setTwoFA] = useState<{
    secret?: string;
    otpauth?: string;
    enabled?: boolean;
  }>({
    enabled: (session?.user as any)?.twoFactorEnabled ?? false,
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    session?.user?.avatar || null
  );

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Erro ao atualizar perfil');

      await update();
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) throw new Error('Erro ao alterar senha');

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/2fa/setup', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha ao gerar segredo');
      setTwoFA({
        ...twoFA,
        secret: json.data.secret,
        otpauth: json.data.otpauth,
      });
      setShowVerifyModal(true);
      toast({
        title: '2FA iniciado',
        description: 'Escaneie o QR com seu app de autenticação.',
      });
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o 2FA.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (code: string) => {
    const res = await fetch('/api/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Falha ao verificar 2FA');
    setTwoFA({ enabled: true });
    await update();
    toast({
      title: '2FA habilitado',
      description: 'Sua conta agora requer 2FA no login.',
    });
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/2fa/disable', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao desabilitar 2FA');
      setTwoFA({ enabled: false });
      await update();
      toast({
        title: '2FA desabilitado',
        description: 'Você pode habilitar novamente quando quiser.',
      });
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível desabilitar o 2FA.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Erro',
        description: 'Tipo de arquivo inválido. Use JPG, PNG ou WEBP',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'Arquivo muito grande. Máximo 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao fazer upload');

      setAvatarPreview(data.avatarUrl);
      await update();

      toast({
        title: 'Foto atualizada',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível fazer upload da foto',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-6 sm:py-10 px-4 max-w-5xl">
        {/* Header com gradiente */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-theme rounded-xl shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient-theme-triple">
                Meu Perfil
              </h1>
              <Badge variant="outline" className="mt-1">
                <Shield className="h-3 w-3 mr-1" />
                Administrador
              </Badge>
            </div>
          </div>
          <p className="text-base text-muted-foreground ml-[60px]">
            Gerencie suas informações pessoais e configurações de segurança
          </p>
        </div>

        {/* Grid responsivo 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda - Avatar e Info rápida */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl ring-4 ring-primary/20 transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage
                        src={avatarPreview || session?.user?.avatar || ''}
                        alt="Avatar"
                        className="object-cover"
                      />
                      <AvatarFallback className="text-4xl font-bold bg-gradient-theme text-white">
                        {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">
                  {session?.user?.name}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  {session?.user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="w-full group hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  {isUploadingAvatar ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Alterar Foto
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  JPG, PNG ou WEBP • Máx 5MB
                </p>
              </CardContent>
            </Card>

            {/* Status de Segurança */}
            <Card className="border-2 hover:border-green-500/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Status de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Senha Forte</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-700 border-green-500/30"
                  >
                    Ativo
                  </Badge>
                </div>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    twoFA.enabled
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {twoFA.enabled ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="text-sm font-medium">2FA</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      twoFA.enabled
                        ? 'bg-green-500/10 text-green-700 border-green-500/30'
                        : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30'
                    }
                  >
                    {twoFA.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita - Formulários */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize seu nome e email de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="h-11 text-base"
                      placeholder="Digite seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      autoComplete="email"
                      className="h-11 text-base"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      size="lg"
                      className="min-w-[160px] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Alterar Senha */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-5 w-5 text-primary" />
                  Segurança da Conta
                </CardTitle>
                <CardDescription>
                  Altere sua senha para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Key className="h-4 w-4 text-muted-foreground" />
                      Senha Atual
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                      autoComplete="current-password"
                      className="h-11 text-base"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-medium"
                      >
                        Nova Senha
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        autoComplete="new-password"
                        className="h-11 text-base"
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium"
                      >
                        Confirmar Nova Senha
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        autoComplete="new-password"
                        className="h-11 text-base"
                        placeholder="Digite novamente"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      size="lg"
                      variant="outline"
                      className="min-w-[160px] border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Alterando...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Alterar Senha
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 2FA */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Autenticação em Duas Etapas (2FA)
                </CardTitle>
                <CardDescription>
                  Adicione uma camada extra de proteção com TOTP (Google
                  Authenticator, Authy, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {twoFA.enabled ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            2FA Ativo
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            Sua conta está protegida com autenticação em duas
                            etapas.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDisable2FA}
                      disabled={isLoading}
                      size="lg"
                      className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <ShieldOff className="h-4 w-4 mr-2" />
                      Desabilitar 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {!twoFA.secret ? (
                      <>
                        <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                2FA Não Configurado
                              </p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Recomendamos ativar o 2FA para maior segurança.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={handleSetup2FA}
                          disabled={isLoading}
                          size="lg"
                          className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Configurar 2FA
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                            Escaneie o QR Code
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                            Abra seu app de autenticação (Google Authenticator,
                            Authy, etc.) e escaneie o código abaixo:
                          </p>
                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg">
                            <img
                              alt="QR Code 2FA"
                              className="w-48 h-48 rounded-lg border-2 shadow-lg"
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                                twoFA.otpauth!
                              )}`}
                            />
                            <div className="flex-1 w-full">
                              <p className="font-medium mb-2 text-sm">
                                Não consegue escanear?
                              </p>
                              <div className="p-3 bg-secondary rounded-lg text-xs break-all overflow-auto max-h-32 border">
                                {twoFA.otpauth}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setShowVerifyModal(true)}
                          disabled={isLoading}
                          size="lg"
                          className="w-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Verificar e Ativar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TwoFactorModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerify={handleVerify2FA}
        title="Verificar Código 2FA"
        description="Digite o código de 6 dígitos do seu app de autenticação para habilitar o 2FA."
      />
    </div>
  );
}
