# 🔍 Script de Diagnóstico - Por Que Chat IA Está Trancado?

## 🚀 Passo 1: Verificar no Banco de Dados (PostgreSQL)

```bash
# Conectar ao banco
psql -U postgres -d sm_educa -h localhost
```

### Query 1: Verificar se FeaturePurchase existe

```sql
-- Procure pelo ID do usuário que pagou
SELECT * FROM "FeaturePurchase"
WHERE "userId" = 'USER_ID_AQUI'
AND "featureId" = 'ai-assistant'
ORDER BY "createdAt" DESC;
```

**Esperado:**

```
 id  | userId | featureId     | status | purchaseDate | stripePaymentId | amount | currency | createdAt | updatedAt
-----|--------|---------------|--------|--------------|-----------------|--------|----------|-----------|----------
 fp1 | user123| ai-assistant  | active | 2025-12-30   | pi_XXXXX        | 29.9   | BRL      | ...       | ...
```

⚠️ **Se NÃO aparecer nada:**

- Webhook não processou
- FeaturePurchase não foi criado
- **Verifique Payment abaixo**

---

### Query 2: Verificar se Payment foi criado

```sql
SELECT * FROM "Payment"
WHERE "userId" = 'USER_ID_AQUI'
AND type = 'feature'
AND "featureId" = 'ai-assistant'
ORDER BY "createdAt" DESC;
```

**Esperado:**

```
 id  | userId | stripePaymentId | amount | currency | status    | type | paymentMethod | createdAt | updatedAt
-----|--------|-----------------|--------|----------|-----------|------|---------------|-----------|----------
 p1  | user123| pi_XXXXX        | 29.9   | BRL      | completed | feature | stripe     | ...       | ...
```

⚠️ **Se NÃO aparecer:**

- Stripe confirmou pagamento?
- Webhook chegou?

---

### Query 3: Verificar CheckoutSession

```sql
SELECT * FROM "CheckoutSession"
WHERE "userId" = 'USER_ID_AQUI'
ORDER BY "createdAt" DESC
LIMIT 5;
```

**Esperado:**

```
 id  | userId | stripeSessionId | status    | paymentIntentId | createdAt | updatedAt
-----|--------|-----------------|-----------|-----------------|-----------|----------
 cs1 | user123| cs_test_XXXXX   | completed | pi_XXXXX        | ...       | ...
```

---

### Query 4: Verificar AuditLog (eventos de pagamento)

```sql
SELECT * FROM "AuditLog"
WHERE "userId" = 'USER_ID_AQUI'
AND action IN ('PAYMENT_CREATED', 'PAYMENT_WEBHOOK_PROCESSED')
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Esperado:**

```
 id  | userId | action                    | targetId | targetType | createdAt | updatedAt
-----|--------|---------------------------|----------|------------|-----------|----------
 a1  | user123| PAYMENT_CREATED           | ai-asst..| Feature    | ...       | ...
 a2  | user123| PAYMENT_WEBHOOK_PROCESSED | evt_XXX..| ...        | ...       | ...
```

---

## 🧪 Passo 2: Testar a API Manualmente

### Opção A: Usar CURL

```bash
# Substitua SESSION_COOKIE pelo seu session token
curl -X GET http://localhost:3000/api/student/ai-chat/access \
  -H "Cookie: auth.session-token=SESSION_COOKIE" \
  -H "Content-Type: application/json"
```

**Esperado:**

```json
{
  "hasAccess": true,
  "enrolledCourses": [
    {
      "id": "course_123",
      "title": "Curso XYZ",
      "slug": "curso-xyz"
    }
  ],
  "isPaid": true,
  "subscriptionPlan": null
}
```

❌ **Se retornar `"hasAccess": false`:**

```json
{
  "hasAccess": false,
  "enrolledCourses": [],
  "debug": {
    "hasFeaturePurchase": false,
    "featurePurchaseStatus": null,
    "hasSubscription": false,
    "subscriptionStatus": null
  }
}
```

---

### Opção B: Usar Postman

```
GET http://localhost:3000/api/student/ai-chat/access
Headers:
  Cookie: auth.session-token=<seu_token>
  Content-Type: application/json
