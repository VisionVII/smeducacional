'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Download, Search } from 'lucide-react';

type PaymentStats = {
  totalRevenue: number;
  testRevenue: number;
  paymentsLast24h: number;
  paymentsLast7days: number;
  paymentsLast30days: number;
  testPayments: number;
};

type PaymentRecord = {
  id: string;
  amount: number;
  currency: string;
  type: string;
  paymentMethod: string;
  status: string;
  isTest: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
  course: {
    id: string;
    title: string | null;
    slug: string | null;
  } | null;
};

export default function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: statsData, isLoading: isStatsLoading } = useQuery<PaymentStats>(
    {
      queryKey: ['admin-payments-stats'],
      queryFn: async () => {
        const res = await fetch('/api/admin/payments/stats');
        if (!res.ok) throw new Error('Erro ao carregar estatísticas');
        const json = await res.json();
        return json.data as PaymentStats;
      },
    }
  );

  const { data: payments, isLoading: isPaymentsLoading } = useQuery<
    PaymentRecord[]
  >({
    queryKey: ['admin-payments-recent'],
    queryFn: async () => {
      const res = await fetch('/api/admin/payments/recent');
      if (!res.ok) throw new Error('Erro ao carregar pagamentos');
      const json = await res.json();
      return json.data as PaymentRecord[];
    },
  });

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      succeeded: 'default',
      pending: 'secondary',
      processing: 'secondary',
      failed: 'destructive',
      canceled: 'destructive',
    };
    return variants[normalized] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const normalized = status.toLowerCase();
    const labels: Record<string, string> = {
      completed: 'Concluído',
      succeeded: 'Concluído',
      pending: 'Pendente',
      processing: 'Processando',
      failed: 'Falhou',
      canceled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return labels[normalized] || status;
  };

  const getTypeLabel = (type: string) => {
    const normalized = type?.toLowerCase();
    const labels: Record<string, string> = {
      course: 'Curso',
      course_purchase: 'Compra de Curso',
      subscription: 'Assinatura',
      feature: 'Feature',
    };
    return labels[normalized] || type;
  };

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency || 'BRL',
        minimumFractionDigits: 2,
      }).format(amount || 0);
    } catch (e) {
      return `R$ ${amount?.toFixed(2) ?? '0,00'}`;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredPayments = useMemo(() => {
    if (!payments) return [];

    return payments.filter((tx) => {
      const normalizedStatus = tx.status.toLowerCase();
      const matchesStatus =
        filterStatus === 'all' || normalizedStatus === filterStatus;

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        tx.id.toLowerCase().includes(search) ||
        tx.user?.name?.toLowerCase().includes(search) ||
        tx.user?.email?.toLowerCase().includes(search) ||
        tx.course?.title?.toLowerCase().includes(search) ||
        tx.paymentMethod?.toLowerCase().includes(search);

      return matchesStatus && (search ? matchesSearch : true);
    });
  }, [payments, filterStatus, searchTerm]);

  const statsCards = [
    {
      label: 'Receita total (produção)',
      value: formatCurrency(statsData?.totalRevenue ?? 0, 'BRL'),
      helper: 'Pagamentos confirmados, exclui testes',
    },
    {
      label: 'Receita de teste',
      value: formatCurrency(statsData?.testRevenue ?? 0, 'BRL'),
      helper: `${statsData?.testPayments ?? 0} pagamentos`,
    },
    {
      label: 'Pagamentos (7 dias)',
      value: statsData?.paymentsLast7days ?? 0,
      helper: `${statsData?.paymentsLast24h ?? 0} nas últimas 24h`,
    },
    {
      label: 'Pagamentos (30 dias)',
      value: statsData?.paymentsLast30days ?? 0,
      helper: 'Volume confirmado (30d)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isStatsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))
          : statsCards.map((stat, i) => (
              <Card
                key={i}
                className="border border-slate-200/80 dark:border-slate-800"
              >
                <CardHeader className="p-4 pb-3 space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <CardTitle className="text-2xl font-semibold">
                    {stat.value}
                  </CardTitle>
                  <CardDescription>{stat.helper}</CardDescription>
                </CardHeader>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Transações recentes</CardTitle>
          <CardDescription>
            Pagamentos confirmados (últimas operações)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por ID, usuário, curso ou método"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="failed">Falhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPaymentsLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!isPaymentsLoading && filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400">
                        <AlertCircle className="h-6 w-6" />
                        <span>Nenhuma transação encontrada</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isPaymentsLoading &&
                  filteredPayments.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {tx.id}
                      </TableCell>
                      <TableCell className="space-y-1">
                        <div className="font-medium">
                          {tx.user?.name ?? 'Usuário sem nome'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {tx.user?.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {tx.course?.title ?? '—'}
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        {getTypeLabel(tx.type)}
                        {tx.isTest && (
                          <Badge className="ml-2" variant="secondary">
                            Teste
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(tx.amount, tx.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {tx.paymentMethod || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(tx.status)}>
                          {getStatusLabel(tx.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
