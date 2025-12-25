'use client';

import { useEffect, useState } from 'react';
import { CreditCard, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  type: string;
  paymentMethod: string;
  isTest: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export function RecentPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments/recent');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamentos Recentes
          </CardTitle>
          <CardDescription>Últimos pagamentos confirmados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-6 w-[80px]" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamentos Recentes
        </CardTitle>
        <CardDescription>
          {payments.length > 0
            ? `${payments.length} pagamentos confirmados`
            : 'Nenhum pagamento recente'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum pagamento confirmado ainda</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={payment.user.avatar || undefined} />
                <AvatarFallback>
                  {payment.user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">
                    {payment.user.name}
                  </p>
                  {payment.isTest && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    >
                      TESTE
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {payment.course?.title || 'Curso não especificado'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(payment.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {formatCurrency(payment.amount, payment.currency)}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Confirmado
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
