# 💳 Configuração Stripe & Pagamentos Internacionais

## 🎯 Visão Geral

Sistema completo de configuração de pagamentos com suporte multi-país, multi-moeda e integração Stripe para vendas globais de cursos e planos de assinatura.

---

## 📍 Acesso

**Admin Dashboard** → **Configuração de Planos** → **Botão "Stripe & Pagamentos"**

**URL Direta**: `/admin/plans/stripe`

---

## 🔧 Funcionalidades Principais

### 1. **Credenciais Stripe**

Configure suas chaves de API do Stripe para processar pagamentos:

- **Publishable Key** (`pk_test_...` ou `pk_live_...`)
  - Chave pública usada no client-side
  - Segura para expor no frontend
- **Secret Key** (`sk_test_...` ou `sk_live_...`)
  - Chave secreta para API server-side
  - NUNCA exponha publicamente
- **Webhook Secret** (`whsec_...`)
  - Valida eventos do Stripe
  - Configure em: [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
- **Stripe Connect Account ID** (`acct_...`) - Opcional
  - Para marketplaces com repasses automáticos
  - Requer Stripe Connect habilitado

**🧪 Teste de Conexão**:

- Botão "Testar Conexão" valida credenciais em tempo real
- Retorna informações da conta (ID, país, moedas, status)

---

### 2. **Moedas Suportadas**

Configure quais moedas sua plataforma aceitará:

#### Moedas Disponíveis:

- 🇧🇷 **BRL** - Real Brasileiro (R$)
- 🇺🇸 **USD** - Dólar Americano ($)
- 🇪🇺 **EUR** - Euro (€)
- 🇬🇧 **GBP** - Libra Esterlina (£)
- 🇨🇦 **CAD** - Dólar Canadense (C$)
- 🇦🇺 **AUD** - Dólar Australiano (A$)
- 🇯🇵 **JPY** - Iene Japonês (¥)
- 🇲🇽 **MXN** - Peso Mexicano (MX$)
- 🇦🇷 **ARS** - Peso Argentino (AR$)

#### Configuração:

1. **Moeda Padrão**: Principal moeda da plataforma
2. **Moedas Habilitadas**: Toggle para cada moeda

**💡 Conversão Automática**:

- Stripe converte preços automaticamente usando taxas de câmbio em tempo real
- Configure preços específicos por país para maior controle (próxima seção)

---

### 3. **Preços por País**

Configure preços personalizados para cada país/região, considerando:

- Poder de compra local
- Impostos e taxas regionais
- Competitividade de mercado

#### Estrutura de Preços:

- **País**: Código ISO de 2 letras (BR, US, MX, AR...)
- **Moeda**: Moeda local do país
- **Plano Basic**: Preço mensal em centavos
- **Plano Pro**: Preço mensal em centavos
- **Plano Premium**: Preço mensal em centavos
- **Slot de Anúncio**: Preço mensal por slot

#### Exemplo de Configuração:

```json
{
  "country": "BR",
  "currency": "BRL",
  "basicPrice": 9900, // R$ 99,00
  "proPrice": 19900, // R$ 199,00
  "premiumPrice": 39900, // R$ 399,00
  "adSlotPrice": 19900 // R$ 199,00
}
```

```json
{
  "country": "US",
  "currency": "USD",
  "basicPrice": 1900, // $19,00
  "proPrice": 3900, // $39,00
  "premiumPrice": 7900, // $79,00
  "adSlotPrice": 3900 // $39,00
}
```

**🌎 Países Recomendados para Configurar**:

- 🇧🇷 BR (Brasil)
- 🇺🇸 US (Estados Unidos)
- 🇲🇽 MX (México)
- 🇦🇷 AR (Argentina)
- 🇨🇴 CO (Colômbia)
- 🇵🇹 PT (Portugal)
- 🇪🇸 ES (Espanha)

---

### 4. **Métodos de Pagamento**

Habilite métodos de pagamento por região:

#### Métodos Disponíveis:

| Método                       | Disponibilidade | Status          |
| ---------------------------- | --------------- | --------------- |
| **Cartão de Crédito/Débito** | Global          | ✅ Padrão       |
| **PIX**                      | Brasil 🇧🇷       | ✅ Ativo        |
| **Boleto Bancário**          | Brasil 🇧🇷       | ✅ Ativo        |
| **SEPA Direct Debit**        | Europa 🇪🇺       | ⚙️ Configurável |
| **iDEAL**                    | Holanda 🇳🇱      | ⚙️ Configurável |
| **Bancontact**               | Bélgica 🇧🇪      | ⚙️ Configurável |
| **Alipay**                   | China/Ásia 🇨🇳   | ⚙️ Configurável |
| **WeChat Pay**               | China 🇨🇳        | ⚙️ Configurável |

**⚠️ Importante**:

- Alguns métodos exigem ativação no Stripe Dashboard
- Verificação de conta pode ser necessária
- Consulte [Documentação Stripe de Payment Methods](https://stripe.com/docs/payments/payment-methods/overview)

---

### 5. **Repasses Automáticos (Stripe Connect)**

Configure como professores receberão pagamentos via Stripe Connect:

#### Configurações:

**✅ Habilitar Repasses Automáticos**

- ON: Transferências automáticas após vendas
- OFF: Repasses manuais (controle total)

**📅 Frequência de Repasse**:

- **Diário**: Todo dia útil
- **Semanal**: Toda segunda-feira
- **Quinzenal**: Dias 1 e 15 de cada mês
- **Mensal**: Dia 1 de cada mês

#### Fluxo de Repasse:

```
1. 🛒 Aluno compra curso
   └─ Pagamento processado via Stripe

2. ⏳ Período de holding (7 dias)
   └─ Garantia de qualidade, prevenção de fraudes

3. 💰 Cálculo de comissão
   └─ Plataforma retém comissão configurada
   └─ Professores em planos pagos: 0% comissão
   └─ Professores no plano Free: 15% comissão (configurável)

4. 🚀 Transferência automática
   └─ Valor líquido enviado para conta Stripe do professor
   └─ Taxa Stripe Connect: 0.25% + R$ 0,15 por transação

5. 🏦 Processamento bancário
   └─ 2-3 dias úteis até cair na conta
```

#### Taxas e Períodos:

| Item                       | Valor                     |
| -------------------------- | ------------------------- |
| **Período de Holding**     | 7 dias após compra        |
| **Taxa Stripe Connect**    | 0.25% + R$ 0,15/transação |
| **Tempo de Processamento** | 2-3 dias úteis            |
| **Taxa Stripe Padrão**     | 3.99% + R$ 0,39/transação |

#### Requisitos:

- Professores devem conectar conta Stripe (Stripe Connect)
- Verificação de identidade pode ser necessária
- Dados bancários válidos

---

## 🗄️ Estrutura do Banco de Dados

### Novos Campos no `SystemConfig`:

```prisma
model SystemConfig {
  // ... campos existentes ...

  // Credenciais Stripe
  stripePublishableKey String?
  stripeSecretKey      String?
  stripeWebhookSecret  String?

  // Configurações de Moedas
  defaultCurrency      String   @default("BRL")
  supportedCurrencies  Json?    @default("[\"BRL\",\"USD\",\"EUR\"]")

  // Preços por País
  pricesByCountry      Json?    // Array de objetos CountryPrice

  // Métodos de Pagamento
  paymentMethods       Json?    @default("{\"card\":true,\"pix\":true,\"boleto\":true}")

  // Configurações de Impostos
  taxConfiguration     Json?

  // Stripe Connect
  stripeAccountId      String?
  autoPayoutEnabled    Boolean  @default(false)
  payoutSchedule       String   @default("weekly")
}
```

---

## 🔌 API Endpoints

### `GET /api/admin/stripe-config`

Retorna configurações Stripe atuais.

**Resposta**:

```json
{
  "stripePublishableKey": "pk_test_...",
  "stripeSecretKey": "••••••••1234",
  "defaultCurrency": "BRL",
  "supportedCurrencies": ["BRL", "USD", "EUR"],
  "pricesByCountry": [...],
  "paymentMethods": {...},
  "autoPayoutEnabled": false,
  "payoutSchedule": "weekly"
}
```

### `PUT /api/admin/stripe-config`

Atualiza configurações Stripe.

**Body**:

```json
{
  "stripePublishableKey": "pk_test_...",
  "stripeSecretKey": "sk_test_...",
  "defaultCurrency": "BRL",
  "supportedCurrencies": ["BRL", "USD"],
  "pricesByCountry": [
    {
      "country": "BR",
      "currency": "BRL",
      "basicPrice": 9900,
      "proPrice": 19900,
      "premiumPrice": 39900,
      "adSlotPrice": 19900
    }
  ],
  "paymentMethods": {
    "card": true,
    "pix": true,
    "boleto": true
  },
  "autoPayoutEnabled": true,
  "payoutSchedule": "weekly"
}
```

### `POST /api/admin/stripe-config/test`

Testa conexão com Stripe.

**Body**:

```json
{
  "publishableKey": "pk_test_...",
  "secretKey": "sk_test_..."
}
```

**Resposta de Sucesso**:

```json
{
  "success": true,
  "accountId": "acct_123456",
  "environment": "test",
  "country": "BR",
  "defaultCurrency": "brl",
  "email": "admin@example.com",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "message": "Conexão Stripe bem-sucedida!"
}
```

---

## 🚀 Guia de Implementação

### Passo 1: Migrar Banco de Dados

```bash
# Gerar migration com novos campos
npm run db:migrate -- --name add_stripe_international_config

# Aplicar migration
npm run db:push
```

### Passo 2: Configurar Credenciais Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Developers → API Keys**
3. Copie suas chaves (use `test` para desenvolvimento)
4. Cole no sistema: `/admin/plans/stripe`
5. Clique em "Testar Conexão"

### Passo 3: Configurar Moedas

1. Defina moeda padrão (ex: BRL)
2. Habilite moedas adicionais (USD, EUR, etc)
3. Salve configurações

### Passo 4: Adicionar Preços por País

Para cada país-alvo:

1. Clique em "Adicionar País"
2. Preencha código do país (BR, US, MX...)
3. Selecione moeda local
4. Defina preços em centavos
5. Salve

### Passo 5: Configurar Métodos de Pagamento

1. Habilite métodos relevantes para cada região
2. Para PIX/Boleto: apenas Brasil
3. Para SEPA: Europa
4. Cartão: global

### Passo 6: Configurar Webhooks

1. Acesse [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em "Add endpoint"
3. URL: `https://seudominio.com/api/webhooks/stripe`
4. Selecione eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copie o **Webhook Secret** (`whsec_...`)
6. Cole no sistema

### Passo 7: Testar Pagamentos

**Ambiente de Teste**:

```
Cartão de teste: 4242 4242 4242 4242
CVV: qualquer 3 dígitos
Data: qualquer data futura
```

**Testes Recomendados**:

- ✅ Compra de curso (aluno)
- ✅ Assinatura de plano (professor)
- ✅ Slot de anúncio
- ✅ Diferentes moedas
- ✅ Diferentes métodos de pagamento

---

## 🛡️ Segurança

### Credenciais:

- ✅ Secret keys armazenadas com hash
- ✅ Máscaras ao exibir (••••••••1234)
- ✅ Nunca exponha no client-side
- ✅ Validação de ambiente (test vs live)

### Webhooks:

- ✅ Validação de signature obrigatória
- ✅ Verificar `stripeWebhookSecret`
- ✅ Rejeitar requests sem signature válida

### RBAC:

- ✅ Apenas ADMIN pode configurar
- ✅ Auth obrigatório em todas as rotas
- ✅ Validação Zod em todos os inputs

---

## 📊 Exemplo de Uso Real

### Caso: Plataforma Educacional Brasil + América Latina

**Países-Alvo**: 🇧🇷 Brasil, 🇲🇽 México, 🇦🇷 Argentina, 🇨🇴 Colômbia

**Configuração**:

```json
{
  "defaultCurrency": "BRL",
  "supportedCurrencies": ["BRL", "USD", "MXN", "ARS"],
  "pricesByCountry": [
    {
      "country": "BR",
      "currency": "BRL",
      "basicPrice": 9900,
      "proPrice": 19900,
      "premiumPrice": 39900
    },
    {
      "country": "MX",
      "currency": "MXN",
      "basicPrice": 35900, // ~360 pesos
      "proPrice": 71900, // ~720 pesos
      "premiumPrice": 143900 // ~1440 pesos
    },
    {
      "country": "AR",
      "currency": "ARS",
      "basicPrice": 990000, // ~9.900 pesos argentinos
      "proPrice": 1990000, // ~19.900 pesos
      "premiumPrice": 3990000 // ~39.900 pesos
    }
  ],
  "paymentMethods": {
    "card": true,
    "pix": true,
    "boleto": true
  }
}
```

---

## 🆘 Troubleshooting

### Erro: "Invalid API Key"

- ✅ Verifique formato (`pk_` e `sk_`)
- ✅ Confirme que são do mesmo ambiente
- ✅ Teste com "Testar Conexão"

### Erro: "Webhook signature verification failed"

- ✅ Verifique `stripeWebhookSecret`
- ✅ Confirme URL do webhook no Stripe
- ✅ Verifique logs do servidor

### Método de pagamento não aparece

- ✅ Verifique ativação no Stripe Dashboard
- ✅ Confirme país suportado
- ✅ Teste em modo test primeiro

### Repasse não processado

- ✅ Verifique período de holding (7 dias)
- ✅ Confirme que professor conectou Stripe
- ✅ Verifique status da conta no Stripe

---

## 📚 Referências

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Payment Methods](https://stripe.com/docs/payments/payment-methods)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)

---

## ✅ Checklist de Configuração

- [ ] Migrar banco de dados (`npm run db:migrate`)
- [ ] Adicionar credenciais Stripe
- [ ] Testar conexão Stripe
- [ ] Configurar moeda padrão
- [ ] Habilitar moedas adicionais
- [ ] Adicionar preços por país
- [ ] Configurar métodos de pagamento
- [ ] Configurar webhook no Stripe
- [ ] Adicionar webhook secret
- [ ] Testar pagamento em ambiente test
- [ ] Configurar Stripe Connect (se marketplace)
- [ ] Definir frequência de repasse
- [ ] Testar repasse automático
- [ ] Validar impostos por região
- [ ] Documentar para equipe
- [ ] Mover para produção (`pk_live_`, `sk_live_`)

---

**Desenvolvido com excelência pela VisionVII** — Soluções que impactam positivamente através da tecnologia.
