# Variáveis de Ambiente — VisionVII Enterprise

Este arquivo documenta todas as variáveis de ambiente necessárias para o funcionamento completo do sistema SM Educacional, incluindo checkout multi-provider, payouts e subscriptions.

---

## 🔐 Obrigatórias (Produção)

### Database

```env
DATABASE_URL="postgresql://..."          # Connection pooler (pgbouncer)
DIRECT_URL="postgresql://..."            # Conexão direta (migrations)
```

### NextAuth

```env
NEXTAUTH_SECRET="..."                    # JWT signing key (CRÍTICO)
NEXTAUTH_URL="https://seu-app.com"      # URL pública do app
```

### Stripe (Pagamentos)

```env
STRIPE_SECRET_KEY="sk_live_..."          # Stripe API key
STRIPE_WEBHOOK_SECRET="whsec_..."        # Webhook validation
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Client-side key
```

### Supabase Storage

```env
NEXT_PUBLIC_SUPABASE_URL="https://..."   # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."      # Anon key (client-side)
SUPABASE_SERVICE_ROLE_KEY="..."          # Admin key (server-side)
```

### Email (Resend)

```env
RESEND_API_KEY="re_..."                  # Email transacional
```

---

## 🌐 Públicas (Client-side)

```env
NEXT_PUBLIC_URL="https://seu-app.com"    # Base URL do app
NEXT_PUBLIC_APP_NAME="SM Educacional"    # Nome do sistema
```

---

## 💳 Stripe Connect (Payouts aos Professores)

### Configuração Connect

```env
STRIPE_CONNECT_CLIENT_ID="ca_..."        # Connect application ID (opcional)
```

**Como habilitar**:

1. Ativar Stripe Connect no dashboard Stripe
2. Criar `connected accounts` para professores via onboarding
3. Armazenar `stripeConnectAccountId` em `TeacherFinancial` (adicionar campo no schema)
4. Criar transfers após `payment_intent.succeeded` (ver webhook)

---

## 💰 MBWay / PSP Externo (Portugal)

```env
MBAY_API_URL="https://api.psp.com"       # Base URL do PSP
MBAY_API_KEY="..."                       # Token de autenticação
MBAY_WEBHOOK_SECRET="..."                # Validação de webhook
```

**Implementação**:

- Ajuste `src/lib/payments/mbay.ts` com chamadas reais ao PSP
- Configure webhook do PSP para `/api/webhooks/mbay`
- Valide assinatura no webhook

---

## 🌍 Tradutor IA (Azure Translator)

```env
AZURE_TRANSLATOR_KEY="..."               # Chave de assinatura
AZURE_TRANSLATOR_REGION="eastus"         # Região Azure
```

**Como usar**:

- Acesse `/admin/tools/translator` no painel admin
- API em `/api/translate` com rate limiting (30/min)
- Lib cliente em `src/lib/translate.ts`

---

## 🔧 Desenvolvimento (Opcional)

```env
NODE_ENV="development"                   # development | production
```

---

## 📋 Checklist de Deploy

### Vercel

1. Configure todas as env vars no Vercel Dashboard
2. `NEXTAUTH_URL` deve apontar para o domínio final
3. Webhooks Stripe devem apontar para `https://seu-app.com/api/webhooks/stripe`

### Stripe

1. Habilitar Pix se no Brasil (adicionar `payment_method_types: ['pix']`)
2. Criar Products e Prices para subscriptions de professores
3. Configurar webhook endpoint no Stripe Dashboard
4. (Opcional) Habilitar Connect para payouts automáticos

### Supabase

1. Criar buckets: `videos`, `pdfs`, `images`, `materials`
2. Configurar RLS policies (ver `SUPABASE_STORAGE_SETUP.md`)
3. Habilitar Storage API

### Azure Translator

1. Criar recurso no Azure Portal
2. Copiar chave e região
3. Testar com `/api/translate`

---

## 🚀 Fluxos Implementados

### Checkout (Aluno → Curso)

- Endpoint: `POST /api/checkout/session`
- Providers: `stripe`, `stripe_pix`, `mbay`
- Webhook: `/api/webhooks/stripe` (Stripe), `/api/webhooks/pix`, `/api/webhooks/mbay`

### Subscriptions (Professor → Mensalidade)

- Endpoint: `POST /api/teacher/subscriptions/create`
- Webhook: `/api/webhooks/stripe` (evento `invoice.paid`)
- Feature gating: `src/lib/subscription.ts`

### Payouts (Sistema → Professor)

- API: `POST /api/admin/payouts/generate` (calcula repasses por período)
- Modelo: `Payout` (Prisma)
- Stripe Connect: `handlePaymentIntentSucceeded` na webhook (placeholder)

---

## 📝 Próximos Passos

- [ ] Adicionar `stripeConnectAccountId` em `TeacherFinancial` (Prisma)
- [ ] Implementar onboarding de Connect para professores
- [ ] Descomentar lógica de Transfer na webhook Stripe
- [ ] Criar cron job para consolidar payouts pendentes
- [ ] Integrar MBWay com PSP real (substituir placeholder)
