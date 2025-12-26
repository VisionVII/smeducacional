'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Loader2,
  ArrowLeft,
  Target,
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Pause,
  Play,
  Ban,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdvertisementDetail {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    price: number;
    isPublished: boolean;
  };
  teacher: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  payment: {
    id: string;
    status: string;
    amount: number;
    createdAt: string;
  } | null;
  slotPosition: string;
  status: string;
  priority: number;
  startDate: string;
  endDate: string;
  price: number;
  isPaid: boolean;
  clicks: number;
  impressions: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
  analytics: Array<{
    id: string;
    date: string;
    clicks: number;
    impressions: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  }>;
  metrics: {
    totalClicks: number;
    totalImpressions: number;
    totalConversions: number;
    ctr: number;
    conversionRate: number;
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500' },
  SCHEDULED: { label: 'Agendado', color: 'bg-blue-500' },
  ACTIVE: { label: 'Ativo', color: 'bg-green-500' },
  PAUSED: { label: 'Pausado', color: 'bg-yellow-500' },
  COMPLETED: { label: 'Concluído', color: 'bg-purple-500' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500' },
};

const positionLabels: Record<string, string> = {
  HERO_BANNER: 'Banner Principal',
  SIDEBAR_TOP: 'Sidebar Topo',
  SIDEBAR_MIDDLE: 'Sidebar Meio',
  GRID_FEATURED_1: 'Grid Destaque 1',
  GRID_FEATURED_2: 'Grid Destaque 2',
  GRID_FEATURED_3: 'Grid Destaque 3',
};

export default function AdvertisementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [ad, setAd] = useState<AdvertisementDetail | null>(null);

  const loadAdvertisement = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/advertisements/${id}`);
      if (!res.ok) throw new Error('Erro ao carregar anúncio');
      const data = await res.json();
      setAd(data);
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar anúncio',
        variant: 'destructive',
      });
      router.push('/admin/advertisements');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadAdvertisement();
  }, [loadAdvertisement]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar status');

      toast({
        title: 'Sucesso',
        description: 'Status atualizado com sucesso',
      });

      loadAdvertisement();
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Deseja realmente cancelar este anúncio?')) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao cancelar anúncio');

      toast({
        title: 'Sucesso',
        description: 'Anúncio cancelado com sucesso',
      });

      router.push('/admin/advertisements');
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao cancelar anúncio',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!ad) return null;

  const chartData = ad.analytics
    .slice()
    .reverse()
    .map((a) => ({
      date: new Date(a.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      impressions: a.impressions,
      clicks: a.clicks,
      conversions: a.conversions,
      ctr: a.ctr,
    }));

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/advertisements')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{ad.course.title}</h1>
            <div className="flex items-center gap-3">
              <Badge className={`${statusConfig[ad.status].color} text-white`}>
                {statusConfig[ad.status].label}
              </Badge>
              <Badge variant="outline">{positionLabels[ad.slotPosition]}</Badge>
              <Badge variant={ad.isPaid ? 'default' : 'destructive'}>
                {ad.isPaid ? 'Pago' : 'Pagamento Pendente'}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {ad.status === 'ACTIVE' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('PAUSED')}
                disabled={updating}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pausar
              </Button>
            )}
            {ad.status === 'PAUSED' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={updating}
              >
                <Play className="mr-2 h-4 w-4" />
                Ativar
              </Button>
            )}
            {ad.status !== 'CANCELLED' && ad.status !== 'COMPLETED' && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={updating}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Impressões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ad.metrics.totalImpressions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visualizações totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ad.metrics.totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clicks no anúncio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Conversões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ad.metrics.totalConversions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Matrículas geradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ad.metrics.ctr}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa de cliques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taxa Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ad.metrics.conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Conversão de clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Impressões e Clicks</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Impressões"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversões</CardTitle>
            <CardDescription>Matrículas geradas pelo anúncio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Conversões"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Anúncio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Posição:</span>
              <Badge variant="outline">{positionLabels[ad.slotPosition]}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Prioridade:</span>
              <Badge>{ad.priority}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preço:</span>
              <span className="font-semibold">{formatCurrency(ad.price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Período:</span>
              <span className="text-sm">
                {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Criado em:</span>
              <span className="text-sm">{formatDate(ad.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              {ad.teacher.avatar ? (
                <Image
                  src={ad.teacher.avatar}
                  alt={ad.teacher.name || 'Avatar'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {ad.teacher.name?.[0] || ad.teacher.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium">
                  {ad.teacher.name || 'Sem nome'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {ad.teacher.email}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Curso Promovido:</div>
              <div className="font-medium">{ad.course.title}</div>
              <div className="text-sm text-muted-foreground">
                Preço: {formatCurrency(ad.course.price)}
              </div>
              <Badge
                variant={ad.course.isPublished ? 'default' : 'secondary'}
                className="mt-2"
              >
                {ad.course.isPublished ? 'Publicado' : 'Não publicado'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
