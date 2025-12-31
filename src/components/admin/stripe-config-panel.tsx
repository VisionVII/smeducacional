'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { StripeConnectionStatus } from '@/lib/services/stripe-config.service';

interface FormData {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

interface StripeConfigPanelProps {
  initialStatuses?: StripeConnectionStatus[];
}

export function StripeConfigPanel({
  initialStatuses = [],
}: StripeConfigPanelProps) {
  const [statuses, setStatuses] =
    useState<StripeConnectionStatus[]>(initialStatuses);
  const [loading, setLoading] = useState(false);
  const [validateLoading, setValidateLoading] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Estados para formulário
  const [testFormData, setTestFormData] = useState<FormData>({
    secretKey: '',
    publishableKey: '',
    webhookSecret: '',
  });

  const [prodFormData, setProdFormData] = useState<FormData>({
    secretKey: '',
    publishableKey: '',
    webhookSecret: '',
  });

  const [showKeys, setShowKeys] = useState({
    test: false,
    production: false,
  });

  // Buscar status das configurações
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stripe/config');
      const data = await res.json();
      if (data.success) {
        setStatuses(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validar chaves sem salvar
  const handleValidate = async (environment: 'test' | 'production') => {
    setValidateLoading(environment);
    const formData = environment === 'test' ? testFormData : prodFormData;

    try {
      const res = await fetch('/api/admin/stripe/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          environment,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setStatuses((prev) =>
          prev.map((s) => (s.environment === environment ? data.status : s))
        );
      }
    } catch (error) {
      console.error('Erro ao validar:', error);
    } finally {
      setValidateLoading(null);
    }
  };

  // Salvar configuração
  const handleSave = async (environment: 'test' | 'production') => {
    setSaveLoading(environment);
    const formData = environment === 'test' ? testFormData : prodFormData;

    try {
      const res = await fetch('/api/admin/stripe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          environment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatuses((prev) =>
          prev.map((s) => (s.environment === environment ? data.status : s))
        );
        // Limpar formulário após salvar
        if (environment === 'test') {
          setTestFormData({
            secretKey: '',
            publishableKey: '',
            webhookSecret: '',
          });
        } else {
          setProdFormData({
            secretKey: '',
            publishableKey: '',
            webhookSecret: '',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaveLoading(null);
    }
  };

  // Copiar para clipboard
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status: StripeConnectionStatus) => {
    if (!status.connected) return 'destructive';
    if (status.chargesEnabled && status.payoutsEnabled) return 'default';
    return 'secondary';
  };

  const getStatusIcon = (status: StripeConnectionStatus) => {
    if (!status.connected)
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (status.chargesEnabled && status.payoutsEnabled)
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const renderEnvironmentConfig = (
    environment: 'test' | 'production',
    formData: FormData,
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void
  ) => {
    const status = statuses.find((s) => s.environment === environment);
    const isValidating = validateLoading === environment;
    const isSaving = saveLoading === environment;
    const isLoading = isValidating || isSaving || loading;

    return (
      <Card key={environment} className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {environment === 'test'
                  ? '🧪 Ambiente de Teste'
                  : '🚀 Ambiente de Produção'}
                {status && getStatusIcon(status)}
              </CardTitle>
              <CardDescription>
                Configure suas chaves Stripe para{' '}
                {environment === 'test' ? 'testes' : 'produção'}
              </CardDescription>
            </div>
            <Badge variant={status ? getStatusColor(status) : 'secondary'}>
              {status?.connected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status da conexão */}
          {status && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conta:</span>
                <span className="text-sm text-muted-foreground">
                  {status.businessName || 'Não configurada'}
                </span>
              </div>
              {status.connected && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cobranças:</span>
                    <Badge
                      variant={status.chargesEnabled ? 'default' : 'secondary'}
                    >
                      {status.chargesEnabled ? '✓ Ativada' : '✗ Desativada'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pagamentos:</span>
                    <Badge
                      variant={status.payoutsEnabled ? 'default' : 'secondary'}
                    >
                      {status.payoutsEnabled ? '✓ Ativada' : '✗ Desativada'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Moeda:</span>
                    <span className="text-sm text-muted-foreground">
                      {status.defaultCurrency?.toUpperCase() || 'USD'}
                    </span>
                  </div>
                </>
              )}
              {status.errorMessage && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {status.errorMessage}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Última verificação:
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(status.lastChecked).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          {/* Formulário de configuração */}
          <div className="space-y-3">
            {/* Secret Key */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-1">
                Secret Key
                <button
                  type="button"
                  onClick={() =>
                    setShowKeys((prev) => ({
                      ...prev,
                      [environment]: !prev[environment],
                    }))
                  }
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {showKeys[environment] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </label>
              <div className="flex gap-2">
                <Input
                  type={showKeys[environment] ? 'text' : 'password'}
                  placeholder="sk_test_... ou sk_live_..."
                  value={formData.secretKey}
                  onChange={(e) =>
                    setFormData((prev: FormData) => ({
                      ...prev,
                      secretKey: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(formData.secretKey, `secret-${environment}`)
                  }
                  disabled={!formData.secretKey}
                >
                  {copiedField === `secret-${environment}` ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Publishable Key */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Publishable Key
              </label>
              <div className="flex gap-2">
                <Input
                  type={showKeys[environment] ? 'text' : 'password'}
                  placeholder="pk_test_... ou pk_live_..."
                  value={formData.publishableKey}
                  onChange={(e) =>
                    setFormData((prev: FormData) => ({
                      ...prev,
                      publishableKey: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      formData.publishableKey,
                      `publishable-${environment}`
                    )
                  }
                  disabled={!formData.publishableKey}
                >
                  {copiedField === `publishable-${environment}` ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Webhook Secret */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Webhook Secret
              </label>
              <div className="flex gap-2">
                <Input
                  type={showKeys[environment] ? 'text' : 'password'}
                  placeholder="whsec_..."
                  value={formData.webhookSecret}
                  onChange={(e) =>
                    setFormData((prev: FormData) => ({
                      ...prev,
                      webhookSecret: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(formData.webhookSecret, `webhook-${environment}`)
                  }
                  disabled={!formData.webhookSecret}
                >
                  {copiedField === `webhook-${environment}` ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleValidate(environment)}
              disabled={
                !formData.secretKey ||
                !formData.publishableKey ||
                !formData.webhookSecret ||
                isLoading
              }
              className="flex-1"
            >
              {isValidating && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Validar
            </Button>
            <Button
              onClick={() => handleSave(environment)}
              disabled={
                !formData.secretKey ||
                !formData.publishableKey ||
                !formData.webhookSecret ||
                isLoading
              }
              className="flex-1"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Configuração
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatuses}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Atualizar Status
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuração Stripe</h1>
        <p className="text-muted-foreground mt-1">
          Gerenciar chaves e conexões com Stripe para ambientes de teste e
          produção
        </p>
      </div>

      {/* Cards de ambientes */}
      <div className="grid gap-6 md:grid-cols-2">
        {renderEnvironmentConfig('test', testFormData, setTestFormData)}
        {renderEnvironmentConfig('production', prodFormData, setProdFormData)}
      </div>

      {/* Informações de segurança */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5" />
            Informações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-800 dark:text-yellow-300 space-y-2">
          <p>
            🔐 <strong>Nunca</strong> compartilhe suas chaves Stripe com ninguém
          </p>
          <p>🔒 Todas as alterações são registradas em logs de auditoria</p>
          <p>⚠️ Alterações em produção afetam seu negócio imediatamente</p>
          <p>📋 Mantenha backups seguros de suas chaves Stripe</p>
        </CardContent>
      </Card>
    </div>
  );
}
