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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import type { AuditAction } from '@/lib/audit.service';

interface AuditLogRow {
  id: string;
  userId: string;
  action: AuditAction;
  targetId: string | null;
  targetType: string | null;
  createdAt: string;
  metadata?: unknown;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface AuditResponse {
  data: AuditLogRow[];
  total: number;
}

interface FailureRow {
  id: string;
  emailAddress: string;
  emailType: string;
  status: string;
  error?: string | null;
  sentAt: string;
}

const actionOptions: { label: string; value: AuditAction }[] = [
  {
    label: 'Payment Webhook',
    value: 'PAYMENT_WEBHOOK_PROCESSED' as AuditAction,
  },
  { label: 'Payment Created', value: 'PAYMENT_CREATED' as AuditAction },
  {
    label: 'Subscription Cancelled',
    value: 'SUBSCRIPTION_CANCELLED' as AuditAction,
  },
  { label: 'Content Access', value: 'CONTENT_ACCESS' as AuditAction },
  { label: 'Course Created', value: 'COURSE_CREATED' as AuditAction },
  { label: 'Course Updated', value: 'COURSE_UPDATED' as AuditAction },
];

function buildAuditUrl(filters: {
  action?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();
  if (filters.action) params.set('action', filters.action);
  if (filters.userId) params.set('userId', filters.userId.trim());
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  return `/api/admin/audit?${params.toString()}`;
}

export default function AuditPage() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState('');

  const auditQuery = useQuery<AuditResponse>({
    queryKey: ['admin-audit', actionFilter, userFilter],
    queryFn: async () => {
      const url = buildAuditUrl({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        userId: userFilter || undefined,
      });
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar auditoria');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const failureQuery = useQuery<{ failures: FailureRow[] }>({
    queryKey: ['admin-notification-failures'],
    queryFn: async () => {
      const res = await fetch(
        '/api/admin/notifications/failures?hours=24&limit=10',
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Falha ao carregar falhas de notificação');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const hasFailures = (failureQuery.data?.failures?.length || 0) > 0;

  const rows = useMemo(() => auditQuery.data?.data || [], [auditQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Auditoria</CardTitle>
              <CardDescription>
                Logs de ações críticas do sistema
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Filtrar por ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {actionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Filtrar por usuário (ID)"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionFilter('all');
                    setUserFilter('');
                  }}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {auditQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ação</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Recurso</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Metadata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="secondary">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {log.user?.name || 'N/A'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {log.user?.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {log.targetType || '—'}{' '}
                            {log.targetId ? `(${log.targetId})` : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(log.createdAt).toLocaleString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <pre className="text-xs whitespace-pre-wrap text-muted-foreground max-w-xs">
                            {JSON.stringify(log.metadata ?? {}, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!rows.length && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Falhas críticas de e-mail (últimas 24h)</CardTitle>
            <CardDescription>
              Welcome e Reset que não foram entregues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {failureQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : hasFailures ? (
              <div className="space-y-3">
                {failureQuery.data?.failures.map((fail) => (
                  <Alert
                    key={fail.id}
                    variant="destructive"
                    className="flex items-start gap-3"
                  >
                    <AlertTriangle className="h-4 w-4 mt-1" />
                    <div>
                      <AlertTitle>{fail.emailType}</AlertTitle>
                      <AlertDescription>
                        <div className="text-sm text-muted-foreground">
                          {fail.emailAddress}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(fail.sentAt).toLocaleString('pt-BR')} •
                          status: {fail.status}
                        </div>
                        {fail.error ? (
                          <div className="text-xs text-muted-foreground">
                            Erro: {fail.error}
                          </div>
                        ) : null}
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert variant="default" className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 mt-1" />
                <div>
                  <AlertTitle>Nenhuma falha crítica</AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground">
                    Últimas 24h limpas. Seguimos monitorando.
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
