'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, TestTube } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/admin/stat-card';

interface PaymentStats {
  totalRevenue: number;
  testRevenue: number;
  paymentsLast24h: number;
  paymentsLast7days: number;
  paymentsLast30days: number;
  testPayments: number;
}

export function PaymentStats() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/payments/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Receita Total"
        value={formatCurrency(stats.totalRevenue)}
        subtitle="Pagamentos confirmados (produção)"
        icon={DollarSign}
        trend={
          stats.paymentsLast30days > 0
            ? {
                value: `${stats.paymentsLast30days} últimos 30 dias`,
                positive: true,
              }
            : undefined
        }
      />

      <StatCard
        title="Últimas 24h"
        value={stats.paymentsLast24h.toString()}
        subtitle="Pagamentos confirmados hoje"
        icon={TrendingUp}
        trend={
          stats.paymentsLast7days > 0
            ? {
                value: `${stats.paymentsLast7days} últimos 7 dias`,
                positive: true,
              }
            : undefined
        }
      />

      <StatCard
        title="Pagamentos Teste"
        value={stats.testPayments.toString()}
        subtitle="Ambiente de desenvolvimento"
        icon={TestTube}
        className="bg-yellow-500/5 border-yellow-500/20"
      />

      <StatCard
        title="Receita de Teste"
        value={formatCurrency(stats.testRevenue)}
        subtitle="Não contabiliza na receita real"
        icon={CreditCard}
        className="bg-yellow-500/5 border-yellow-500/20"
      />
    </div>
  );
}
