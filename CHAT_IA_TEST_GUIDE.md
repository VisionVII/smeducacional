# 🧪 Guia de Teste Completo - Chat IA Checkout

**Status:** ✅ SISTEMA AUDITADO E GARANTIDO  
**Data:** 30 de Dezembro de 2025  
**Objetivo:** Verificar fluxo completo de pagamento e desbloqueio de Chat IA

---

## 📋 Pré-Requisitos

- ✅ Conta Stripe Test configurada
- ✅ Webhook de Stripe recebendo em `/api/webhooks/stripe`
- ✅ Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- ✅ Banco de dados PostgreSQL rodando
- ✅ Seed de usuários criados

---

## 🧪 Teste 1: Fluxo Completo de Pagamento

### Passo 1: Acessar Página de Checkout

```bash
# Abrir no navegador como aluno/professor não pago
http://localhost:3000/checkout/chat-ia
```

**Verificação:**

- [ ] Página carrega sem erros
- [ ] Preço é R$ 29,90
- [ ] Botão "Comprar Agora com Stripe" visível

### Passo 2: Preencher Formulário de Pagamento

```
Número do Cartão (Test): 4242 4242 4242 4242
Validade: 12/25
CVC: 123
```

**Verificação:**

- [ ] Redirecionado para Stripe Checkout
- [ ] Informações aparecem corretamente

### Passo 3: Confirmar Pagamento

Clicar em "Pagar" no Stripe

**Verificação:**

- [ ] Página de sucesso aparece com mensagem: **"Pagamento confirmado! 🎉"**
- [ ] Texto exibe: **"Sua compra de Chat IA foi processada com sucesso. Acesso à ferramenta foi liberado!"**
- [ ] Botão **"Acessar Ferramenta"** visível

### Passo 4: Verificar Logs de Webhook

Abrir console/logs do servidor:

```bash
tail -f logs/server.log | grep "FEATURE PURCHASE"
```

**Esperado:**

```
[PaymentService] ✅ FEATURE PURCHASE COMPLETED {
  timestamp: "2025-12-30T10:30:00Z",
  userId: "user_123",
  featureId: "ai-assistant",
  status: "active",
  stripePaymentId: "pi_XXXXX",
  amount: "29.9 BRL",
  isTest: true,
  featurePurchaseId: "fp_XXXXX",
  paymentId: "p_XXXXX",
  stripeEventId: "evt_XXXXX",
}
```

### Passo 5: Clicar em "Acessar Ferramenta"

Botão redireciona para `/student/ai-chat`

**Verificação:**

- [ ] Chat IA carrega sem erros
- [ ] Mensagem de boas-vindas aparece
- [ ] Campo de input para enviar mensagens visível

### Passo 6: Enviar Mensagem de Teste

Digite uma pergunta simples:

```
"Qual é a capital do Brasil?"
```

**Verificação:**

- [ ] Mensagem é enviada
- [ ] IA responde com mensagem gerada
- [ ] Histórico de conversa aparece

---

## 🔍 Teste 2: Verificar FeaturePurchase no Banco

### Conectar ao Banco de Dados

```bash
psql -U postgres -d sm_educa
```

### Query para Verificar FeaturePurchase

```sql
SELECT * FROM "FeaturePurchase"
WHERE "userId" = 'user_123'
AND "featureId" = 'ai-assistant'
ORDER BY "createdAt" DESC;
```

**Esperado:**

```
 id  | userId  | featureId     | status | purchaseDate | stripePaymentId | amount | currency | createdAt | updatedAt
-----|---------|---------------|--------|--------------|-----------------|--------|----------|-----------|----------
 fp1 | user123 | ai-assistant  | active | 2025-12-30   | pi_XXXXX        | 29.9   | BRL      | ...       | ...
```

**Verificações:**

- [ ] `status = 'active'` ✅
- [ ] `amount = 29.9` ✅
- [ ] `currency = 'BRL'` ✅
- [ ] `stripePaymentId` preenchido ✅

### Verificar Payment

```sql
SELECT * FROM "Payment"
WHERE "userId" = 'user_123'
AND type = 'feature'
ORDER BY "createdAt" DESC;
```

**Esperado:**

```
 id  | userId  | stripePaymentId | amount | currency | status    | type | paymentMethod | createdAt | updatedAt
-----|---------|-----------------|--------|----------|-----------|------|---------------|-----------|----------
 p1  | user123 | pi_XXXXX        | 29.9   | BRL      | completed | feature | stripe     | ...       | ...
```

**Verificações:**

- [ ] `status = 'completed'` ✅
- [ ] `type = 'feature'` ✅
- [ ] `paymentMethod = 'stripe'` ✅

---

## 🛡️ Teste 3: API de Debug para Admin

### Endpoint de Debug

```bash
GET /api/admin/feature-purchases/user_123
Authorization: Bearer <admin_token>
```

**Esperado (Response):**

```json
{
  "userId": "user_123",
  "summary": {
    "totalFeaturePurchases": 1,
    "activeFeatures": 1,
    "totalPayments": 1,
    "completedPayments": 1
  },
  "featurePurchases": [
    {
      "id": "fp_XXXXX",
      "userId": "user_123",
      "featureId": "ai-assistant",
      "status": "active",
      "purchaseDate": "2025-12-30T10:30:00Z",
      "stripePaymentId": "pi_XXXXX",
      "amount": 29.9,
      "currency": "BRL",
      "createdAt": "2025-12-30T10:30:00Z",
      "updatedAt": "2025-12-30T10:30:00Z"
    }
  ],
  "payments": [
    {
      "id": "p_XXXXX",
      "stripePaymentId": "pi_XXXXX",
      "amount": 29.9,
      "currency": "BRL",
      "status": "completed",
      "paymentMethod": "stripe",
      "createdAt": "2025-12-30T10:30:00Z"
    }
  ],
  "auditLogs": [
    {
      "action": "PAYMENT_CREATED",
      "targetId": "ai-assistant",
      "targetType": "Feature",
      "metadata": {
        "featurePurchaseId": "fp_XXXXX",
        "paymentId": "p_XXXXX"
      }
    }
  ]
}
```

