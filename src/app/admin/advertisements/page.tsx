'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Loader2,
  Plus,
  Search,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  XCircle,
  Pause,
} from 'lucide-react';

interface Advertisement {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
  };
  teacher: {
    id: string;
    name: string | null;
    email: string;
  };
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
}

interface AdsResponse {
  ads: Advertisement[];
  total: number;
  page: number;
  totalPages: number;
}

const statusConfig = {
  DRAFT: { label: 'Rascunho', icon: Clock, color: 'bg-gray-500' },
  SCHEDULED: { label: 'Agendado', icon: Clock, color: 'bg-blue-500' },
  ACTIVE: { label: 'Ativo', icon: CheckCircle, color: 'bg-green-500' },
  PAUSED: { label: 'Pausado', icon: Pause, color: 'bg-yellow-500' },
  COMPLETED: { label: 'Concluído', icon: CheckCircle, color: 'bg-purple-500' },
  CANCELLED: { label: 'Cancelado', icon: XCircle, color: 'bg-red-500' },
};

const positionLabels: Record<string, string> = {
  HERO_BANNER: 'Banner Principal',
  SIDEBAR_TOP: 'Sidebar Topo',
  SIDEBAR_MIDDLE: 'Sidebar Meio',
  GRID_FEATURED_1: 'Grid Destaque 1',
  GRID_FEATURED_2: 'Grid Destaque 2',
  GRID_FEATURED_3: 'Grid Destaque 3',
};

export default function AdvertisementsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadAds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (positionFilter !== 'all') params.append('position', positionFilter);

      const res = await fetch(`/api/admin/advertisements?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar anúncios');

      const data: AdsResponse = await res.json();
      setAds(data.ads || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error loading ads:', error);
      setAds([]);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar anúncios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, positionFilter]);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
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

      loadAds();
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este anúncio?')) return;

    try {
      const res = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao cancelar anúncio');

      toast({
        title: 'Sucesso',
        description: 'Anúncio cancelado com sucesso',
      });

      loadAds();
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao cancelar anúncio',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0%';
    return `${((clicks / impressions) * 100).toFixed(2)}%`;
  };

  const filteredAds = (ads || []).filter((ad) =>
    ad.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Anúncios</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de agendamento e analytics de anúncios
          </p>
        </div>
        <Button onClick={() => router.push('/admin/advertisements/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Anúncio
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Anúncios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ads ? ads.filter((a) => a.status === 'ACTIVE').length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {ads ? ads.filter((a) => a.status === 'SCHEDULED').length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ads ? ads.reduce((sum, a) => sum + a.clicks, 0) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="SCHEDULED">Agendado</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="PAUSED">Pausado</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por posição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as posições</SelectItem>
                {Object.entries(positionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAds}>
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Anúncios */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Analytics</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Nenhum anúncio encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAds.map((ad) => {
                    const StatusIcon =
                      statusConfig[ad.status as keyof typeof statusConfig].icon;
                    return (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <div className="font-medium">{ad.course.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {ad.teacher.name || ad.teacher.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {positionLabels[ad.slotPosition]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              statusConfig[
                                ad.status as keyof typeof statusConfig
                              ].color
                            } text-white`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {
                              statusConfig[
                                ad.status as keyof typeof statusConfig
                              ].label
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(ad.startDate)}</div>
                            <div className="text-muted-foreground">
                              {formatDate(ad.endDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ad.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>👁️ {ad.impressions}</div>
                            <div>👆 {ad.clicks}</div>
                            <div>✅ {ad.conversions}</div>
                            <div className="text-muted-foreground">
                              CTR: {calculateCTR(ad.clicks, ad.impressions)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(ad.price)}
                          </div>
                          <Badge
                            variant={ad.isPaid ? 'default' : 'destructive'}
                          >
                            {ad.isPaid ? 'Pago' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/advertisements/${ad.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {ad.status === 'ACTIVE' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(ad.id, 'PAUSED')
                                }
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {ad.status === 'PAUSED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(ad.id, 'ACTIVE')
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {ad.status !== 'CANCELLED' &&
                              ad.status !== 'COMPLETED' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancel(ad.id)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
