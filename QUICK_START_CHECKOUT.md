# ⚡ Quick Start: Checkout em 5 Minutos

## 🎯 Checklist Rápido

```bash
# 1️⃣ Verificar configuração
npm run check:checkout

# 2️⃣ Stripe CLI (instalar se necessário)
stripe login

# 3️⃣ Terminal 1: Servidor
npm run dev

# 4️⃣ Terminal 2: Webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 5️⃣ Copiar webhook secret para .env.local
# STRIPE_WEBHOOK_SECRET="whsec_..."

# 6️⃣ Reiniciar servidor (Ctrl+C no Terminal 1, depois npm run dev)
```

---

## 🧪 Teste Rápido

### 1. Criar Curso

```
1. Login como TEACHER: http://localhost:3000/login
2. Criar curso: /teacher/courses/new
   - Título: Curso de Teste
   - Preço: 99.00
   - isPublished: true
3. Salvar
```

### 2. Comprar Curso

```
1. Logout
2. Login como STUDENT (ou criar nova conta)
3. Ir para: /courses
4. Clicar no curso criado
5. Clicar "Comprar Curso"
```

### 3. Pagar no Stripe

```
Cartão: 4242 4242 4242 4242
Data: 12/34
CVC: 123
Nome: Test User
```

### 4. Verificar Sucesso

```
✅ Redirecionado para /checkout/success
✅ Webhook recebido (ver terminal do stripe listen)
✅ Enrollment criado (npm run db:studio)
✅ Payment status = COMPLETED
```

---

## 🔑 Chaves Stripe

### Modo Teste (Desenvolvimento)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Do stripe listen
```

**Obter chaves:**

1. https://dashboard.stripe.com/test/apikeys
2. Copiar Publishable key (pk*test*...)
3. Copiar Secret key (sk*test*...)

### Modo Live (Produção)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51..."
STRIPE_SECRET_KEY="sk_live_51..."
STRIPE_WEBHOOK_SECRET="whsec_live_..." # Do webhook endpoint
```

**Obter chaves:**

1. Desativar "Test mode" no Stripe Dashboard
2. https://dashboard.stripe.com/apikeys
3. Copiar chaves de PRODUÇÃO

---

## 🎴 Cartões de Teste

| Cenário       | Número                | Resultado            |
| ------------- | --------------------- | -------------------- |
| ✅ Sucesso    | `4242 4242 4242 4242` | Pagamento aprovado   |
| ❌ Falha      | `4000 0000 0000 0002` | Cartão recusado      |
| 💰 Sem fundos | `4000 0000 0000 9995` | Fundos insuficientes |
| 🔒 3D Secure  | `4000 0027 6000 3184` | Requer autenticação  |

**Todos os cartões:**

- Data: Qualquer futura (12/34)
- CVC: Qualquer 3 dígitos (123)
- Nome: Qualquer

Mais cartões: https://stripe.com/docs/testing#cards

---

## 🚀 Deploy Produção (Vercel)

### 1. Criar Webhook Stripe (Produção)

```
1. Dashboard → Developers → Webhooks
2. Add endpoint: https://seudominio.vercel.app/api/webhooks/stripe
3. Eventos:
   - checkout.session.completed
   - payment_intent.succeeded
   - customer.subscription.*
   - invoice.paid
   - invoice.payment_failed
   - account.updated
4. Copiar Signing secret (whsec_live_...)
```

### 2. Variáveis Vercel

```
Vercel → Settings → Environment Variables

Production:
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...)
✅ STRIPE_SECRET_KEY (sk_live_...)
✅ STRIPE_WEBHOOK_SECRET (whsec_live_...)
✅ NEXTAUTH_URL (https://seudominio.vercel.app)
✅ NEXTAUTH_SECRET (gerar com: openssl rand -base64 32)
✅ DATABASE_URL
✅ DIRECT_URL
```

### 3. Redeployar

```bash
git push origin main
# Deploy automático na Vercel
```

### 4. Testar Produção

```
1. Acessar https://seudominio.vercel.app
2. Criar curso
3. Comprar com cartão REAL
4. Verificar Stripe Dashboard → Events
5. Webhook deve estar ✅ 200 OK
```

---

## 🐛 Troubleshooting

### Erro: "Webhook signature verification failed"

```bash
# Solução:
1. Verificar STRIPE_WEBHOOK_SECRET no .env.local
2. Reiniciar npm run dev
3. Verificar stripe listen está rodando
```

### Erro: "Course not found"

```bash
# Solução:
1. Verificar curso está published (isPublished = true)
2. Verificar courseId está correto
3. Ver logs: Console do navegador + Terminal do servidor
```

### Webhook não chega (produção)

```bash
# Solução:
1. Stripe Dashboard → Webhooks → Ver logs
2. Se erro 404: URL do webhook está errada
3. Se timeout: Vercel function pode estar falhando
4. Testar manualmente: Send test webhook
```

---

## 📊 Monitoramento

### Desenvolvimento

```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Prisma Studio (ver banco)
npm run db:studio

# Terminal 4: Logs customizados (opcional)
tail -f logs/checkout.log
```

### Produção

```
✅ Stripe Dashboard → Events
✅ Stripe Dashboard → Webhooks → [seu endpoint]
✅ Vercel → Functions → /api/webhooks/stripe
✅ Vercel → Logs (real-time)
```

---

## 📚 Links Úteis

- 📖 [Guia Completo](CHECKOUT_SETUP_GUIDE.md) - Passo a passo detalhado
- 💰 [Modelo de Mensalidades](SUBSCRIPTION_MODEL_README.md) - Sistema de payouts
- 🔐 [Stripe Testing](https://stripe.com/docs/testing) - Cartões e cenários de teste
- 🪝 [Webhook Guide](https://stripe.com/docs/webhooks) - Como funcionam webhooks
- 🚀 [Stripe Connect](https://stripe.com/docs/connect) - Payouts automáticos

---

## ✅ Status do Sistema

| Feature             | Status | Documentação                                                                 |
| ------------------- | ------ | ---------------------------------------------------------------------------- |
| Checkout Cartão     | ✅     | [CHECKOUT_SETUP_GUIDE.md](CHECKOUT_SETUP_GUIDE.md)                           |
| Webhooks Stripe     | ✅     | [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts) |
| Stripe Connect      | ✅     | [SUBSCRIPTION_MODEL_README.md](SUBSCRIPTION_MODEL_README.md)                 |
| Payouts Automáticos | ✅     | 70% free, 100% pago                                                          |
| Subscriptions       | ✅     | Teacher & Student                                                            |
| Pix Webhook         | 🟡     | Placeholder seguro                                                           |
| MBWay Webhook       | 🟡     | Placeholder seguro                                                           |

**Legenda:**

- ✅ Pronto para produção
- 🟡 Implementado mas não integrado
- ❌ Não implementado

---

**Precisa de ajuda?** Veja o [guia completo](CHECKOUT_SETUP_GUIDE.md) ou abra uma issue no GitHub.

🚀 **VisionVII** - Transformando educação através de tecnologia
