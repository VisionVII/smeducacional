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
import {
  User,
  Mail,
  Lock,
  Save,
  Upload,
  ShieldCheck,
  ShieldOff,
  QrCode,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function StudentProfilePage() {
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
    code?: string;
    enabled?: boolean;
  }>({
    enabled: (session?.user as any)?.twoFactorEnabled ?? false,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/student/profile', {
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
      const res = await fetch('/api/student/password', {
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      {/* Avatar */}
      <div className="mb-6 flex items-center gap-3 sm:gap-4">
        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-1 ring-primary/20 shadow-sm">
          <AvatarImage src={session?.user?.avatar || undefined} />
          <AvatarFallback>
            {session?.user?.name?.charAt(0) || 'A'}
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="student-avatar-upload"
          className="inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 sm:py-2 rounded-md hover:bg-primary/90 transition-colors cursor-pointer text-sm min-h-[44px]"
        >
          <Upload className="h-4 w-4" />
          Alterar foto
          <input
            id="student-avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append('file', file);
              setIsLoading(true);
              try {
                const res = await fetch('/api/student/avatar', {
                  method: 'POST',
                  body: fd,
                });
                if (!res.ok) throw new Error('Erro ao enviar avatar');
                await update();
                toast({
                  title: 'Avatar atualizado',
                  description: 'Sua foto foi atualizada com sucesso.',
                });
              } catch (err) {
                toast({
                  title: 'Erro',
                  description: 'Não foi possível atualizar a foto.',
                  variant: 'destructive',
                });
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          />
        </label>
      </div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Meu Perfil
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Atualize seu nome e email
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form
              onSubmit={handleProfileUpdate}
              className="space-y-3 sm:space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  className="min-h-[44px]"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="min-h-[44px]"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  autoComplete="email"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Altere sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form
              onSubmit={handlePasswordChange}
              className="space-y-3 sm:space-y-4"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="text-sm sm:text-base"
                >
                  Senha Atual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="min-h-[44px]"
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
                <Label htmlFor="newPassword" className="text-sm sm:text-base">
                  Nova Senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="min-h-[44px]"
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
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm sm:text-base"
                >
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="min-h-[44px]"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto min-h-[44px]"
              >
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
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const res = await fetch('/api/student/2fa/disable', {
                        method: 'POST',
                      });
                      if (!res.ok) throw new Error('Erro ao desabilitar 2FA');
                      setTwoFA({ enabled: false });
                      await update();
                      toast({
                        title: '2FA desabilitado',
                        description:
                          'Você pode habilitar novamente quando quiser.',
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
                  }}
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
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const res = await fetch('/api/student/2fa/setup', {
                          method: 'POST',
                        });
                        const json = await res.json();
                        if (!res.ok)
                          throw new Error(
                            json?.error || 'Falha ao gerar segredo'
                          );
                        setTwoFA({
                          ...twoFA,
                          secret: json.data.secret,
                          otpauth: json.data.otpauth,
                        });
                        toast({
                          title: '2FA iniciado',
                          description:
                            'Escaneie o QR com seu app de autenticação.',
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
                    }}
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
                      {/* Para exibir QR sem lib extra, usamos uma URL para um gerador externo confiável */}
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
                    <div className="space-y-2">
                      <Label htmlFor="twofa-code">
                        Digite o código de 6 dígitos
                      </Label>
                      <Input
                        id="twofa-code"
                        inputMode="numeric"
                        pattern="\\d{6}"
                        placeholder="000000"
                        value={twoFA.code || ''}
                        onChange={(e) =>
                          setTwoFA({ ...twoFA, code: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!twoFA.code || twoFA.code.length !== 6) {
                          toast({
                            title: 'Código inválido',
                            description:
                              'Informe os 6 dígitos do app de autenticação.',
                            variant: 'destructive',
                          });
                          return;
                        }
                        setIsLoading(true);
                        try {
                          const res = await fetch('/api/2fa/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: twoFA.code }),
                          });
                          const json = await res.json();
                          if (!res.ok)
                            throw new Error(
                              json?.error || 'Falha ao verificar 2FA'
                            );
                          setTwoFA({ enabled: true });
                          await update();
                          toast({
                            title: '2FA habilitado',
                            description: 'Sua conta agora requer 2FA no login.',
                          });
                        } catch (e) {
                          toast({
                            title: 'Erro',
                            description: 'Código incorreto. Tente novamente.',
                            variant: 'destructive',
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
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

        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de conta:</span>
              <span className="font-medium">Aluno</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de conta:</span>
              <span className="font-medium">Aluno</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
