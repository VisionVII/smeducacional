'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function UserGrowthChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-growth-chart'],
    queryFn: async () => {
      const res = await fetch('/api/admin/charts/user-growth');
      if (!res.ok) throw new Error('Erro ao carregar dados');
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Usuários</CardTitle>
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
          <Users className="h-5 w-5" />
          Crescimento de Usuários (Últimos 7 Dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data || []}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
                        {payload[0].value} novos usuários
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
