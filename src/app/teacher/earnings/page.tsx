'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingAmount: number;
  availableAmount: number;
  totalSales: number;
  topCourses: Array<{
    title: string;
    revenue: number;
    sales: number;
  }>;
}

export default function TeacherEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const res = await fetch('/api/teacher/earnings');
        if (res.ok) {
          const data = await res.json();
          setEarnings(data);
        }
      } catch (error) {
        console.error('Erro ao buscar earnings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEarnings();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Erro ao carregar dados de ganhos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">💰 Meus Ganhos</h1>
        <p className="text-muted-foreground">
          Acompanhe seus ganhos com vendas de cursos
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ganhos Totais
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {earnings.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mês Atual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {earnings.monthlyEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {earnings.totalSales} vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Pendente
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {earnings.pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hold de 14 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponível
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {earnings.availableAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pronto para saque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Cursos */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Cursos Mais Vendidos</CardTitle>
          <CardDescription>Seus cursos com maior receita</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.topCourses.length > 0 ? (
            <div className="space-y-4">
              {earnings.topCourses?.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.sales} vendas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      R$ {course.revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      70% de comissão
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma venda ainda. Publique seus cursos para começar a ganhar!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info sobre comissões */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2 text-blue-900">
            ℹ️ Como funcionam os ganhos
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Você recebe <strong>70%</strong> do valor de cada venda
            </li>
            <li>• Hold de 14 dias para proteção contra chargebacks</li>
            <li>• Saques disponíveis após período de hold</li>
            <li>
              • Conecte sua conta bancária em{' '}
              <strong>Configurações Financeiras</strong>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
