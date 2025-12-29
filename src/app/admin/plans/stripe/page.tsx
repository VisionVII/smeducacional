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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  DollarSign,
  Globe,
  CreditCard,
  Settings,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CountryPrice {
  country: string;
  currency: string;
  basicPrice: number;
  proPrice: number;
  premiumPrice: number;
  adSlotPrice: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  countries: string[];
}

interface StripeConfig {
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  defaultCurrency: string;
  supportedCurrencies: string[];
  pricesByCountry: CountryPrice[];
  paymentMethods: Record<string, boolean>;
  taxConfiguration: Record<string, string | number | boolean>;
  stripeAccountId?: string;
  autoPayoutEnabled: boolean;
  payoutSchedule: string;
}

const CURRENCIES: Currency[] = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
  { code: 'CAD', symbol: 'C$', name: 'Dólar Canadense' },
  { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano' },
  { code: 'JPY', symbol: '¥', name: 'Iene Japonês' },
  { code: 'MXN', symbol: 'MX$', name: 'Peso Mexicano' },
  { code: 'ARS', symbol: 'AR$', name: 'Peso Argentino' },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Cartão de Crédito/Débito',
    enabled: true,
    countries: ['*'],
  },
  { id: 'pix', name: 'PIX', enabled: true, countries: ['BR'] },
  { id: 'boleto', name: 'Boleto Bancário', enabled: true, countries: ['BR'] },
  {
    id: 'sepa_debit',
    name: 'SEPA Direct Debit',
    enabled: false,
    countries: ['EU'],
  },
  { id: 'ideal', name: 'iDEAL', enabled: false, countries: ['NL'] },
  { id: 'bancontact', name: 'Bancontact', enabled: false, countries: ['BE'] },
  {
    id: 'alipay',
    name: 'Alipay',
    enabled: false,
    countries: ['CN', 'HK', 'MY', 'SG'],
  },
  {
    id: 'wechat_pay',
    name: 'WeChat Pay',
    enabled: false,
    countries: ['CN'],
  },
];

