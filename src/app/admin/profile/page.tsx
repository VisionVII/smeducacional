'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { User, Lock, Save, ShieldCheck, ShieldOff, QrCode } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TwoFactorModal } from '@/components/two-factor-modal';

export default function AdminProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
  const [pendingVerificationCode, setPendingVerificationCode] = useState('');

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

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Perfil (Admin)</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Atualize seu nome e email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  autoComplete="email"
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Altere sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
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
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 2FA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Autenticação em Duas Etapas (2FA)
            </CardTitle>
            <CardDescription>
              Proteja sua conta com TOTP (Google Authenticator, Authy)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {twoFA.enabled ? (
              <div className="space-y-3">
                <p className="text-green-600">
                  2FA está habilitado nesta conta.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDisable2FA}
                  disabled={isLoading}
                >
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Desabilitar 2FA
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {!twoFA.secret ? (
                  <Button
                    type="button"
                    onClick={handleSetup2FA}
                    disabled={isLoading}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Gerar QR Code 2FA
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Abra seu app de autenticação e escaneie este QR:
                    </p>
                    <div className="flex items-center gap-4">
                      <img
                        alt="QR Code 2FA"
                        className="w-40 h-40 rounded border"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          twoFA.otpauth!
                        )}`}
                      />
                      <div className="text-xs break-all">
                        <div className="font-medium mb-1">otpauth URL</div>
                        <div className="p-2 bg-secondary rounded">
                          {twoFA.otpauth}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setShowVerifyModal(true)}
                      disabled={isLoading}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verificar e Habilitar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
