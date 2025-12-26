# 🧪 Guia de Testes - Webhook Stripe

## ✅ Status Atual

**Webhook Route**: `/api/webhooks/stripe` ✅ **IMPLEMENTADO**

**Funcionalidades**:

- ✅ Validação de assinatura Stripe
- ✅ Handler `checkout.session.completed`
- ✅ Handler `payment_intent.succeeded`
- ✅ Handler `customer.subscription.*` (created, updated, deleted)
- ✅ Handler `invoice.*` (paid, failed)
- ✅ Handler `account.updated` (Stripe Connect)

---

## 🔧 Configuração Inicial

### 1. Configure Webhook no Stripe Dashboard

1. Acesse [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Clique em **"Add endpoint"**
3. Configure:
   - **Endpoint URL**:
     - Local: `http://localhost:3000/api/webhooks/stripe` (via Stripe CLI)
     - Produção: `https://seudominio.com/api/webhooks/stripe`
   - **Events to send**:
     ```
     checkout.session.completed
     payment_intent.succeeded
     payment_intent.payment_failed
     customer.subscription.created
     customer.subscription.updated
     customer.subscription.deleted
     invoice.payment_succeeded
     invoice.payment_failed
     account.updated
     ```
4. Copie o **Signing secret** (`whsec_...`)
5. Adicione ao `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 2. Instale Stripe CLI (Testes Locais)

```bash
# Windows (via Scoop)
scoop install stripe

# MacOS (via Homebrew)
brew install stripe/stripe-cli/stripe

# Ou baixe: https://github.com/stripe/stripe-cli/releases
```

### 3. Autentique Stripe CLI

```bash
stripe login
```

---

## 🧪 Cenários de Teste

### Teste 1: Compra de Curso (checkout.session.completed)

**Objetivo**: Validar criação de enrollment e payment após compra.

**Setup**:

1. Configure credenciais Stripe em `/admin/plans/stripe`
2. Teste conexão (botão "Testar Conexão")

**Execução**:

1. Como aluno, acesse um curso com preço
2. Clique em "Comprar Curso"
3. Use cartão de teste: `4242 4242 4242 4242`
4. Complete checkout

**Validações**:

- [ ] Webhook recebeu evento `checkout.session.completed`
- [ ] `Enrollment` criado no banco (`status: ACTIVE`)
- [ ] `Payment` criado (`status: COMPLETED`, `type: course`)
- [ ] `Invoice` gerada com número único
- [ ] Notificação enviada para admins
- [ ] Email de confirmação enviado ao aluno
- [ ] Logs no terminal sem erros

**Query de Validação**:

```sql
SELECT * FROM enrollments WHERE "studentId" = 'USER_ID' AND "courseId" = 'COURSE_ID';
SELECT * FROM payments WHERE "userId" = 'USER_ID' AND "type" = 'course';
SELECT * FROM invoices WHERE "userId" = 'USER_ID' ORDER BY "createdAt" DESC LIMIT 1;
```

---

### Teste 2: Assinatura de Estudante (customer.subscription.created)

**Objetivo**: Validar criação de `StudentSubscription`.

**Execução**:

1. Como aluno, acesse `/student/subscription`
2. Escolha plano (Basic/Premium)
3. Complete checkout com `4242 4242 4242 4242`

**Validações**:

- [ ] Webhook recebeu `customer.subscription.created`
- [ ] `StudentSubscription` criado (`status: active`)
- [ ] `stripeSubId` e `stripePriceId` preenchidos
- [ ] `currentPeriodStart` e `currentPeriodEnd` corretos

**Query de Validação**:

```sql
SELECT * FROM student_subscriptions WHERE "userId" = 'USER_ID';
```

---

### Teste 3: Assinatura de Professor (customer.subscription.created)

**Objetivo**: Validar criação de `TeacherSubscription` e atualização de `TeacherFinancial`.

**Execução**:

1. Como professor, acesse `/teacher/subscription`
2. Escolha plano (Basic/Pro/Enterprise)
3. Complete checkout

**Validações**:

- [ ] Webhook recebeu `customer.subscription.created`
- [ ] `TeacherSubscription` criado (`status: active`)
- [ ] `TeacherFinancial.subscriptionStatus` = `'active'`
- [ ] `TeacherFinancial.plan` atualizado
- [ ] `subscriptionStartDate` e `subscriptionExpiresAt` preenchidos

**Query de Validação**:

```sql
SELECT * FROM teacher_subscriptions WHERE "userId" = 'USER_ID';
SELECT * FROM teacher_financials WHERE "userId" = 'USER_ID';
```

---

### Teste 4: Cancelamento de Assinatura

**Objetivo**: Validar atualização de status ao cancelar.

**Execução**:

1. No Stripe Dashboard, cancele uma subscription
2. Ou via CLI:
   ```bash
   stripe subscriptions cancel sub_XXX
   ```

**Validações**:

- [ ] Webhook recebeu `customer.subscription.deleted`
- [ ] Subscription marcada como `cancelled`
- [ ] `TeacherFinancial.subscriptionStatus` = `'inactive'` (se professor)

---

### Teste 5: Stripe Connect - Transfer Automático

**Objetivo**: Validar repasse automático ao professor após venda.

**Pré-requisito**:

- Professor com Stripe Connect onboarding completo
- `TeacherFinancial.stripeConnectAccountId` preenchido
- `TeacherFinancial.connectOnboardingComplete = true`

**Execução**:

1. Aluno compra curso do professor conectado
2. Aguarde evento `payment_intent.succeeded`

**Validações**:

- [ ] Webhook processou `payment_intent.succeeded`
- [ ] Transfer criado via Stripe API
- [ ] `Payout` registrado no banco (`status: paid`)
- [ ] Valor correto baseado em plano do professor:
  - Plano pago (`subscriptionStatus: active`): 100% do valor
  - Plano free: 70% do valor (30% comissão)

**Query de Validação**:

```sql
SELECT * FROM payouts WHERE "teacherId" = 'TEACHER_ID' ORDER BY "createdAt" DESC LIMIT 1;
```

**Validação Stripe**:

```bash
stripe transfers list --limit 5
```

---

### Teste 6: Falha de Pagamento (invoice.payment_failed)

**Objetivo**: Validar tratamento de erro e notificação ao usuário.

**Execução**:

1. Use cartão que sempre falha: `4000 0000 0000 0341`
2. Tente comprar curso ou assinar plano

**Validações**:

- [ ] Webhook recebeu `invoice.payment_failed`
- [ ] `Payment.status` = `'failed'`
- [ ] `Invoice.status` = `'overdue'`
- [ ] Email de falha enviado ao usuário

---

### Teste 7: Onboarding Stripe Connect Completo

**Objetivo**: Atualizar status quando professor completa onboarding.

**Execução**:

1. Professor inicia onboarding Stripe Connect
2. Completa verificação de identidade e dados bancários
3. Stripe envia evento `account.updated`

**Validações**:

- [ ] Webhook recebeu `account.updated`
- [ ] `TeacherFinancial.connectOnboardingComplete` = `true`
- [ ] Professor pode receber payouts

---

## 🛠️ Ferramentas de Teste

### Stripe CLI - Forward Webhooks Localmente

```bash
# Forward webhooks do Stripe para localhost
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Trigger eventos manualmente
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

### cURL - Simular Webhook (⚠️ SEM VALIDAÇÃO)

```bash
# ⚠️ Apenas para debug - Stripe rejeita sem signature válida
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: fake" \
  -d '{
    "id": "evt_test",
    "object": "event",
    "type": "checkout.session.completed",
    "data": { ... }
  }'
```

### Postman Collection

Importe collection do Stripe:

- [Stripe API Postman Collection](https://www.postman.com/stripedev/workspace/stripe-developers/overview)

---

## 🔍 Debug e Logs

### Logs do Webhook (Terminal Next.js)

Procure por:

```
[Stripe webhook] Processing event: checkout.session.completed
Course enrollment created for user: xxx course: xxx
[Stripe Connect] Transfer criado: tr_xxx para professor: xxx
```

### Verificar Assinatura Inválida

```
Stripe webhook: Invalid signature
```

**Solução**: Verifique `STRIPE_WEBHOOK_SECRET` no `.env.local`

### Eventos no Stripe Dashboard

1. Acesse [Stripe Dashboard → Developers → Events](https://dashboard.stripe.com/test/events)
2. Veja todos os webhooks enviados
3. Status: `✅ succeeded` ou `❌ failed`
4. Clique para ver payload e response

---

## 📊 Checklist de Validação Completa

### Fase 1: Configuração

- [ ] `STRIPE_WEBHOOK_SECRET` configurado no `.env.local`
- [ ] Webhook endpoint registrado no Stripe Dashboard
- [ ] Eventos selecionados corretamente
- [ ] Stripe CLI instalado e autenticado (opcional)

### Fase 2: Testes de Compra

- [ ] Compra de curso cria enrollment
- [ ] Payment e Invoice gerados
- [ ] Notificações criadas para admins
- [ ] Email enviado ao comprador

### Fase 3: Testes de Assinatura

- [ ] Assinatura de aluno cria `StudentSubscription`
- [ ] Assinatura de professor cria `TeacherSubscription`
- [ ] `TeacherFinancial` atualizado corretamente
- [ ] Cancelamento atualiza status

### Fase 4: Stripe Connect

- [ ] Onboarding completo atualiza `connectOnboardingComplete`
- [ ] Transfer automático criado após venda
- [ ] Payout registrado no banco
- [ ] Valor correto (70% ou 100%) baseado em plano

### Fase 5: Tratamento de Erros

- [ ] Signature inválida retorna 400
- [ ] Falha de pagamento marca como `failed`
- [ ] Email de falha enviado
- [ ] Logs sem erros fatais

---

## 🆘 Troubleshooting

### Erro: "Missing signature"

**Causa**: Header `stripe-signature` ausente.
**Solução**: Use Stripe CLI ou Dashboard para enviar webhooks.

### Erro: "Invalid signature"

**Causa**: `STRIPE_WEBHOOK_SECRET` incorreto ou ausente.
**Solução**:

1. Verifique `.env.local`
2. Reinicie servidor (`npm run dev`)
3. Teste com `stripe listen --forward-to`

### Webhook não processa evento

**Causa**: Handler não implementado para o tipo de evento.
**Solução**: Adicione case no switch de `processStripeWebhook()`.

### Transfer não criado (Stripe Connect)

**Causas**:

- Professor sem `stripeConnectAccountId`
- Onboarding incompleto (`connectOnboardingComplete = false`)
- Conta Stripe não pode receber payouts

**Solução**:

1. Verifique `TeacherFinancial` no banco
2. Confirme onboarding no Stripe Dashboard
3. Teste com conta Connect em modo test

---

## 🚀 Próximos Passos

1. **Produção**:

   - [ ] Trocar chaves `test` por `live`
   - [ ] Atualizar URL do webhook para domínio real
   - [ ] Copiar novo `STRIPE_WEBHOOK_SECRET` (live mode)

2. **Monitoramento**:

   - [ ] Configurar Sentry para erros de webhook
   - [ ] Dashboard de analytics de pagamentos
   - [ ] Alertas para falhas consecutivas

3. **Features Avançadas**:
   - [ ] Retry automático para webhooks falhados
   - [ ] Idempotência (evitar duplicação)
   - [ ] Suporte a múltiplos métodos de pagamento (PIX, Boleto)

---

**Desenvolvido com excelência pela VisionVII** — Soluções que impactam positivamente através da tecnologia.
