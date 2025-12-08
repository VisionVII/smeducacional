# 🧪 Guia de Testes Pós-Deploy - Vercel

Execute este guia após o deployment estar online para validar todas as funcionalidades.

## 1️⃣ Teste de Conectividade

```bash
# Verificar se o site está online
curl -I https://seu-app.vercel.app
# Esperado: HTTP/1.1 200 OK

# Verificar health endpoint (se implementado)
curl https://seu-app.vercel.app/api/health
# Esperado: { "status": "ok" }
```

## 2️⃣ Teste de Autenticação

### Passo 1: Acessar login

```
1. Abrir: https://seu-app.vercel.app/login
2. Verificar: Formulário de login aparece sem erros
3. Status: ✅ ou ❌
```

### Passo 2: Criar conta

```
1. Clique em "Registrar-se" ou "Sign Up"
2. Preencha:
   - Email: test-user-<timestamp>@example.com (ex: test-user-20251208@example.com)
   - Senha: TestPassword123!
   - Nome: Test User
3. Clique "Criar Conta"
4. Verificar: Redirecionado para dashboard
5. Verificar Email: Deve chegar welcome email em ~30s
6. Status: ✅ ou ❌
```

### Passo 3: Fazer login

```
1. Logout (se necessário)
2. Acesso: https://seu-app.vercel.app/login
3. Email: teste acima
4. Senha: TestPassword123!
5. Clique "Entrar"
6. Verificar: Dashboard carrega
7. Status: ✅ ou ❌
```

## 3️⃣ Teste de Pagamentos

### Passo 1: Acessar checkout

```
1. Aceso: https://seu-app.vercel.app/courses
2. Selecione um curso pago
3. Clique "Comprar" ou "Subscribe"
4. Verificar: Stripe checkout modal aparece
5. Status: ✅ ou ❌
```

### Passo 2: Completar pagamento

```
1. Preencha formulário de pagamento:
   - Cartão: 4242 4242 4242 4242 (teste Stripe)
   - Expiração: 12/25 (futura)
   - CVC: 123 (qualquer 3 dígitos)
   - Email: seu-email@example.com
2. Clique "Pay"
3. Aguarde redirecionamento para /checkout/success
4. Verificar: Página de sucesso mostra
5. Verificar Email: Email de confirmação em ~1min
6. Status: ✅ ou ❌
```

### Passo 3: Validar dados no banco

```bash
# Conectar ao banco PostgreSQL:
psql $DATABASE_URL

# Verificar pagamento foi criado:
SELECT id, amount, status, "userId" FROM payments
ORDER BY "createdAt" DESC LIMIT 1;

# Verificar enrollment foi criado:
SELECT id, status, "userId", "courseId" FROM enrollments
WHERE "userId" = '<seu-user-id>' LIMIT 1;

# Sair:
\q
```

**Status**: ✅ ou ❌

## 4️⃣ Teste de Emails

### Verificar Resend Dashboard

```
1. Abrir: https://resend.com/emails
2. Verificar enviados:
   - [ ] Welcome Email (1 minuto após signup)
   - [ ] Payment Success Email (1 minuto após checkout)
   - [ ] Subscription Renewal Email (se houver teste cron)
3. Clicar em cada email e verificar:
   - Conteúdo aparece
   - Links funcionam
   - Logo/branding correto
4. Status: ✅ ou ❌
```

### Testar Email Personalisado

```
1. Enviar POST para criar pagamento direto (avançado):
curl -X POST https://seu-app.vercel.app/api/test/send-email \
  -H "Authorization: Bearer <seu-secret>" \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_success","email":"seu-email@example.com"}'

2. Verificar inbox em ~30s
3. Status: ✅ ou ❌
```

## 5️⃣ Teste de Admin Dashboard

### Passo 1: Acessar Dashboard

```
1. Login como admin (você deve ter role: ADMIN)
2. Acesso: https://seu-app.vercel.app/admin/dashboard
3. Verificar: Página carrega sem erros 500
4. Status: ✅ ou ❌
```

### Passo 2: Validar Métricas

```
Verificar seções:

✅ Revenue Cards:
   - Total Revenue (deve mostrar valor do pagamento recente)
   - Monthly Revenue (se houver)
   - Payment Count (deve ser > 0)

✅ Charts:
   - User Distribution (gráfico de pizza com roles)
   - Revenue Trend (gráfico de linha com timeline)

✅ Payment Status:
   - Completed (deve ter o pagamento de teste)
   - Pending (se houver)
   - Failed (se houver)

✅ Transaction Table:
   - Mostra últimas 10 transações
   - Data, valor, status corretos

✅ System Logs:
   - Mostra últimas operações
   - Procure por "Payment", "Webhook", "Cron"

Status: ✅ ou ❌
```

