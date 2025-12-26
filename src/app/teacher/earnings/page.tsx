'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CreditCard,
  Trophy,
  Wallet,
  Settings,
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface EarningsData {
  plan: string;
  commissionRate: number;
  grossEarnings: number;
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
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    courseTitle: string;
    date: string;
  }>;
  connectStatus: {
    isActive: boolean;
    accountId: string | null;
    totalTransfers: number;
    totalEarningsOnFile: number;
    pendingBalance: number;
  };
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
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
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

  const commissionPercent = Math.round((earnings.commissionRate || 0) * 100);
  const isFreePlan = earnings.plan?.toLowerCase() === 'free';

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ganhos e Receita</h1>
        <p className="text-muted-foreground">
          Gerencie seus ganhos, transações e configurações financeiras
        </p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Geral */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ganhos Totais
              </CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {(earnings.totalEarnings / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {earnings.totalSales} transações · valores líquidos (
              {Math.round(earnings.commissionRate * 100)}% de taxa no plano
              atual)
            </p>
          </CardContent>
        </Card>

        {/* Mês Atual */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Este Mês
              </CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {(earnings.monthlyEarnings / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        {/* Pendente */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendente
              </CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              R$ {(earnings.pendingAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Hold de 14 dias
            </p>
          </CardContent>
        </Card>

        {/* Disponível */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponível
              </CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              R$ {(earnings.availableAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pronto para saque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plano e política de comissão */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Plano do professor</CardTitle>
            <CardDescription>
              Modelo de receitas: aluno paga o curso ao professor; a plataforma
              retém a taxa do plano.
            </CardDescription>
          </div>
          <Badge
            variant={isFreePlan ? 'secondary' : 'default'}
            className={isFreePlan ? '' : 'bg-green-600'}
          >
            {isFreePlan
              ? 'Free (15% por venda)'
              : `${earnings.plan} (0% por venda)`}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/60">
            <p className="text-xs text-muted-foreground mb-1">Repasse</p>
            <p className="text-lg font-semibold text-foreground">
              {100 - commissionPercent}% por venda
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa da plataforma: {commissionPercent}% (
              {isFreePlan ? 'apenas no plano Free' : 'isenta em planos pagos'})
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/60">
            <p className="text-xs text-muted-foreground mb-1">Mensalidade</p>
            <p className="text-lg font-semibold text-foreground">
              {isFreePlan ? 'R$ 0/mês' : 'Cobrança ao instrutor'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Plano pago remove comissão por venda (configurado pelo admin)
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/60">
            <p className="text-xs text-muted-foreground mb-1">Visão geral</p>
            <p className="text-lg font-semibold text-foreground">
              R$ {(earnings.grossEarnings / 100).toFixed(2)} bruto
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Líquido recebido: R$ {(earnings.totalEarnings / 100).toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Stripe Connect */}
      {!earnings.connectStatus.isActive && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <CardTitle className="text-base">
                    Ativar Stripe Connect
                  </CardTitle>
                  <CardDescription>
                    Conecte sua conta bancária para receber seus ganhos
                  </CardDescription>
                </div>
              </div>
              <Button asChild>
                <Link href="/teacher/profile?tab=financial">Ativar Agora</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {earnings.connectStatus.isActive && (
        <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle className="text-base">
                  Stripe Connect Ativo
                </CardTitle>
                <CardDescription>
                  Saldo total registrado: R${' '}
                  {(earnings.connectStatus.totalEarningsOnFile / 100).toFixed(
                    2
                  )}{' '}
                  | Transferências: R${' '}
                  {(earnings.connectStatus.totalTransfers / 100).toFixed(2)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Grid - Top Cursos + Transações */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Cursos */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Cursos Mais Vendidos</CardTitle>
                <CardDescription>Top 5 por receita</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {earnings.topCourses.length > 0 ? (
              <>
                {earnings.topCourses.map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-1">
                          {index + 1}. {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.sales} venda{course.sales !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          R$ {(course.revenue / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
                        style={{
                          width: `${Math.max(
                            5,
                            Math.round(
                              (course.revenue /
                                Math.max(
                                  ...earnings.topCourses.map((c) => c.revenue),
                                  1
                                )) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  Nenhuma venda ainda. Publique seus cursos para começar a
                  ganhar!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>Visão geral de ganhos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">
                  Total de Vendas
                </p>
                <p className="text-2xl font-bold">{earnings.totalSales}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">
                  Cursos Vendidos
                </p>
                <p className="text-2xl font-bold">
                  {earnings.topCourses.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-xs text-muted-foreground mb-1">
                  Ticket Médio
                </p>
                <p className="text-2xl font-bold text-green-600">
                  R${' '}
                  {(
                    earnings.totalEarnings /
                    Math.max(earnings.totalSales, 1) /
                    100
                  ).toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs text-muted-foreground mb-1">
                  Taxa de Conversão
                </p>
                <p className="text-2xl font-bold text-blue-600">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      {earnings.recentTransactions.length > 0 && (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>
                  Últimas {earnings.recentTransactions.length} transações ·
                  valores líquidos ({commissionPercent}% de taxa no plano
                  aplicável)
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="#more-transactions">Ver Todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Descrição
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Tipo
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.recentTransactions.slice(0, 10).map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs">
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                          {tx.courseTitle}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            tx.type === 'course'
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200'
                              : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200'
                          }
                        >
                          {tx.type === 'course' ? 'Curso' : 'Plano'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        +R$ {(tx.amount / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações e Ações */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-lg">
                Como funcionam os ganhos
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">Repasse:</strong> Aluno
                    paga o curso ao professor; plano Free repassa 85% (15% de
                    taxa), planos pagos repassam 100%
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">
                      Hold de 14 dias:
                    </strong>{' '}
                    Proteção contra chargebacks
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">Mensalidade:</strong>{' '}
                    Planos pagos cobram mensalidade do professor e removem a
                    taxa por venda
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">Saques:</strong> Após o
                    hold, transfira para sua conta via Stripe Connect
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 text-lg">Próximas Ações</h3>
                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/teacher/profile">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações Financeiras
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/teacher/courses">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Criar Novo Curso
                    </Link>
                  </Button>
                  <Button className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Solicitar Saque
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
