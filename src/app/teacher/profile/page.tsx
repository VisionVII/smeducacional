'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
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
  Lock,
  Save,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Star,
  DollarSign,
  Shield,
  Upload,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type TabType =
  | 'pessoais'
  | 'formacao'
  | 'atuacao'
  | 'engajamento'
  | 'avaliacoes'
  | 'financeiro'
  | 'seguranca';

type Education = {
  id: string;
  degree: string;
  institution: string;
  field: string;
  year: number;
};

export default function TeacherProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('pessoais');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '',
    phone: '',
    cpf: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [education, setEducation] = useState<Education[]>([]);
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    field: '',
    year: new Date().getFullYear(),
  });
  const [financialData, setFinancialData] = useState({
    bank: '',
    agency: '',
    account: '',
    accountType: '',
    pixKey: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');

  // Carregar dados do perfil ao montar o componente
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Carregar dados pessoais
        const profileRes = await fetch('/api/teacher/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setFormData({
            name: profileData.name || '',
            email: profileData.email || '',
            bio: profileData.bio || '',
            phone: profileData.phone || '',
            cpf: profileData.cpf || '',
            address: profileData.address || '',
          });
        }

        // Carregar formação acadêmica
        const educationRes = await fetch('/api/teacher/education');
        if (educationRes.ok) {
          const educationData = await educationRes.json();
          if (educationData.length > 0) {
            setEducation(educationData);
          }
        }

        // Carregar dados financeiros
        const financialRes = await fetch('/api/teacher/financial');
        if (financialRes.ok) {
          const financialDataRes = await financialRes.json();
          if (financialDataRes) {
            setFinancialData({
              bank: financialDataRes.bank || '',
              agency: financialDataRes.agency || '',
              account: financialDataRes.account || '',
              accountType: financialDataRes.accountType || '',
              pixKey: financialDataRes.pixKey || '',
            });
          }
        }

        // Verificar status 2FA
        const twoFactorRes = await fetch('/api/teacher/2fa/status');
        if (twoFactorRes.ok) {
          const twoFactorData = await twoFactorRes.json();
          setTwoFactorEnabled(twoFactorData.enabled || false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    if (session?.user) {
      loadProfileData();
    }
  }, [session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/teacher/profile', {
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
      console.error('[TeacherProfile] update profile', error);
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
      const res = await fetch('/api/teacher/password', {
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
      console.error('[TeacherProfile] change password', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEducation = async () => {
    if (!newEducation.degree || !newEducation.institution) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha grau e instituição',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/teacher/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEducation),
      });

      if (!res.ok) throw new Error('Erro ao adicionar');

      const savedEducation = await res.json();
      setEducation([...education, savedEducation]);
      setNewEducation({
        degree: '',
        institution: '',
        field: '',
        year: new Date().getFullYear(),
      });

      toast({
        title: 'Qualificação adicionada',
        description: 'Sua qualificação foi registrada com sucesso.',
      });
    } catch (error) {
      console.error('[TeacherProfile] add education', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar qualificação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEducation = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teacher/education/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover');

      setEducation(education.filter((edu) => edu.id !== id));

      toast({
        title: 'Qualificação removida',
        description: 'Registro excluído com sucesso.',
      });
    } catch (error) {
      console.error('[TeacherProfile] remove education', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover qualificação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const res = await fetch('/api/teacher/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao fazer upload');

      await res.json();
      await update();

      toast({
        title: 'Avatar atualizado',
        description: 'Sua foto foi atualizada com sucesso.',
      });
    } catch (error) {
      console.error('[TeacherProfile] upload avatar', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinancialUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/teacher/financial', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financialData),
      });

      if (!res.ok) throw new Error('Erro ao atualizar dados');

      toast({
        title: 'Dados atualizados',
        description: 'Informações financeiras salvas com sucesso.',
      });
    } catch (error) {
      console.error('[TeacherProfile] update financial', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/2fa/setup', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Erro ao ativar 2FA');

      const respData = await res.json();
      setQrCodeUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          respData?.data?.otpauth ?? ''
        )}`
      );

      toast({
        title: '2FA em configuração',
        description: 'Escaneie o QR Code com seu aplicativo autenticador.',
      });
    } catch (error) {
      console.error('[TeacherProfile] enable 2FA', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar 2FA.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorToken) {
      toast({
        title: 'Erro',
        description: 'Digite o código do autenticador.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorToken }),
      });

      if (!res.ok) throw new Error('Código inválido');

      setTwoFactorEnabled(true);
      setQrCodeUrl('');
      setTwoFactorToken('');

      toast({
        title: '2FA ativado',
        description: 'Autenticação de dois fatores configurada com sucesso.',
      });
    } catch (error) {
      console.error('[TeacherProfile] verify 2FA', error);
      toast({
        title: 'Erro',
        description: 'Código inválido ou expirado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Erro ao desativar');

      setTwoFactorEnabled(false);
      setTwoFactorToken('');

      toast({
        title: '2FA desativado',
        description: 'Autenticação de dois fatores foi removida.',
      });
    } catch (error) {
      console.error('[TeacherProfile] disable 2FA', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar 2FA.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Hero temático consistente */}
      <div className="mb-8 rounded-2xl bg-gradient-theme shadow-lg">
        <div className="flex items-center justify-between px-6 py-6 md:px-8 md:py-7">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <User className="h-6 w-6 text-white drop-shadow" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Meu Perfil
              </h1>
              <p className="text-white/80">
                Gerencie suas informações e preferências
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Seção principal do Perfil */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-primary/10">
              <AvatarImage src={session?.user?.avatar || undefined} />
              <AvatarFallback className="text-4xl">
                {session?.user?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isLoading}
              />
            </label>
          </div>

          {/* Info Principal */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-1">{session?.user?.name}</h1>
            <p className="text-lg text-muted-foreground mb-2">
              Professor | Educador Digital
            </p>
            <div className="flex gap-2 mb-4">
              <Badge className="bg-green-600">Ativo</Badge>
              <Badge variant="outline">75% Completo</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navegação de Tabs */}
      <div className="flex gap-2 mb-8 border-b overflow-x-auto pb-0 -mx-4 px-4">
        {[
          { id: 'pessoais', label: 'Pessoais', icon: User },
          { id: 'formacao', label: 'Formação', icon: GraduationCap },
          { id: 'atuacao', label: 'Atuação', icon: Briefcase },
          { id: 'engajamento', label: 'Engajamento', icon: MessageSquare },
          { id: 'avaliacoes', label: 'Avaliações', icon: Star },
          { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
          { id: 'seguranca', label: 'Segurança', icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      <div className="space-y-6">
        {/* TAB: Pessoais */}
        {activeTab === 'pessoais' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize seu nome, email e informações de contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) =>
                          setFormData({ ...formData, cpf: e.target.value })
                        }
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Rua, número, cidade, estado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Conte um pouco sobre você..."
                      className="w-full px-3 py-2 border rounded-md bg-background text-foreground h-24 resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* TAB: Formação */}
        {activeTab === 'formacao' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Educação & Especializações</CardTitle>
                <CardDescription>
                  Adicione seus cursos, certificações e qualificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {education?.map((edu, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {edu.field} • {edu.year}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEducation(edu.id)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">
                    Adicionar Nova Qualificação
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree">Tipo de Certificação</Label>
                      <Input
                        id="degree"
                        value={newEducation.degree}
                        onChange={(e) =>
                          setNewEducation({
                            ...newEducation,
                            degree: e.target.value,
                          })
                        }
                        placeholder="Graduação, Mestrado, Certificado..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution">Instituição</Label>
                      <Input
                        id="institution"
                        value={newEducation.institution}
                        onChange={(e) =>
                          setNewEducation({
                            ...newEducation,
                            institution: e.target.value,
                          })
                        }
                        placeholder="Nome da universidade/instituição"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="field">Área de Estudo</Label>
                      <Input
                        id="field"
                        value={newEducation.field}
                        onChange={(e) =>
                          setNewEducation({
                            ...newEducation,
                            field: e.target.value,
                          })
                        }
                        placeholder="Ex: Pedagogia, Matemática..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Ano de Conclusão</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newEducation.year}
                        onChange={(e) =>
                          setNewEducation({
                            ...newEducation,
                            year: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddEducation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Qualificação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* TAB: Atuação */}
        {activeTab === 'atuacao' && (
          <Card>
            <CardHeader>
              <CardTitle>Atuação Pedagógica</CardTitle>
              <CardDescription>
                Informações sobre sua experiência e especialidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Disciplinas</Label>
                  <Input placeholder="Ex: Matemática, Português..." />
                </div>
                <div className="space-y-2">
                  <Label>Níveis de Ensino</Label>
                  <Input placeholder="Ex: Ensino Fundamental, Médio..." />
                </div>
                <div className="space-y-2">
                  <Label>Anos de Experiência</Label>
                  <Input type="number" placeholder="Ex: 10" />
                </div>
                <div className="space-y-2">
                  <Label>Modalidade</Label>
                  <Input placeholder="Presencial, Online, Híbrido..." />
                </div>
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Salvar Atuação
              </Button>
            </CardContent>
          </Card>
        )}

        {/* TAB: Engajamento */}
        {activeTab === 'engajamento' && (
          <Card>
            <CardHeader>
              <CardTitle>Engajamento & Comunicação</CardTitle>
              <CardDescription>
                Métricas de interação com alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Tempo médio de resposta
                  </p>
                  <p className="text-3xl font-bold">-</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Mensagens respondidas
                  </p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Taxa de resposta
                  </p>
                  <p className="text-3xl font-bold">-</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Fóruns ativos</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB: Avaliações */}
        {activeTab === 'avaliacoes' && (
          <Card>
            <CardHeader>
              <CardTitle>Avaliações & Reputação</CardTitle>
              <CardDescription>
                Veja avaliações e comentários dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Ainda sem avaliações de alunos
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB: Financeiro */}
        {activeTab === 'financeiro' && (
          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
              <CardDescription>
                Dados bancários e configurações de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleFinancialUpdate}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input
                      placeholder="Ex: Banco do Brasil..."
                      value={financialData.bank}
                      onChange={(e) =>
                        setFinancialData({
                          ...financialData,
                          bank: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agência</Label>
                    <Input
                      placeholder="Número da agência"
                      value={financialData.agency}
                      onChange={(e) =>
                        setFinancialData({
                          ...financialData,
                          agency: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input
                      placeholder="Número da conta"
                      value={financialData.account}
                      onChange={(e) =>
                        setFinancialData({
                          ...financialData,
                          account: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Conta</Label>
                    <Input
                      placeholder="Corrente, Poupança..."
                      value={financialData.accountType}
                      onChange={(e) =>
                        setFinancialData({
                          ...financialData,
                          accountType: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Chave PIX (opcional)</Label>
                    <Input
                      placeholder="CPF, Email, Celular ou Chave aleatória"
                      value={financialData.pixKey}
                      onChange={(e) =>
                        setFinancialData({
                          ...financialData,
                          pixKey: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Dados Bancários
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* TAB: Segurança */}
        {activeTab === 'seguranca' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso para manter sua conta segura
                </CardDescription>
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
                    <Label htmlFor="confirmPassword">
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
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    <Lock className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Autenticação de Dois Fatores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>

                {!twoFactorEnabled && !qrCodeUrl && (
                  <Button onClick={handleEnable2FA} disabled={isLoading}>
                    <Shield className="h-4 w-4 mr-2" />
                    Ativar Autenticação de Dois Fatores
                  </Button>
                )}

                {qrCodeUrl && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Escaneie o QR Code</p>
                        <p className="text-sm text-muted-foreground">
                          Use um app autenticador como Google Authenticator ou
                          Authy
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Image
                        src={qrCodeUrl}
                        alt="QR Code 2FA"
                        width={192}
                        height={192}
                        className="w-48 h-48"
                        unoptimized
                        priority
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Código do Autenticador</Label>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        value={twoFactorToken}
                        onChange={(e) => setTwoFactorToken(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleVerify2FA} disabled={isLoading}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verificar e Ativar
                    </Button>
                  </div>
                )}

                {twoFactorEnabled && (
                  <div className="space-y-4 border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">2FA Ativo</p>
                        <p className="text-sm text-green-700">
                          Sua conta está protegida com autenticação de dois
                          fatores
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Código para desativar</Label>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        value={twoFactorToken}
                        onChange={(e) => setTwoFactorToken(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDisable2FA}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Desativar 2FA
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Acessos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ainda nenhum acesso registrado
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