## 6️⃣ Teste de Cron Jobs

### Manualmente (via cURL)

```bash
# Terminal/PowerShell:
curl -X POST https://seu-app.vercel.app/api/cron/remarketing `
  -H "Authorization: Bearer <seu-CRON_SECRET>" `
  -H "Content-Type: application/json"

# Esperado:
# {
#   "success": true,
#   "overdue_count": 0,
#   "renewal_count": 0,
#   "retry_count": 0,
#   "timestamp": "2025-12-08T..."
# }

# Status: ✅ ou ❌
```

### Verificar Execução

```
1. Abrir Vercel Logs: https://vercel.com/dashboard/project/smeducacional/logs
2. Procurar por POST /api/cron/remarketing
3. Status deve ser 200
4. Response time: <1000ms
5. Status: ✅ ou ❌
```

### Verificar System Logs

```
1. Dashboard Admin → System Logs
2. Procurar por "Cron" ou "Remarketing"
3. Deve haver entrada tipo:
   "Cron job completed: 0 overdue, 0 renewal, 0 retry"
4. Status: ✅ ou ❌
```

## 7️⃣ Teste de Performance

```bash
# Testar tempo de resposta da homepage
time curl https://seu-app.vercel.app > /dev/null

# Esperado: < 2 segundos total

# Testar API de pagamento
time curl https://seu-app.vercel.app/api/checkout/course \
  -H "Content-Type: application/json" \
  -d '{"courseId":"test"}' > /dev/null

# Esperado: < 1 segundo (pode falhar sem auth, mas mede speed)
```

**Status**: ✅ ou ❌

## 8️⃣ Teste de Banco de Dados

```bash
# Testar conexão do banco
psql $DATABASE_URL -c "SELECT 1 as connection_ok"

# Esperado:
# connection_ok
#     1

# Contar registros principais
psql $DATABASE_URL -c "
  SELECT
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM courses) as total_courses,
    (SELECT COUNT(*) FROM payments) as total_payments,
    (SELECT COUNT(*) FROM enrollments) as total_enrollments
"

# Esperado: todos > 0

# Status: ✅ ou ❌
```

## 9️⃣ Teste de Stripe Webhook

```bash
# Verificar logs de webhook no Stripe
1. Abrir: https://dashboard.stripe.com/webhooks
2. Clique no endpoint `/api/webhooks/stripe`
3. Clique na aba "Events"
4. Procure por `checkout.session.completed` com status ✅
5. Clique no evento e verifique:
   - Request: POST sucesso
   - Response: 200 OK
6. Status: ✅ ou ❌
```

## 🔟 Checklist Final

```
Funcionalidade         | Status | Observações
─────────────────────  | ────── | ──────────────────────
Conectividade          | ✅/❌   |
Login                  | ✅/❌   |
Signup + Email         | ✅/❌   |
Checkout              | ✅/❌   |
Payment Success Email  | ✅/❌   |
Admin Dashboard        | ✅/❌   |
System Logs           | ✅/❌   |
Cron Manual           | ✅/❌   |
Banco de Dados        | ✅/❌   |
Stripe Webhook        | ✅/❌   |
```

## ❌ Se Algo Falhar

### Logs para Verificar

1. **Vercel Logs**: https://vercel.com/dashboard/project/smeducacional/logs
2. **Banco**: `psql $DATABASE_URL -c "SELECT * FROM system_logs ORDER BY \"createdAt\" DESC LIMIT 20"`
3. **Resend**: https://resend.com/emails (procure por erros)
4. **Stripe**: https://dashboard.stripe.com/events (procure por erros)

### Comandos de Diagnóstico

```bash
# Testar env vars
echo "DATABASE_URL=$DATABASE_URL"
echo "STRIPE_KEY=$STRIPE_SECRET_KEY" (NÃO mostrar a chave inteira!)

# Testar build local
npm run build

# Testar dev local
npm run dev

# Validar Prisma
npm run db:generate

# Testar conexão DB
npm run db:push --skip-generate
```

---

**Salve este arquivo e execute periodicamente (semanal/mensal) para validar sistema em produção** ✅

Última atualização: 8 de dezembro de 2025