```

---

## 📊 Passo 3: Analisar Logs (Servidor)

### Abrir logs do servidor

```bash
# Se estiver rodando localmente
tail -f server.log | grep "ChatIA-Access\|FEATURE PURCHASE\|PaymentService"

# Ou se usar pm2
pm2 logs
```

### Procure por padrões:

#### ✅ Cenário Bom:

```
[PaymentService] ✅ FEATURE PURCHASE COMPLETED {
  userId: 'user_123',
  featureId: 'ai-assistant',
  status: 'active',
}

[ChatIA-Access] 🔍 Verificando acesso para: { userId: 'user_123' }
[ChatIA-Access] 🔎 FeaturePurchase encontrado: { exists: true, status: 'active' }
[ChatIA-Access] ✅ ACESSO CONCEDIDO
```

#### ❌ Cenário Ruim 1: FeaturePurchase não criado

```
[ChatIA-Access] 🔎 FeaturePurchase encontrado: { exists: false, status: undefined }
[ChatIA-Access] ❌ ACESSO NEGADO - Usuário não pago
```

**Causa:** Webhook não processou → FeaturePurchase não foi criado

---

#### ❌ Cenário Ruim 2: Status não é 'active'

```
[ChatIA-Access] 🔎 FeaturePurchase encontrado: { exists: true, status: 'pending' }
[ChatIA-Access] ❌ ACESSO NEGADO
```

**Causa:** FeaturePurchase criado com status errado

---

#### ❌ Cenário Ruim 3: Webhook não chegou

```
[PaymentService] Missing featureId in feature purchase
```

**Causa:** Metadata do Stripe não incluindo `featureId`

---

## 🔧 Passo 4: Solução Rápida (Manual)

Se FeaturePurchase não foi criado, você pode criar manualmente:

```sql
-- Criar FeaturePurchase manualmente
INSERT INTO "FeaturePurchase"
  ("userId", "featureId", status, "amount", currency, "stripePaymentId", "createdAt", "updatedAt")
VALUES
  ('USER_ID_AQUI', 'ai-assistant', 'active', 29.9, 'BRL', 'pi_MANUAL_XXXXX', NOW(), NOW());
```

**Depois reload a página e teste de novo.**

---

## 🚨 Passo 5: Causas Mais Comuns

### Causa 1: Webhook não chegou

```bash
# Verificar no dashboard Stripe
1. Ir para Developers → Webhooks
2. Procurar por "checkout.session.completed"
3. Status deve ser 200 (sucesso)
4. Se status 400/401/500 → algo errou
```

### Causa 2: Metadata errada

```bash
# No Stripe Dashboard
1. Ir para Pagamentos
2. Clicar na transação
3. Ver "Metadados da Sessão"
4. Deve conter: "type": "feature_purchase" e "featureId": "ai-assistant"
```

### Causa 3: FeaturePurchase criado mas status errado

```sql
-- Corrigir status
UPDATE "FeaturePurchase"
SET status = 'active'
WHERE "userId" = 'USER_ID_AQUI'
AND "featureId" = 'ai-assistant';
```

---

## 📋 Checklist de Diagnóstico

- [ ] Executou Query 1 → FeaturePurchase existe?
- [ ] Executou Query 2 → Payment existe?
- [ ] Executou Query 3 → CheckoutSession existe?
- [ ] Executou Query 4 → AuditLog tem registros?
- [ ] Testou API com CURL → Qual resposta?
- [ ] Verificou logs do servidor → Qual mensagem?
- [ ] Consultou Dashboard Stripe → Webhook chegou?
- [ ] Conferiu Metadata → featureId presente?

---

## 💬 Quando Contactar Suporte

Se tudo acima não resolver, prepare:

1. **USER_ID** que está com problema
2. **TIMESTAMP** aproximado do pagamento (data/hora)
3. **Resposta da Query 1** (FeaturePurchase)
4. **Resposta da Query 2** (Payment)
5. **Logs do servidor** (últimas 20 linhas com "ChatIA" ou "Payment")
6. **ID do Webhook** do Stripe (se encontrado)
7. **Screenshot** da página travada

---

**Ferramenta pronta para troubleshooting!** 🔧
