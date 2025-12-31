# 💣 SOLUÇÃO NUCLEAR - Desbloquear Chat IA Forçadamente

**Quando usar:** Quando nada mais funciona  
**Tempo:** 2 minutos  
**Risco:** Baixo (apenas cria/atualiza FeaturePurchase)

---

## 🚀 Opção 1: SQL Direto (Mais Rápido)

### 1. Conectar ao Banco

```bash
psql -U postgres -d sm_educa
```

### 2. Copiar e Colar TUDO Isto:

```sql
-- SUBSTITUIR 'USER_ID_AQUI' pelo ID real do usuário

-- 1. Inserir ou atualizar FeaturePurchase
INSERT INTO "FeaturePurchase"
  ("userId", "featureId", status, "amount", "currency", "stripePaymentId", "createdAt", "updatedAt", "purchaseDate")
VALUES
  ('USER_ID_AQUI', 'ai-assistant', 'active', 29.90, 'BRL', 'pi_force_unlocked', NOW(), NOW(), NOW())
ON CONFLICT ("userId", "featureId")
DO UPDATE SET
  status = 'active',
  "updatedAt" = NOW(),
  "purchaseDate" = NOW();

-- 2. Verificar resultado
SELECT 'FEATURE PURCHASE CRIADO/ATUALIZADO' as "Status";
SELECT * FROM "FeaturePurchase"
WHERE "userId" = 'USER_ID_AQUI'
AND "featureId" = 'ai-assistant';

-- 3. Criar log de auditoria (opcional)
INSERT INTO "AuditLog"
  ("userId", action, "targetId", "targetType", "createdAt", "updatedAt", metadata)
VALUES
  ('USER_ID_AQUI', 'MANUAL_FEATURE_UNLOCK', 'ai-assistant', 'Feature', NOW(), NOW(),
   '{"method":"emergency_unlock","timestamp":"' || NOW() || '"}');

SELECT 'AUDITORIA REGISTRADA' as "Status";
```

### 3. Pronto!

Usuário pode fazer:

1. **F5** para reload a página
2. **Cache limpo** (Ctrl+Shift+Del)
3. **Ir para `/student/ai-chat`**
4. Chat IA deve carregar

---

## 🔧 Opção 2: Via API Admin (Se Quiser Menos SQL)

```bash
# 1. Obter token admin
# Fazer login como admin
# Abrir DevTools → Application → Cookies → auth.session-token

# 2. Chamar endpoint
curl -X POST http://localhost:3000/api/admin/unlock-feature \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_AQUI",
    "featureId": "ai-assistant"
  }'
```

⚠️ **NOTA:** Este endpoint não existe, é só um exemplo.  
Usar SQL direto é mais seguro.

---

## 📋 Exemplo Real

Digamos que o usuário é:

- **Nome:** João Silva
- **Email:** joao@example.com
- **USER_ID:** clsqz1a2b3c4d5e6f7g8h9

```sql
INSERT INTO "FeaturePurchase"
  ("userId", "featureId", status, "amount", "currency", "stripePaymentId", "createdAt", "updatedAt", "purchaseDate")
VALUES
  ('clsqz1a2b3c4d5e6f7g8h9', 'ai-assistant', 'active', 29.90, 'BRL', 'pi_force_unlocked', NOW(), NOW(), NOW())
ON CONFLICT ("userId", "featureId")
DO UPDATE SET
  status = 'active',
  "updatedAt" = NOW(),
  "purchaseDate" = NOW();
```

---

## ✅ Verificação Pós-Desbloqueio

```sql
-- Confirmar que funciona
SELECT * FROM "FeaturePurchase"
WHERE "userId" = 'USER_ID_AQUI'
AND "featureId" = 'ai-assistant';

-- Deve retornar:
-- status = 'active'
-- stripePaymentId = 'pi_force_unlocked' (ou outro)
```

---

## 🎯 Possíveis Cenários

### Cenário 1: Já existe FeaturePurchase com status='pending'

```
INSERT ... ON CONFLICT ... DO UPDATE SET status = 'active'
```

✅ Vai atualizar para 'active'

### Cenário 2: Não existe FeaturePurchase

```
INSERT ... ON CONFLICT
```

✅ Vai inserir novo

### Cenário 3: Já existe com status='active'

```
INSERT ... ON CONFLICT ... DO UPDATE SET status = 'active'
```

✅ Vai atualizar a data (inofensivo)

---

## ⚠️ Cuidados

- ✅ **SEGURO:** Apenas unlock de feature já paga
- ✅ **SEGURO:** Auditoria registrada
- ✅ **SEGURO:** Pode ser revertido
- ❌ **NÃO FAÇA:** Unlock para usuários que não pagaram
- ❌ **NÃO FAÇA:** Sem documentar (deixe log)

---

## 🔄 Como Reverter (se algo der errado)

```sql
-- Deletar (soft delete)
UPDATE "FeaturePurchase"
SET status = 'inactive'
WHERE "userId" = 'USER_ID_AQUI'
AND "featureId" = 'ai-assistant';

-- Ou delete completo
DELETE FROM "FeaturePurchase"
WHERE "userId" = 'USER_ID_AQUI'
AND "featureId" = 'ai-assistant';
```

---

## 📞 Log de Desbloqueios

Para rastrear quem desbloqueou, mantenha um arquivo:

```txt
2025-12-30 10:30 | João Silva (clsqz1a2b3c4d5e6f7g8h9) | MANUAL UNLOCK | FeaturePurchase
2025-12-30 11:45 | Maria Santos (clsqz9x8y7w6v5u4t3s2r1) | MANUAL UNLOCK | FeaturePurchase
```

---

**⏱️ Tempo total: 2 minutos**  
**Risco: Nenhum**  
**Custo: Grátis**
