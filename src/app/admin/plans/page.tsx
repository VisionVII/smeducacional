'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, DollarSign, Percent, Grid3x3, Settings } from 'lucide-react';
import Link from 'next/link';

interface PlanConfig {
  freePlanCommission: number;
  basicPlanPrice: number;
  proPlanPrice: number;
  premiumPlanPrice: number;
  adSlotPrice: number;
  adSlotsAvailable: number;
}

export default function PlansConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<PlanConfig>({
    freePlanCommission: 0.15,
    basicPlanPrice: 9900,
    proPlanPrice: 19900,
    premiumPlanPrice: 39900,
    adSlotPrice: 19900,
    adSlotsAvailable: 6,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      if (!res.ok) throw new Error('Erro ao carregar configurações');
      const data = await res.json();
      setConfig(data);
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Erro ao salvar configurações');
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const handlePriceChange = (field: keyof PlanConfig, value: string) => {
    const numValue = parseFloat(value.replace(/[^\d]/g, '')) || 0;
    setConfig({ ...config, [field]: numValue });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Planos</h1>
          <p className="text-muted-foreground mt-2">
            Configure preços de planos, comissões e sistema de anúncios
          </p>
        </div>
        <Link href="/admin/plans/stripe">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Stripe & Pagamentos
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plano Free */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Plano Free
            </CardTitle>
            <CardDescription>
              Comissão aplicada sobre vendas de professores no plano gratuito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="freePlanCommission">
                Comissão sobre vendas (%)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="freePlanCommission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.freePlanCommission * 100}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      freePlanCommission: parseFloat(e.target.value) / 100,
                    })
                  }
                  className="max-w-[200px]"
                />
                <span className="text-sm text-muted-foreground">
                  Professor recebe{' '}
                  {((1 - config.freePlanCommission) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Exemplo: Curso de R$100 → Professor recebe{' '}
                {formatCurrency(10000 * (1 - config.freePlanCommission))}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Planos Pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Planos Pagos
            </CardTitle>
            <CardDescription>
              Mensalidades dos planos (professores pagam 0% de comissão)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Basic */}
              <div className="space-y-2">
                <Label htmlFor="basicPlanPrice">Plano Basic</Label>
                <Input
                  id="basicPlanPrice"
                  type="text"
                  value={formatCurrency(config.basicPlanPrice)}
                  onChange={(e) =>
                    handlePriceChange('basicPlanPrice', e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Professor recebe 100% das vendas
                </p>
              </div>

              {/* Pro */}
              <div className="space-y-2">
                <Label htmlFor="proPlanPrice">Plano Pro</Label>
                <Input
                  id="proPlanPrice"
                  type="text"
                  value={formatCurrency(config.proPlanPrice)}
                  onChange={(e) =>
                    handlePriceChange('proPlanPrice', e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  + ferramentas de analytics
                </p>
              </div>

              {/* Premium */}
              <div className="space-y-2">
                <Label htmlFor="premiumPlanPrice">Plano Premium</Label>
                <Input
                  id="premiumPlanPrice"
                  type="text"
                  value={formatCurrency(config.premiumPlanPrice)}
                  onChange={(e) =>
                    handlePriceChange('premiumPlanPrice', e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  + suporte prioritário
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Anúncios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3x3 className="w-5 h-5" />
              Sistema de Anúncios
            </CardTitle>
            <CardDescription>
              Configurações de slots de anúncios para cursos promovidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adSlotPrice">Preço por slot/mês</Label>
                <Input
                  id="adSlotPrice"
                  type="text"
                  value={formatCurrency(config.adSlotPrice)}
                  onChange={(e) =>
                    handlePriceChange('adSlotPrice', e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Valor cobrado por slot de anúncio por mês
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adSlotsAvailable">Slots disponíveis</Label>
                <Input
                  id="adSlotsAvailable"
                  type="number"
                  min="1"
                  max="20"
                  value={config.adSlotsAvailable}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      adSlotsAvailable: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Total de posições para anúncios
                </p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Posições de slots:</h4>
              <ul className="text-sm space-y-1">
                <li>• HERO_BANNER - Banner principal (topo da página)</li>
                <li>• SIDEBAR_TOP - Sidebar superior</li>
                <li>• SIDEBAR_MIDDLE - Sidebar meio</li>
                <li>• GRID_FEATURED_1/2/3 - Cards em destaque no grid</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
