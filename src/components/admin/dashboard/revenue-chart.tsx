'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RevenueChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const res = await fetch('/api/admin/charts/revenue');
      if (!res.ok) throw new Error('Erro ao carregar dados');
      return res.json();
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita (Últimos 7 Dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Receita (Últimos 7 Dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tickFormatter={(value) =>
                format(new Date(value), 'dd/MM', { locale: ptBR })
              }
            />
            <YAxis className="text-xs" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium">
                        {format(
                          new Date(payload[0].payload.date),
                          "dd 'de' MMMM",
                          { locale: ptBR }
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        R${' '}
                        {Number(payload[0].value).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
