'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Report {
  id: string;
  type: string;
  generatedAt: string;
  generatedBy: string;
  status: 'pending' | 'completed' | 'failed';
  url?: string;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>('general');

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ['admin-reports', reportType],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports?type=${reportType}`);
      if (!res.ok) throw new Error('Erro ao carregar relatórios');
      return res.json();
    },
    staleTime: 15 * 60 * 1000,
  });

  const handleGenerateReport = async () => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType }),
      });
      if (!res.ok) throw new Error('Erro ao gerar relatório');
      // Revalidate query
      window.location.reload();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Relatórios</h1>
        </div>
        <p className="text-muted-foreground">
          Gere e acompanhe relatórios do sistema
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Sistema de relatórios em desenvolvimento. Em breve: relatórios em PDF,
          agendamento automático, e filtros avançados.
        </AlertDescription>
      </Alert>

      {/* Generate Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gerar Novo Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">
                Tipo de Relatório
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="access">Acessos</SelectItem>
                  <SelectItem value="certificates">Certificados</SelectItem>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="users">Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateReport} className="gap-2">
              <Download className="h-4 w-4" />
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relatórios Recentes</CardTitle>
          <CardDescription>Últimos 10 relatórios gerados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{report.type}</p>
                    <p className="text-sm text-muted-foreground">
                      Por {report.generatedBy} •{' '}
                      {new Date(report.generatedAt).toLocaleDateString('pt-BR')}{' '}
                      às{' '}
                      {new Date(report.generatedAt).toLocaleTimeString(
                        'pt-BR',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        report.status === 'completed'
                          ? 'secondary'
                          : report.status === 'failed'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {report.status === 'pending'
                        ? 'Aguardando'
                        : report.status === 'completed'
                        ? 'Concluído'
                        : 'Erro'}
                    </Badge>
                    {report.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        asChild
                      >
                        <a href={report.url} download>
                          <Download className="h-4 w-4" />
                          Baixar
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum relatório gerado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subpages Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tipos de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Geral</h4>
              <p className="text-sm text-muted-foreground">
                Visão geral do sistema: usuários, cursos, matrículas
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Acessos</h4>
              <p className="text-sm text-muted-foreground">
                Histórico de acessos de usuários na plataforma
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Certificados</h4>
              <p className="text-sm text-muted-foreground">
                Certificados emitidos e informações de conclusão
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
