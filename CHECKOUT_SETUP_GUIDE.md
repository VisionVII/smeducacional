# 🛒 Guia Completo: Checkout Teste → Produção

## 📋 Índice

1. [Configuração Inicial (Ambiente de Teste)](#1-configuração-inicial)
2. [Criar Produtos no Stripe](#2-criar-produtos-no-stripe)
3. [Configurar Webhooks Locais](#3-configurar-webhooks-locais)
4. [Testar Fluxo Completo](#4-testar-fluxo-completo)
5. [Preparar para Produção](#5-preparar-para-produção)
6. [Deploy e Monitoramento](#6-deploy-e-monitoramento)

---

## 1. Configuração Inicial (Ambiente de Teste)

### 1.1 Criar Conta Stripe (Modo Teste)

1. Acesse [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Crie sua conta gratuita
3. **Ative o modo "Test mode"** (toggle no canto superior direito)
4. Anote suas chaves de teste:
   - Dashboard → Developers → API Keys
   - `Publishable key`: Começa com `pk_test_...`
   - `Secret key`: Começa com `sk_test_...`

### 1.2 Configurar Variáveis de Ambiente

Edite seu arquivo `.env.local`:

```bash
# ============================================
# STRIPE - MODO TESTE
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51Abc...xyz"
STRIPE_SECRET_KEY="sk_test_51Abc...xyz"
STRIPE_WEBHOOK_SECRET=""  # Vamos pegar depois

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# ============================================
# DATABASE (Supabase)
# ============================================
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# ============================================
# SUPABASE STORAGE
# ============================================
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

### 1.3 Verificar Sistema Funcionando

```bash
# 1. Instalar dependências
npm install

# 2. Gerar Prisma Client
npm run db:generate

# 3. Aplicar schema ao banco
npm run db:push

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

✅ Abra [http://localhost:3000](http://localhost:3000) - deve carregar sem erros

---

## 2. Criar Produtos no Stripe

### 2.1 Criar Produto de Curso (Teste)

1. Acesse [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products)
2. Clique em **"+ Add product"**
3. Preencha:
   - **Name**: `Curso de Teste`
   - **Description**: `Produto para testes de checkout`
   - **Pricing**: `One time` (pagamento único)
   - **Price**: `R$ 99,00` (ou qualquer valor)
   - **Currency**: `BRL`
4. Clique em **"Save product"**

⚠️ **IMPORTANTE**: Você NÃO precisa do `Price ID` porque usamos **dynamic pricing** (preço é pego do banco de dados)

### 2.2 Criar Produtos de Subscription (Professores)

Para as mensalidades dos professores, crie 3 produtos:

#### Plano Básico (R$ 49/mês)

1. Dashboard → Products → **"+ Add product"**
2. Preencha:
   - **Name**: `Professor - Plano Básico`
   - **Pricing model**: `Recurring`
   - **Billing period**: `Monthly`
   - **Price**: `R$ 49,00`
   - **Currency**: `BRL`
3. Salve e copie o **Price ID** (ex: `price_1Abc123xyz`)
4. Adicione ao `.env.local`:
   ```bash
   STRIPE_TEACHER_BASIC_PRICE_ID="price_1Abc123xyz"
   ```

#### Plano Pro (R$ 99/mês)

- Mesmo processo, com **Price**: `R$ 99,00`
- Copie o Price ID

#### Plano Enterprise (R$ 199/mês)

- Mesmo processo, com **Price**: `R$ 199,00`
- Copie o Price ID

---

## 3. Configurar Webhooks Locais

### 3.1 Instalar Stripe CLI

**Windows (PowerShell):**

```powershell
# Instalar via Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Ou baixar manualmente:**

- [https://github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases)
- Baixe `stripe_X.X.X_windows_x86_64.zip`
- Extraia para `C:\stripe-cli\`
- Adicione ao PATH

### 3.2 Autenticar Stripe CLI

```bash
stripe login
```

Isso abrirá o navegador para autorizar.

### 3.3 Iniciar Webhook Forwarding

Em um terminal separado (deixe rodando):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Output esperado:**

```
> Ready! Your webhook signing secret is whsec_abc123xyz...
```

### 3.4 Copiar Webhook Secret

Pegue o valor `whsec_...` e adicione ao `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET="whsec_abc123xyz..."
```

### 3.5 Reiniciar Servidor

```bash
# Parar o npm run dev (Ctrl+C)
# Reiniciar
npm run dev
```

---

## 4. Testar Fluxo Completo

### 4.1 Criar Curso de Teste

1. Acesse [http://localhost:3000/login](http://localhost:3000/login)
2. Faça login como TEACHER ou crie uma conta
3. Vá para `/teacher/courses/new`
4. Crie um curso com:
   - **Título**: Curso de Teste
   - **Preço**: R$ 99,00
   - **isPaid**: `true`
   - **isPublished**: `true`

### 4.2 Comprar Curso com Cartão de Teste

1. **Faça logout** e login como STUDENT (ou crie nova conta)
2. Acesse o curso em `/courses/curso-de-teste`
3. Clique em **"Comprar Curso"**
4. Você será redirecionado para o Stripe Checkout
5. Use cartão de teste:
   - **Número**: `4242 4242 4242 4242`
   - **Data**: Qualquer data futura (ex: `12/34`)
   - **CVC**: Qualquer 3 dígitos (ex: `123`)
   - **Nome**: Qualquer nome
6. Clique em **"Pay"**

### 4.3 Verificar Webhook Recebido

No terminal onde `stripe listen` está rodando, você verá:

```
[200] POST http://localhost:3000/api/webhooks/stripe [evt_abc123]
  checkout.session.completed
```

### 4.4 Verificar Matrícula Criada

1. No navegador, você será redirecionado para `/checkout/success`
2. Clique em **"Acessar Curso"**
3. Você deve estar matriculado e ver o conteúdo do curso

### 4.5 Verificar no Banco de Dados

Abra o Prisma Studio:

```bash
npm run db:studio
```

Verifique se foram criados:

- ✅ `Enrollment` (studentId + courseId)
- ✅ `Payment` (status: COMPLETED)
- ✅ `Invoice` (status: paid)
- ✅ `CheckoutSession` (status: completed)

---

## 5. Preparar para Produção

### 5.1 Ativar Stripe Connect (Para Payouts)

1. Dashboard → [Settings → Connect](https://dashboard.stripe.com/settings/connect)
2. Clique em **"Get started"**
3. Preencha informações da sua empresa:
   - Nome legal
   - Endereço
   - Website
   - Suporte
4. Ative **"Express accounts"** (recomendado)
5. Aguarde aprovação (pode levar 1-2 dias úteis)

### 5.2 Criar Produtos de Produção

⚠️ **IMPORTANTE**: Produtos de teste NÃO funcionam em produção!

1. Desative **"Test mode"** no Stripe Dashboard
2. Recrie todos os produtos (cursos e subscriptions)
3. Copie os novos **Price IDs** de produção

### 5.3 Obter Chaves de Produção

Dashboard → Developers → API Keys (modo **Live**)

```bash
# Copiar:
pk_live_...  # Publishable key
sk_live_...  # Secret key
```

### 5.4 Configurar Webhook de Produção

1. Dashboard → Developers → [Webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **"+ Add endpoint"**
3. Preencha:
   - **Endpoint URL**: `https://seudominio.vercel.app/api/webhooks/stripe`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `payment_intent.succeeded`
     - `account.updated`
4. Clique em **"Add endpoint"**
5. Copie o **Signing secret** (`whsec_live_...`)

### 5.5 Variáveis de Ambiente - Produção (Vercel)

No Vercel Dashboard → Settings → Environment Variables:

```bash
# STRIPE PRODUÇÃO
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_live_..."

# STRIPE PRICE IDS
STRIPE_TEACHER_BASIC_PRICE_ID="price_live_basic"
STRIPE_TEACHER_PRO_PRICE_ID="price_live_pro"
STRIPE_TEACHER_ENTERPRISE_PRICE_ID="price_live_enterprise"

# NEXTAUTH
NEXTAUTH_URL="https://seudominio.vercel.app"
NEXTAUTH_SECRET="production-secret-min-32-chars-random"

# DATABASE
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

---

## 6. Deploy e Monitoramento

### 6.1 Fazer Deploy

```bash
# 1. Commitar código
git add .
git commit -m "feat: checkout produção configurado"
git push origin main

# 2. Deploy automático na Vercel
```

### 6.2 Testar em Produção

1. Acesse sua URL de produção
2. Crie curso de teste
3. Compre com cartão **REAL** (ou peça para alguém testar)
4. Verifique se webhook foi recebido:
   - Stripe Dashboard → Developers → Webhooks → Seu endpoint
   - Deve mostrar eventos recebidos com sucesso (✅ 200)

### 6.3 Monitorar Webhooks

**Stripe Dashboard:**

- Developers → Webhooks → [seu endpoint]
- Veja logs de todos os eventos
- Se houver falhas (❌), clique para ver erro

**Vercel:**

- Dashboard → Functions → `/api/webhooks/stripe`
- Veja logs de execução
- Errors aparecem aqui

### 6.4 Testar Stripe Connect (Payout Professor)

1. Como TEACHER, acesse `/api/teacher/connect/onboard`
2. Complete o onboarding do Stripe Express
3. Venda um curso como aluno
4. Verifique se transfer foi criado:
   - Stripe Dashboard → Payments → Transfers
   - Deve aparecer 70% ou 100% (dependendo do plano)

---

## 🧪 Cartões de Teste (Stripe)

### Sucesso

- **4242 4242 4242 4242** - Sucesso imediato
- **5555 5555 5555 4444** - Mastercard
- **3782 822463 10005** - American Express

### Erros (para testar tratamento)

- **4000 0000 0000 0002** - Card declined
- **4000 0000 0000 9995** - Insufficient funds
- **4000 0000 0000 0069** - Expired card
- **4000 0027 6000 3184** - 3D Secure (requer autenticação)

Todos os cartões:

- **Data**: Qualquer futura (ex: 12/34)
- **CVC**: Qualquer 3 dígitos (ex: 123)
- **Nome**: Qualquer

---

## ✅ Checklist Final

### Ambiente de Teste

- [ ] Stripe Test Mode ativado
- [ ] Chaves `pk_test_` e `sk_test_` configuradas
- [ ] Stripe CLI instalado e autenticado
- [ ] Webhook local funcionando (`stripe listen`)
- [ ] Curso de teste criado
- [ ] Compra com cartão de teste bem-sucedida
- [ ] Enrollment criado no banco
- [ ] Payment status = COMPLETED
- [ ] Email de confirmação enviado (se configurado)

### Produção

- [ ] Stripe Live Mode ativado
- [ ] Produtos de produção criados
- [ ] Chaves `pk_live_` e `sk_live_` configuradas na Vercel
- [ ] Webhook de produção criado e testado
- [ ] Stripe Connect ativado e aprovado
- [ ] Onboarding de professor testado
- [ ] Compra real testada
- [ ] Transfer automático funcionando
- [ ] Monitoramento de webhooks ativo

---

## 🚨 Troubleshooting Comum

### "Webhook signature verification failed"

**Causa**: STRIPE_WEBHOOK_SECRET incorreto ou não definido  
**Solução**:

1. Verificar `.env.local` tem `STRIPE_WEBHOOK_SECRET`
2. Reiniciar `npm run dev`
3. Verificar `stripe listen` está rodando

### "Course not found" ao comprar

**Causa**: courseId não foi passado corretamente  
**Solução**: Verificar componente CheckoutButton está enviando `courseId`

### Webhook não é recebido (produção)

**Causa**: URL do webhook incorreta ou firewall bloqueando  
**Solução**:

1. Verificar URL: `https://seudominio.vercel.app/api/webhooks/stripe`
2. Testar manualmente: Stripe Dashboard → Webhooks → Send test webhook
3. Ver logs na Vercel Functions

### Transfer não é criado (Stripe Connect)

**Causa**: Professor não completou onboarding ou `connectOnboardingComplete = false`  
**Solução**:

1. Verificar banco: `TeacherFinancial.connectOnboardingComplete`
2. Se false, professor precisa refazer onboarding
3. Stripe Dashboard → Connect → Accounts → Ver status

### Pagamento aceito mas matrícula não criada

**Causa**: Webhook não foi processado ou falhou  
**Solução**:

1. Stripe Dashboard → Events → Buscar evento
2. Webhook logs → Ver erro
3. Executar manualmente: Webhook → "Resend"

---

## 📚 Recursos Adicionais

- [Documentação Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Documentação Stripe Connect](https://stripe.com/docs/connect)
- [Stripe CLI Reference](https://stripe.com/docs/cli)
- [Testing Stripe](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

## 🎯 Próximos Passos (Opcionais)

1. **Dashboard do Professor**: Ver payouts recebidos
2. **Admin Reports**: Relatórios de revenue
3. **Email Templates**: Personalizar emails transacionais
4. **Cupons de Desconto**: Implementar códigos promocionais
5. **Planos Anuais**: Oferecer desconto para pagamento anual
6. **Multi-currency**: Aceitar USD, EUR além de BRL

---

**Desenvolvido com excelência pela VisionVII** 🚀
