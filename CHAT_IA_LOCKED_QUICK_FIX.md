# ⚡ AÇÃO IMEDIATA - Chat IA Travado Após Pagamento

**Problema:** Usuário pagou mas Chat IA continua trancado  
**Solução:** 3 passos simples de diagnóstico

---

## 🚀 PASSO 1: Coletar Diagnóstico (3 min)

### Opção A: Usar Script (mais fácil)

```bash
# Na pasta do projeto, execute:
bash diagnostic.sh user_123_do_cliente

# Exemplo com ID real:
bash diagnostic.sh clsqz1234abcd5678efgh
```

### Opção B: Comando Manual (PostgreSQL)

```bash
psql -U postgres -d sm_educa
```

```sql
-- Procure o USER_ID do cliente que pagou
-- Depois execute TUDO isso:

SELECT 'FEATURE PURCHASE' as "Teste";
SELECT * FROM "FeaturePurchase"
WHERE "userId" = 'COLE_USER_ID_AQUI'
AND "featureId" = 'ai-assistant';

SELECT 'PAYMENT' as "Teste";
SELECT * FROM "Payment"
WHERE "userId" = 'COLE_USER_ID_AQUI'
AND type = 'feature' LIMIT 1;

SELECT 'AUDIT LOG' as "Teste";
SELECT action, "createdAt" FROM "AuditLog"
WHERE "userId" = 'COLE_USER_ID_AQUI'
AND action IN ('PAYMENT_CREATED', 'PAYMENT_WEBHOOK_PROCESSED')
LIMIT 5;
```

---

## 🔍 PASSO 2: Interpretar Resultado

### Cenário A: FeaturePurchase existe com status='active' ✅

```
Sua resposta: 1 linha com status = 'active'
```

→ **Problema NÃO é no banco**  
→ Vá para **PASSO 3: Debug do Frontend**

---

### Cenário B: FeaturePurchase NÃO existe ❌

```
Sua resposta: (0 rows)
```

**Causa:** Webhook do Stripe não processou

**Solução imediata:**

```sql
-- Criar manualmente:
INSERT INTO "FeaturePurchase"
  ("userId", "featureId", status, "amount", "currency", "stripePaymentId", "createdAt", "updatedAt")
VALUES
  ('COLE_USER_ID', 'ai-assistant', 'active', 29.90, 'BRL', 'pi_manual_xxxxx', NOW(), NOW());
```

Depois: Usuário reload a página (F5) e teste novamente

---

### Cenário C: FeaturePurchase existe mas status ≠ 'active' ⚠️

```
Sua resposta: 1 linha com status = 'pending' (ou outro)
```

**Solução imediata:**

```sql
-- Corrigir status:
UPDATE "FeaturePurchase"
SET status = 'active'
WHERE "userId" = 'COLE_USER_ID'
AND "featureId" = 'ai-assistant';
```

Depois: Usuário reload a página (F5) e teste novamente

---

## 🐛 PASSO 3: Debug do Frontend (se FeaturePurchase OK)

Se FeaturePurchase está correto mas Chat IA ainda trancado:

### A. Verificar Logs no Navegador

```bash
1. Abra o Chat IA no navegador
2. Pressione F12 (Developer Tools)
3. Clique em "Console"
4. Procure por linhas começando com "[StudentAIChat]" ou "[ChatIA-Access]"
```

**Esperado:**

```
[ChatIA-Access] 🔍 Verificando acesso para: user_123
[ChatIA-Access] 🔎 FeaturePurchase encontrado: { exists: true, status: 'active' }
[ChatIA-Access] ✅ ACESSO CONCEDIDO
```

**Se vê:**

```
[ChatIA-Access] 🔎 FeaturePurchase encontrado: { exists: false, status: undefined }
```

→ **O banco tem, mas a API está retornando false**  
→ Verifique se fez deploy do código atualizado

---

### B. Testar API Manualmente

```bash
# Abra Terminal e execute:
curl -X GET http://localhost:3000/api/student/ai-chat/access \
  -H "Cookie: auth.session-token=SUA_SESSION_AQUI"
```

**Esperado:**

```json
{
  "hasAccess": true,
  "enrolledCourses": [...],
  "isPaid": true
}
```

**Se aparecer:**

```json
{
  "hasAccess": false,
  "debug": {
    "hasFeaturePurchase": false,
    "featurePurchaseStatus": null
  }
}
```

→ O banco tem mas a API não está encontrando  
→ **Clear Cache do navegador (Ctrl+Shift+Del) e tente novamente**

---

## 🎯 RESUMO RÁPIDO

| Situação                                                                 | O que fazer                                      |
| :----------------------------------------------------------------------- | :----------------------------------------------- |
| FeaturePurchase existe + status='active' + logs dizem "ACESSO CONCEDIDO" | ✅ **Funcionando** - clear cache e reload        |
| FeaturePurchase NÃO existe                                               | ➕ **Insert manual** no banco                    |
| FeaturePurchase existe mas status ≠ 'active'                             | 🔧 **UPDATE** status para 'active'               |
| Tudo certo mas ainda trancado                                            | 🔄 **Deploy** código novo (tem logs novos)       |
| Nada funciona                                                            | 📞 **Contatar suporte** com diagnostic.sh output |

---

## 📞 Se Nada Funcionar

Prepare isto e envie:

1. **Output completo do diagnostic.sh:**

   ```bash
   bash diagnostic.sh user_id_do_cliente > debug.txt
   # Envie o arquivo debug.txt
   ```

2. **Email do cliente que pagou**

3. **Data/hora do pagamento**

4. **Screenshot da página travada**

---

**⏱️ Tempo total: ~10 minutos**
