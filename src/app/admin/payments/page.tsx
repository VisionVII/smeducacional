'use client';

import { useState } from 'react';
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
import { Search, Download, Filter } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - será substituído por API real
  const transactions = [
    {
      id: 'TRX001',
      user: 'João Silva',
      amount: 99.0,
      status: 'completed',
      type: 'subscription',
      date: '2025-12-31',
      method: 'Credit Card',
    },
    {
      id: 'TRX002',
      user: 'Maria Santos',
      amount: 199.0,
      status: 'completed',
      type: 'course_purchase',
      date: '2025-12-31',
      method: 'Credit Card',
    },
    {
      id: 'TRX003',
      user: 'Carlos Oliveira',
      amount: 49.9,
      status: 'pending',
      type: 'course_purchase',
      date: '2025-12-30',
      method: 'Boleto',
    },
  ];

  const stats = [
    {
      label: 'Total Recebido (Mês)',
      value: 'R$ 15.420,50',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Transações Pendentes',
      value: '3',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Taxa Média',
      value: '2.99%',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Clientes Ativos',
      value: '128',
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Concluído',
      pending: 'Pendente',
      failed: 'Falhou',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Gerencie todos os pagamentos e transações do sistema
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>Últimas transações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por usuário, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {tx.id}
                      </TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell className="capitalize">
                        {tx.type.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{tx.method}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(tx.status)}>
                          {getStatusLabel(tx.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {tx.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