**Verificações:**

- [ ] `summary.activeFeatures = 1` ✅
- [ ] `summary.completedPayments = 1` ✅
- [ ] `featurePurchases[0].status = 'active'` ✅
- [ ] `payments[0].status = 'completed'` ✅

---

## ⚠️ Teste 4: Cenários de Erro

### Cenário 1: Usuário Não Autenticado

```bash
GET /checkout/chat-ia
# Sem login
```

**Esperado:**

- [ ] Redireciona para `/login`

### Cenário 2: Pagamento Cancelado

```
1. Ir para /checkout/chat-ia
2. Clicar "Comprar Agora"
3. Clicar "Voltar" no Stripe
```

**Esperado:**

- [ ] Redireciona para `/checkout/chat-ia?canceled=true`
- [ ] Mensagem: "Pagamento cancelado"

### Cenário 3: Webhook Duplicado

```bash
# Enviar o mesmo webhook 2x (simular retry)
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: SIGNATURE" \
  -d @webhook.json
```

**Esperado:**

```json
{ "received": true, "duplicate": true }
```

- [ ] Segundo webhook é ignorado (deduplicação)
- [ ] Apenas 1 FeaturePurchase criado

### Cenário 4: Tentar Acessar sem Pagamento

```bash
# Usuário diferente que não pagou
GET /api/student/ai-chat/access
```

**Esperado:**

```json
{
  "hasAccess": false,
  "enrolledCourses": []
}
```

- [ ] `hasAccess = false` ✅

---

## ✅ Teste 5: Acessibilidade Multi-Dispositivo

### Desktop (>1024px)

```bash
http://localhost:3000/checkout/chat-ia
# F12 → Viewport: 1920x1080
```

**Verificações:**

- [ ] Layout responsivo
- [ ] Botões clicáveis
- [ ] Imagens carregam

### Tablet (768-1024px)

```bash
# F12 → Viewport: 768x1024
```

**Verificações:**

- [ ] Layout se adapta
- [ ] Botões acessíveis
- [ ] Sem scroll horizontal

### Mobile (<768px)

```bash
# F12 → Viewport: 375x667 (iPhone)
```

**Verificações:**

- [ ] Layout stack vertical
- [ ] Botões tamanho mínimo 44x44px
- [ ] Sem elementos cortados

---

## 📊 Teste 6: Performance e Segurança

### Performance

```bash
# Lighthouse (F12 → Lighthouse)
```

**Esperado:**

- [ ] Performance: > 80
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### Segurança

```bash
# Verificar headers de segurança
curl -I https://seu-dominio.com/checkout/chat-ia
```

**Esperado:**

```
Content-Security-Policy: ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🎯 Checklist Final

- [ ] Fluxo completo de pagamento funciona
- [ ] FeaturePurchase criado com `status: 'active'`
- [ ] Payment criado com `status: 'completed'`
- [ ] Chat IA acessível após pagamento
- [ ] Mensagens processadas corretamente
- [ ] API de debug funciona
- [ ] Webhooks duplicados são ignorados
- [ ] Usuários não pagos não têm acesso
- [ ] Logs estruturados aparecem
- [ ] Página de sucesso mostra mensagens claras
- [ ] Responsive em todos os dispositivos
- [ ] Segurança OK

---

## 🚀 Deploy em Produção

### 1. Verificar Variáveis de Ambiente

```bash
# .env.production
STRIPE_PUBLIC_KEY=pk_live_XXXXX
STRIPE_SECRET_KEY=sk_live_XXXXX
STRIPE_WEBHOOK_SECRET=whsec_live_XXXXX
```

### 2. Testar com Stripe Test Mode

```bash
# Primeiro: com livemode: false
```

### 3. Habilitar Modo Live no Stripe

```bash
# Dashboard Stripe → Enable Live Mode
```

### 4. Atualizar Webhook

```bash
# Dashboard Stripe → Webhooks
# URL: https://seu-dominio.com/api/webhooks/stripe
# Events: checkout.session.completed
```

### 5. Monitor Logs

```bash
# Acompanhar logs em produção
tail -f /var/log/app.log | grep "FEATURE PURCHASE"
```

---

## 📞 Suporte e Troubleshooting

### Webhook não recebe

```bash
# Verificar endpoint
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: TEST" \
  -d '{"type":"test"}'

# Erro esperado: "Invalid signature"
# ✅ Se receber erro = endpoint está respondendo
```

### FeaturePurchase não criado

```bash
# Verificar logs
grep "Missing userId\|Missing featureId" server.log

# Verificar metadata no Stripe
stripe checkout_sessions retrieve SESS_XXXXX --api-key sk_test_XXXXX
```

### Chat IA não carrega

```bash
# Verificar acesso
curl http://localhost:3000/api/student/ai-chat/access \
  -H "Cookie: auth.session-token=XXXXX"

# Verificar FeaturePurchase
psql -U postgres -d sm_educa -c \
  "SELECT * FROM \"FeaturePurchase\" WHERE \"userId\"='user_123'"
```

---

**Desenvolvido com excelência pela VisionVII**  
_Versão: VisionVII 3.0 Enterprise Governance | Dezembro 2025_