export default function StripeConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [config, setConfig] = useState<StripeConfig>({
    defaultCurrency: 'BRL',
    supportedCurrencies: ['BRL', 'USD', 'EUR'],
    pricesByCountry: [],
    paymentMethods: {
      card: true,
      pix: true,
      boleto: true,
    },
    taxConfiguration: {},
    autoPayoutEnabled: false,
    payoutSchedule: 'weekly',
  });

  const [newCountry, setNewCountry] = useState({
    country: '',
    currency: 'USD',
    basicPrice: 0,
    proPrice: 0,
    premiumPrice: 0,
    adSlotPrice: 0,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/stripe-config');
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

  const testStripeConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch('/api/admin/stripe-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publishableKey: config.stripePublishableKey,
          secretKey: config.stripeSecretKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast({
        title: 'Conexão bem-sucedida!',
        description: `Stripe conectado com sucesso. Conta: ${data.accountId}`,
      });
    } catch (error) {
      toast({
        title: 'Erro de conexão',
        description:
          error instanceof Error ? error.message : 'Erro ao testar conexão',
        variant: 'destructive',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/stripe-config', {
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
        description: 'Configurações Stripe atualizadas com sucesso',
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

  const addCountryPrice = () => {
    if (!newCountry.country || !newCountry.currency) {
      toast({
        title: 'Erro',
        description: 'Preencha país e moeda',
        variant: 'destructive',
      });
      return;
    }

    const exists = config.pricesByCountry.find(
      (p) => p.country === newCountry.country
    );
    if (exists) {
      toast({
        title: 'Erro',
        description: 'País já configurado',
        variant: 'destructive',
      });
      return;
    }

    setConfig({
      ...config,
      pricesByCountry: [...config.pricesByCountry, { ...newCountry }],
    });

    setNewCountry({
      country: '',
      currency: 'USD',
      basicPrice: 0,
      proPrice: 0,
      premiumPrice: 0,
      adSlotPrice: 0,
    });
  };

  const removeCountryPrice = (country: string) => {
    setConfig({
      ...config,
      pricesByCountry: config.pricesByCountry.filter(
        (p) => p.country !== country
      ),
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const togglePaymentMethod = (methodId: string) => {
    setConfig({
      ...config,
      paymentMethods: {
        ...config.paymentMethods,
        [methodId]: !config.paymentMethods[methodId],
      },
    });
  };

  const toggleCurrency = (currencyCode: string) => {
    const currencies = config.supportedCurrencies;
    if (currencies.includes(currencyCode)) {
      if (currencyCode === config.defaultCurrency) {
        toast({
          title: 'Erro',
          description: 'Não é possível remover a moeda padrão',
          variant: 'destructive',
        });
        return;
      }
      setConfig({
        ...config,
        supportedCurrencies: currencies.filter((c) => c !== currencyCode),
      });
    } else {
      setConfig({
        ...config,
        supportedCurrencies: [...currencies, currencyCode],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuração Stripe & Pagamentos</h1>
        <p className="text-muted-foreground mt-2">
          Configure integração Stripe, moedas, preços por país e métodos de
          pagamento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="credentials">
              <Settings className="w-4 h-4 mr-2" />
              Credenciais
            </TabsTrigger>
            <TabsTrigger value="currencies">
              <Globe className="w-4 h-4 mr-2" />
              Moedas
            </TabsTrigger>
            <TabsTrigger value="countries">
              <DollarSign className="w-4 h-4 mr-2" />
              Preços por País
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Métodos
            </TabsTrigger>
            <TabsTrigger value="payouts">
              <DollarSign className="w-4 h-4 mr-2" />
              Repasses
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Credenciais Stripe */}
          <TabsContent value="credentials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Credenciais Stripe</CardTitle>
                <CardDescription>
                  Configure suas chaves de API do Stripe. Encontre em:{' '}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Stripe Dashboard → Developers → API Keys
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripePublishableKey">
                    Publishable Key (pk_...)
                  </Label>
                  <Input
                    id="stripePublishableKey"
                    type="text"
                    placeholder="pk_live_... ou pk_test_..."
                    value={config.stripePublishableKey || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        stripePublishableKey: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Chave pública (pode ser exposta no client-side)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripeSecretKey">Secret Key (sk_...)</Label>
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    placeholder="sk_live_... ou sk_test_..."
                    value={config.stripeSecretKey || ''}
                    onChange={(e) =>
                      setConfig({ ...config, stripeSecretKey: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Chave secreta (NUNCA exponha publicamente)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripeWebhookSecret">
                    Webhook Secret (whsec_...)
                  </Label>
                  <Input
                    id="stripeWebhookSecret"
                    type="password"
                    placeholder="whsec_..."
                    value={config.stripeWebhookSecret || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        stripeWebhookSecret: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Secret para validar webhooks. Configure em: Developers →
                    Webhooks
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="stripeAccountId">
                    Stripe Connect Account ID (opcional)
                  </Label>
                  <Input
                    id="stripeAccountId"
                    type="text"
                    placeholder="acct_..."
                    value={config.stripeAccountId || ''}
                    onChange={(e) =>
                      setConfig({ ...config, stripeAccountId: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Para marketplaces com Stripe Connect (repasses automáticos)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testStripeConnection}
                    disabled={
                      testingConnection ||
                      !config.stripeSecretKey ||
                      !config.stripePublishableKey
                    }
                  >
                    {testingConnection && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Testar Conexão
                  </Button>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Ambiente de Teste vs Produção
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Use chaves <code>pk_test_</code> e <code>sk_test_</code>{' '}
                      para desenvolvimento. Em produção, use{' '}
                      <code>pk_live_</code> e <code>sk_live_</code>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Moedas */}
          <TabsContent value="currencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moedas Suportadas</CardTitle>
                <CardDescription>
                  Selecione as moedas que sua plataforma aceitará. Preços serão
                  convertidos automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Moeda Padrão</Label>
                  <Select
                    value={config.defaultCurrency}
                    onValueChange={(value) =>
                      setConfig({ ...config, defaultCurrency: value })
                    }
                  >
                    <SelectTrigger id="defaultCurrency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Moedas Habilitadas</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CURRENCIES.map((currency) => (
                      <div
                        key={currency.code}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{currency.symbol}</span>
                          <div>
                            <p className="font-medium">{currency.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {currency.code}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={config.supportedCurrencies.includes(
                            currency.code
                          )}
                          onCheckedChange={() => toggleCurrency(currency.code)}
                          disabled={currency.code === config.defaultCurrency}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Conversão automática:</strong> O Stripe converte
                    preços automaticamente usando taxas de câmbio em tempo real.
                    Configure preços específicos por país para maior controle.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Preços por País */}
          <TabsContent value="countries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preços Personalizados por País</CardTitle>
                <CardDescription>
                  Configure preços específicos para cada país/região,
                  considerando poder de compra local e impostos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adicionar novo país */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Adicionar País</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="newCountry">País (código ISO)</Label>
                      <Input
                        id="newCountry"
                        placeholder="BR, US, MX, AR..."
                        value={newCountry.country}
                        onChange={(e) =>
                          setNewCountry({
                            ...newCountry,
                            country: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newCurrency">Moeda</Label>
                      <Select
                        value={newCountry.currency}
                        onValueChange={(value) =>
                          setNewCountry({ ...newCountry, currency: value })
                        }
                      >
                        <SelectTrigger id="newCurrency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.supportedCurrencies.map((code) => {
                            const curr = CURRENCIES.find(
                              (c) => c.code === code
                            );
                            return (
                              <SelectItem key={code} value={code}>
                                {curr?.symbol} {code}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newBasicPrice">Plano Basic</Label>
                      <Input
                        id="newBasicPrice"
                        type="number"
                        placeholder="9900 (R$ 99,00)"
                        value={newCountry.basicPrice || ''}
                        onChange={(e) =>
                          setNewCountry({
                            ...newCountry,
                            basicPrice: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newProPrice">Plano Pro</Label>
                      <Input
                        id="newProPrice"
                        type="number"
                        placeholder="19900 (R$ 199,00)"
                        value={newCountry.proPrice || ''}
                        onChange={(e) =>
                          setNewCountry({
                            ...newCountry,
                            proPrice: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPremiumPrice">Plano Premium</Label>
                      <Input
                        id="newPremiumPrice"
                        type="number"
                        placeholder="39900 (R$ 399,00)"
                        value={newCountry.premiumPrice || ''}
                        onChange={(e) =>
                          setNewCountry({
                            ...newCountry,
                            premiumPrice: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newAdSlotPrice">Slot de Anúncio</Label>
                      <Input
                        id="newAdSlotPrice"
                        type="number"
                        placeholder="19900 (R$ 199,00)"
                        value={newCountry.adSlotPrice || ''}
                        onChange={(e) =>
                          setNewCountry({
                            ...newCountry,
                            adSlotPrice: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCountryPrice}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar País
                  </Button>
                </div>

                <Separator />

                {/* Lista de países configurados */}
                <div className="space-y-3">
                  <Label>Países Configurados</Label>
                  {config.pricesByCountry.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum país configurado. Adicione acima para definir
                      preços personalizados.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {config.pricesByCountry.map((countryPrice) => (
                        <div
                          key={countryPrice.country}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {countryPrice.country}
                                <Badge variant="outline">
                                  {countryPrice.currency}
                                </Badge>
                              </h4>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeCountryPrice(countryPrice.country)
                              }
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Basic</p>
                              <p className="font-medium">
                                {formatCurrency(
                                  countryPrice.basicPrice,
                                  countryPrice.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pro</p>
                              <p className="font-medium">
                                {formatCurrency(
                                  countryPrice.proPrice,
                                  countryPrice.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Premium</p>
                              <p className="font-medium">
                                {formatCurrency(
                                  countryPrice.premiumPrice,
                                  countryPrice.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Ad Slot</p>
                              <p className="font-medium">
                                {formatCurrency(
                                  countryPrice.adSlotPrice,
                                  countryPrice.currency
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Métodos de Pagamento */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>
                  Habilite métodos de pagamento suportados pelo Stripe em cada
                  região.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Disponível em:{' '}
                          {method.countries.includes('*')
                            ? 'Todos os países'
                            : method.countries.join(', ')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={!!config.paymentMethods[method.id]}
                      onCheckedChange={() => togglePaymentMethod(method.id)}
                    />
                  </div>
                ))}

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Importante:</strong> Alguns métodos de pagamento
                    exigem ativação no Stripe Dashboard e verificação de conta.
                    Verifique a documentação do Stripe para cada método.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: Repasses Automáticos */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Repasses Automáticos (Payouts)</CardTitle>
                <CardDescription>
                  Configure como e quando os professores receberão seus
                  pagamentos via Stripe Connect.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      Habilitar Repasses Automáticos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Transferir automaticamente para professores após vendas
                    </p>
                  </div>
                  <Switch
                    checked={config.autoPayoutEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, autoPayoutEnabled: checked })
                    }
                  />
                </div>

                {config.autoPayoutEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payoutSchedule">
                        Frequência de Repasse
                      </Label>
                      <Select
                        value={config.payoutSchedule}
                        onValueChange={(value) =>
                          setConfig({ ...config, payoutSchedule: value })
                        }
                      >
                        <SelectTrigger id="payoutSchedule">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">
                            Diário (todo dia útil)
                          </SelectItem>
                          <SelectItem value="weekly">
                            Semanal (toda segunda-feira)
                          </SelectItem>
                          <SelectItem value="biweekly">
                            Quinzenal (dias 1 e 15)
                          </SelectItem>
                          <SelectItem value="monthly">
                            Mensal (dia 1)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                      <p className="text-sm text-amber-900 dark:text-amber-200">
                        <strong>Stripe Connect:</strong> Repasses automáticos
                        exigem que professores conectem suas contas Stripe. A
                        plataforma retém a comissão antes de transferir.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>Informações do Repasse</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 border rounded-lg">
                          <p className="text-muted-foreground mb-1">
                            Período de Holding
                          </p>
                          <p className="font-semibold">7 dias</p>
                          <p className="text-xs text-muted-foreground">
                            Após conclusão da compra
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-muted-foreground mb-1">
                            Taxa Stripe Connect
                          </p>
                          <p className="font-semibold">0.25% + R$ 0,15</p>
                          <p className="text-xs text-muted-foreground">
                            Por transação
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-muted-foreground mb-1">
                            Tempo de Processamento
                          </p>
                          <p className="font-semibold">2-3 dias úteis</p>
                          <p className="text-xs text-muted-foreground">
                            Até cair na conta
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label>Como Funciona</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">1. Aluno compra curso</p>
                        <p className="text-muted-foreground">
                          Pagamento processado via Stripe
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">2. Período de holding</p>
                        <p className="text-muted-foreground">
                          7 dias para garantir qualidade
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">3. Cálculo de comissão</p>
                        <p className="text-muted-foreground">
                          Plataforma retém comissão configurada
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          4. Transferência automática
                        </p>
                        <p className="text-muted-foreground">
                          Valor líquido enviado para professor
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/plans')}
          >
            Voltar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configurações Stripe
          </Button>
        </div>
      </form>
    </div>
  );
}
