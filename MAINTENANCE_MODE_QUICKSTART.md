# ⚡ Maintenance Mode — Quick Start

## 1️⃣ Deploy a Migração (5 min)

```bash
cd /path/to/SM\ Educa

# Aplicar migração Prisma
npx prisma migrate dev --name "Add SystemStatus for maintenance mode"

# Ou em produção:
npx prisma migrate deploy
```

✅ Nova tabela `system_status` criada no banco

---

## 2️⃣ Ativar Manutenção (2 min)

### Via Dashboard

1. Acesse `/admin/system/maintenance` (como admin)
2. Marque "Ativar modo de manutenção"
3. Selecione "Retorno estimado" (data/hora)
4. Digite mensagem (ex: "Atualizando servidor")
5. Clique "Ativar Manutenção" ✅

### Via CURL (teste rápido)

```bash
curl -X POST http://localhost:3000/api/admin/system-maintenance \
  -H "Content-Type: application/json" \
  -d '{
    "maintenanceMode": true,
    "estimatedReturnTime": "2025-12-31T12:00:00Z",
    "maintenanceMessage": "Sistema em manutenção, voltamos em breve!"
  }'
```

---

## 3️⃣ Verificar Status

```bash
# Verificar status atual
curl http://localhost:3000/api/admin/system-maintenance

# Verificar saúde do sistema
curl http://localhost:3000/api/health

# Resposta esperada:
# {
#   "id": "singleton",
#   "maintenanceMode": true,
#   "estimatedReturnTime": "2025-12-31T12:00:00Z",
#   "maintenanceMessage": "Sistema em manutenção...",
#   "activatedBy": "admin-user-id",
#   "updatedAt": "2025-12-30T10:30:00Z"
# }
```

---

## 4️⃣ Testar em Production

✅ **O que funciona durante manutenção:**

- `/api/stripe/webhook` — Pagamentos processam normalmente
- `/api/health` — Monitoramento continua
- `/admin/*` — Admin panel acessível
- `/api/system/maintenance-stream` — SSE funciona

❌ **O que é bloqueado:**

- `/student/*` → Redireciona para `/maintenance`
- `/teacher/*` → Redireciona para `/maintenance`
- `/api/courses` → Retorna 503 Service Unavailable
- Usuários veem página de manutenção com countdown

---

## 5️⃣ Desativar Manutenção (1 min)

### Via Dashboard

1. Acesse `/admin/system/maintenance`
2. **Desmarque** "Ativar modo de manutenção"
3. Clique "Desativar Manutenção" ✅

### Via CURL

```bash
curl -X POST http://localhost:3000/api/admin/system-maintenance \
  -H "Content-Type: application/json" \
  -d '{
    "maintenanceMode": false,
    "estimatedReturnTime": "2025-12-31T12:00:00Z",
    "maintenanceMessage": ""
  }'
```

✅ Usuários são redirecionados automaticamente para home

---

## 🔍 Verificar Logs de Auditoria

Toda ativação/desativação é registrada em `AuditLog`:

```bash
# No banco de dados Postgres
SELECT * FROM "AuditLog"
WHERE action = 'SYSTEM_CONFIG_UPDATED'
ORDER BY "createdAt" DESC
LIMIT 10;
```

Registra:

- ✅ Quem ativou (userId)
- ✅ Quando ativou (timestamp)
- ✅ De onde ativou (IP address)
- ✅ Que mensagem foi definida
- ✅ Tempo estimado de retorno

---

## 🐛 Troubleshooting

### Problema: Usuários não veem página de manutenção

**Solução:**

1. Verificar se middleware está recarregado: `npm run dev`
2. Verificar se token de session é válido
3. Verificar cache do browser (Ctrl+Shift+Del)

### Problema: Rate limit aparece (429)

**Solução:**

- Máximo 5 requisições/minuto por admin
- Aguarde 60 segundos e tente novamente

### Problema: SSE não conecta

**Solução:**

1. Verificar console do browser (F12)
2. Verificar se `/api/system/maintenance-stream` está acessível
3. Verificar CORS headers

### Problema: Webhooks não funcionam

**Solução:**

- Webhooks são whitelisted, devem funcionar sempre
- Se falhar, verificar logs de `/api/stripe/webhook`

---

## 📊 Arquitetura Rápida

```
┌─────────────────────────────────┐
│ Admin Ativa Manutenção          │
│ /admin/system/maintenance       │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ API POST /api/admin/system-...  │
│ - Auth: role === 'ADMIN'        │
│ - Validate: Zod schema          │
│ - Rate limit: 5 req/min         │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ SystemService.activateMode()    │
│ - Update DB (upsert)            │
│ - Invalidate cache              │
│ - Audit log                     │
│ - Notify via SSE                │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ Middleware Check                │
│ isMaintenanceActive() → true    │
│ Redirect: / → /maintenance      │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ User Sees /maintenance Page     │
│ - Timer até retorno             │
│ - SSE updates em tempo real     │
│ - Reconecta auto se desconecta  │
└─────────────────────────────────┘
```

---

## ✅ Checklist Pós-Deploy

- [ ] Migração Prisma executada
- [ ] `/admin/system/maintenance` está acessível
- [ ] Modo ativado/desativado funciona
- [ ] Usuários veem página de manutenção
- [ ] Countdown timer funciona
- [ ] SSE notifica em tempo real
- [ ] Webhooks continuam funcionando
- [ ] Health check retorna 200
- [ ] Audit log registra ações
- [ ] Desativação recarrega users

---

## 🎯 Resumo

| Ação              | Tempo   | Acesso                          |
| :---------------- | :------ | :------------------------------ |
| Deploy migração   | 5 min   | CLI                             |
| Ativar manutenção | 1 min   | `/admin/system/maintenance`     |
| Desativar         | 1 min   | `/admin/system/maintenance`     |
| Ver status        | Instant | `/api/admin/system-maintenance` |
| Consultar logs    | 5 min   | DB ou `/api/admin/audit`        |

---

**VisionVII 3.0 — Maintenance Mode Ready for Production** ✅
