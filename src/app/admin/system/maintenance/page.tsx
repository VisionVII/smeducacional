'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

/**
 * /admin/system/maintenance
 * Painel de controle de modo de manutenção para admins
 * Ativa/desativa e gerencia tempo estimado de retorno
 */

interface SystemStatus {
  id: string;
  maintenanceMode: boolean;
  estimatedReturnTime: string;
  maintenanceMessage: string;
  activatedBy: string;
  updatedAt: string;
}

export default function MaintenanceControlPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [returnTime, setReturnTime] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (session && session.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, router]);

  // Load current status
  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch('/api/admin/system-maintenance');
      if (!res.ok) throw new Error('Failed to fetch status');

      const data = await res.json();
      setStatus(data);
      setMaintenanceMode(data.maintenanceMode);
      setMessage(data.maintenanceMessage);

      if (data.estimatedReturnTime) {
        const date = new Date(data.estimatedReturnTime);
        setReturnTime(date.toISOString().slice(0, 16)); // Format para input datetime-local
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/system-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode,
          estimatedReturnTime: new Date(returnTime).toISOString(),
          maintenanceMessage: message,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update status');
      }

      const data = await res.json();
      setStatus(data.data);
      setSuccess(
        maintenanceMode
          ? '✅ Modo de manutenção ativado'
          : '✅ Sistema voltou ao normal'
      );

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Controle de Manutenção do Sistema
        </h1>
        <p className="text-slate-600">
          Gerencie o modo de manutenção da plataforma
        </p>
      </div>

      {/* Status atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>Estado atual da manutenção</CardDescription>
            </div>
            <Badge
              className={
                maintenanceMode
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }
            >
              {maintenanceMode ? '🔧 EM MANUTENÇÃO' : '✅ OPERACIONAL'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-slate-600">Última atualização</p>
            <p className="text-sm font-medium">
              {status?.updatedAt
                ? new Date(status.updatedAt).toLocaleString('pt-BR')
                : 'Nunca'}
            </p>
          </div>
          {maintenanceMode && status?.estimatedReturnTime && (
            <div>
              <p className="text-sm text-slate-600">Retorno estimado</p>
              <p className="text-sm font-medium">
                {new Date(status.estimatedReturnTime).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Manutenção</CardTitle>
          <CardDescription>
            Ativa ou desativa o modo de manutenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Maintenance mode toggle */}
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                  disabled={saving}
                />
                <span className="font-medium">Ativar modo de manutenção</span>
              </label>
              <p className="text-sm text-slate-600 ml-7">
                Se ativado, usuários verão a página de manutenção
              </p>
            </div>

            {/* Return time (só se manutenção ativa) */}
            {maintenanceMode && (
              <div className="space-y-2">
                <label
                  htmlFor="returnTime"
                  className="block text-sm font-medium"
                >
                  Retorno estimado
                </label>
                <input
                  id="returnTime"
                  type="datetime-local"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  required={maintenanceMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  disabled={saving}
                />
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium">
                Mensagem para usuários
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explique brevemente por que o sistema está em manutenção"
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                disabled={saving}
              />
              <p className="text-xs text-slate-500">{message.length}/500</p>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={saving || !returnTime}
              className="w-full"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {maintenanceMode ? 'Ativar Manutenção' : 'Desativar Manutenção'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info card */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Webhooks (Stripe, Supabase) continuam
          funcionando durante a manutenção. Health checks também são permitidos.
        </AlertDescription>
      </Alert>
    </div>
  );
}
