# 💳 Sistema de Pagamentos - Documentação Completa

## 📋 Visão Geral

O sistema de pagamentos foi totalmente implementado usando **Stripe** como provedor de pagamento principal, com suporte a:

- ✅ Compra de cursos individuais (modo `payment`)
- ✅ Subscrições de alunos (modo `subscription`)
- ✅ Subscrições de professores (modo `subscription`)
- ✅ Webhooks para sincronização de eventos
- ✅ Geração automática de invoices
- ✅ Rastreamento completo de pagamentos

---

## 🗂️ Estrutura Implementada

### Database Models (Prisma)

```
├── Payment - Transações de pagamento
├── Invoice - Faturas e recibos
├── CheckoutSession - Sessões Stripe
├── StudentSubscription - Subscrição de alunos
├── TeacherSubscription - Subscrição de professores
├── StudentEnrollmentPayment - Pagamento por matrícula
├── SystemLog - Logs de eventos
├── DeveloperMetrics - Métricas de performance
└── GithubIntegration - Integração com GitHub
```

### APIs Implementadas

#### 1. **POST /api/checkout/course**

Cria uma sessão de checkout para compra de curso

```bash
curl -X POST http://localhost:3001/api/checkout/course \
  -H "Content-Type: application/json" \
  -d '{"courseId": "course-id"}'

# Response
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

#### 2. **POST /api/checkout/student-subscription**

Cria sessão para subscrição de aluno

```bash
curl -X POST http://localhost:3001/api/checkout/student-subscription \
  -H "Content-Type: application/json" \
  -d '{"plan": "basic"}' # ou "premium"
```

#### 3. **POST /api/checkout/teacher-subscription**

Cria sessão para subscrição de professor

```bash
curl -X POST http://localhost:3001/api/checkout/teacher-subscription \
  -H "Content-Type: application/json" \
  -d '{"plan": "premium"}' # basic, premium, enterprise
```

#### 4. **POST /api/webhooks/stripe**

Webhook para processar eventos Stripe

```bash
# Enviado automaticamente pelo Stripe
# Processa: checkout.session.completed, subscription.*, invoice.*
```

---

## 🔧 Setup Stripe

### 1. Criar conta Stripe

- Acesse [stripe.com](https://stripe.com)
- Crie uma conta e pegue as chaves

### 2. Configurar variáveis de ambiente

No arquivo `.env`:

```env
# Chaves Stripe
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_test_YOUR_WEBHOOK_SECRET"

# Price IDs para Subscriptions (crie no Stripe Dashboard)
STRIPE_STUDENT_BASIC_PRICE_ID="price_..."
STRIPE_STUDENT_PREMIUM_PRICE_ID="price_..."
STRIPE_TEACHER_BASIC_PRICE_ID="price_..."
STRIPE_TEACHER_PREMIUM_PRICE_ID="price_..."
STRIPE_TEACHER_ENTERPRISE_PRICE_ID="price_..."

# URL pública (para webhooks)
NEXT_PUBLIC_URL="https://seu-dominio.com"
```

### 3. Configurar Webhook no Stripe

1. Vá para Stripe Dashboard → Developers → Webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/webhooks/stripe`
4. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o "Signing secret" para `STRIPE_WEBHOOK_SECRET`

### 4. Criar Produtos e Preços

#### Aluno - Basic ($29.90/mês)

1. Products → Create product
2. Name: "Subscription - Aluno Basic"
3. Pricing: One-time ou recurring (month)
4. Price: 29.90 BRL
5. Copie Price ID para `STRIPE_STUDENT_BASIC_PRICE_ID`

#### Aluno - Premium ($49.90/mês)

Similar ao acima, update `STRIPE_STUDENT_PREMIUM_PRICE_ID`

#### Professor - Plans

Crie para Basic ($99/mês), Premium ($199/mês), Enterprise ($499/mês)

---

## 📊 Dashboard Admin Refatorado

### Métricas Adicionadas

1. **Stats Principais**

   - Total de usuários
   - Total de cursos (com contagem de pagos)
   - Matrículas ativas
   - Receita total

2. **Métricas de Pagamento**

   - Subscrições ativas (alunos + professores)
   - Faturas vencidas
   - Integrações GitHub conectadas

3. **Gráficos**

   - Distribuição de usuários por tipo
   - Status de pagamentos
   - Tabela de últimas transações

4. **Developer Tools**
   - Banco de Dados
   - Logs do Sistema
   - Métricas de Performance
   - Integrações GitHub

---

## 🎯 Fluxo de Compra

### 1. Aluno Compra Curso

```
┌─────────────────┐
│  Página Curso   │
│  [Botão Comprar]│
└────────┬────────┘
         │ POST /api/checkout/course
         ▼
┌──────────────────────┐
│  Stripe Checkout     │
│  [Inserir cartão]    │
└────────┬─────────────┘
         │ Stripe processa
         ▼
┌──────────────────────────┐
│  Webhook completado      │
│  - Criar enrollment      │
│  - Criar payment         │
│  - Criar invoice         │
│  - Atualizar status      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────┐
│  Página de Sucesso   │
│  [Acessar Curso]     │
└──────────────────────┘
```

### 2. Professor Se Inscreve

```
┌──────────────────────┐
│  Página Planos       │
│  [Selecionar Plan]   │
└────────┬─────────────┘
         │ POST /api/checkout/teacher-subscription
         ▼
┌──────────────────────┐
│  Stripe Checkout     │
│  Subscription        │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Webhook (subscription.*)    │
│  - Criar TeacherSubscription │
│  - Ativar features do plano  │
│  - Criar payment             │
└──────────────────────────────┘
```

---

## 💾 Seed de Dados

### Executar Seed Completo

```bash
# Seed básico (usuários, cursos gratuitos)
npm run db:seed

# Seed de pagamentos (cursos pagos, dados de teste)
npm run db:seed:payments
```

### Credenciais de Teste

```
Admin: admin@smeducacional.com / admin123
Professor: professor@smeducacional.com / teacher123
Aluno: aluno@smeducacional.com / student123

Aluno Premium: aluno.pago@test.com / teste123
Professor Premium: professor.pago@test.com / teste123
```

### Cursos Pagos Criados

- Masterclass: Next.js Avançado - R$ 199.90
- Full Stack: React + Node.js + PostgreSQL - R$ 249.90
- Stripe Integration Masterclass - R$ 149.90
- TypeScript Profissional - R$ 129.90

---

## 🔐 Componentes Criados

### 1. CheckoutButton Component

```tsx
import { CheckoutButton } from '@/components/checkout/CheckoutButton';

<CheckoutButton
  courseId="course-id"
  price={199.9}
  isPaid={true}
  isEnrolled={false}
  onSuccess={() => console.log('Compra realizada!')}
/>;
```

### 2. Stripe Utilities

```typescript
import {
  createCourseCheckoutSession,
  createStudentSubscriptionCheckoutSession,
  createTeacherSubscriptionCheckoutSession,
} from '@/lib/stripe';
```

---

## 📈 Monitoramento

### System Logs

- Rastreia eventos de pagamento, subscrição, erros
- Acessível em Admin Dashboard → System Logs

### Developer Metrics

- Response time de APIs
- Taxa de erro por componente
- Disponível em Admin Dashboard → Developer Metrics

### Invoices

- Automaticamente geradas em cada pagamento bem-sucedido
- Status: pending, paid, overdue, cancelled
- Acessível via admin dashboard

---

## ✉️ Sistema de Emails e Remarketing

### Emails Implementados

O sistema completo de emails foi implementado usando **Resend** como provedor. Os seguintes emails são automaticamente enviados:

#### 1. **Welcome Email** (`sendWelcomeEmail()`)

- **Quando:** Novo usuário se registra ou é criado pelo admin
- **Conteúdo:** Boas-vindas, instruções de acesso, informações sobre o perfil
- **Integrado em:**
  - `POST /api/auth/register` (auto-registro)
  - `POST /api/admin/users` (criação pelo admin)

#### 2. **Payment Success Email** (`sendPaymentSuccessEmail()`)

- **Quando:** Pagamento de curso completado
- **Conteúdo:** Confirmação, número da fatura, valor, título do curso, link para acessar
- **Integrado em:**
  - Webhook Stripe: `checkout.session.completed` (handleCheckoutCompleted)

#### 3. **Payment Failed Email** (`sendPaymentFailedEmail()`)

- **Quando:** Pagamento falhou
- **Conteúdo:** Motivo da falha, número da fatura, valor, link para tentar novamente
- **Integrado em:**
  - Webhook Stripe: `invoice.payment_failed` (handleInvoiceFailed)

#### 4. **Pending Invoice Email** (`sendPendingInvoiceEmail()`)

- **Quando:** Acionado por cron job para invoices vencidas
- **Conteúdo:** Alerta de vencimento, data de vencimento, valor pendente, link de pagamento
- **Integrado em:**
  - Cron job: `sendOverdueInvoiceReminders()`

#### 5. **Subscription Renewal Email** (`sendSubscriptionRenewalEmail()`)

- **Quando:** Subscrição vai vencer em 7-14 dias
- **Conteúdo:** Aviso de renovação, data de renovação, plano, valor
- **Integrado em:**
  - Cron job: `sendSubscriptionRenewalReminders()`

### Estrutura de Emails

```typescript
// src/lib/emails.ts

interface EmailPayload {
  email: string;
  userName: string;
  // ... outros campos específicos
}

export async function sendPaymentSuccessEmail(
  payload: EmailPayload
): Promise<void> {
  const { data } = await resend.emails.send({
    from: 'noreply@smeducacional.com',
    to: payload.email,
    subject: 'Pagamento Confirmado',
    html: htmlTemplate, // Template HTML com styling
  });
}
```

### Variáveis de Ambiente Necessárias

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
CRON_SECRET=your-secure-random-token-here
```

---

## 🔄 Sistema de Cron Jobs (Remarketing)

### Cron Jobs Disponíveis

O sistema oferece 3 cron jobs automatizados para remarketing:

#### 1. **Overdue Invoice Reminders**

```typescript
// Encontra invoices com status 'overdue' dos últimos 30 dias
// Envia email de cobrança para cada uma
// Registra atividade em SystemLog

sendOverdueInvoiceReminders();
```

**Frequência recomendada:** A cada 6 horas

#### 2. **Subscription Renewal Reminders**

```typescript
// Encontra subscrições (student + teacher) vencendo em 7-14 dias
// Envia email de renovação para cada uma
// Registra atividade em SystemLog

sendSubscriptionRenewalReminders();
```

**Frequência recomendada:** Uma vez por dia (00:00)

#### 3. **Failed Payment Retry Emails**

```typescript
// Encontra pagamentos com status 'failed' dos últimos 7 dias
// Envia email convidando para tentar novamente
// Registra atividade em SystemLog

sendFailedPaymentRetryEmails();
```

**Frequência recomendada:** A cada 12 horas

#### 4. **Executar Todos os Jobs**

```typescript
// Orquestra os 3 jobs acima em sequência
// Útil para cron job único que executa tudo

runAllRemarketingJobs();
```

### Como Configurar Cron Jobs

#### **Opção 1: Vercel Crons (Recomendado)**

1. Edite `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/remarketing",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

2. Deploy via Vercel - os crons serão automaticamente ativados

#### **Opção 2: GitHub Actions**

1. Crie `.github/workflows/cron.yml`:

```yaml
name: Remarketing Cron Jobs
on:
  schedule:
    - cron: '0 */6 * * *' # A cada 6 horas

jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Remarketing Jobs
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/remarketing \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

2. Adicione secrets no GitHub:
   - `APP_URL`: https://seu-dominio.com
   - `CRON_SECRET`: Mesmo valor do `.env.local`

#### **Opção 3: Agendador Externo (Uptime Kuma, EasyCron, etc)**

```bash
# Requisição HTTP
POST https://seu-dominio.com/api/cron/remarketing
Authorization: Bearer your-cron-secret
```

### Endpoint do Cron

```typescript
// POST /api/cron/remarketing

// Request
Headers: {
  "Authorization": "Bearer YOUR_CRON_SECRET"
}

// Response 200 OK
{
  "success": true,
  "message": "Remarketing jobs completed",
  "summary": {
    "overdueReminders": 5,
    "renewalReminders": 12,
    "failedPaymentReminders": 3
  }
}

// Response 401 Unauthorized
{
  "error": "Invalid cron secret"
}
```

### Monitoramento de Cron Jobs

Todos os cron jobs registram sua atividade na tabela `SystemLog`:

```typescript
// Ver logs no Admin Dashboard → System Logs

{
  "component": "cron-remarketing",
  "action": "overdue-invoice-reminders",
  "status": "success",
  "data": {
    "remindersCount": 5,
    "emailsSent": 5
  },
  "timestamp": "2025-12-08T10:30:00Z"
}
```

---

## 🚀 Próximos Passos

- [ ] Implementar dashboard de aluno com faturas
- [ ] Dashboard de professor com receita
- [ ] Página de histórico de pagamentos
- [ ] Refund/cancelamento de subscrições
- [ ] Relatórios financeiros avançados
- [ ] Integração com PIX (via Stripe)
- [ ] Suporte a múltiplas moedas
- [ ] SMS notifications para pagamentos (complemento de email)

---

## 🆘 Troubleshooting

### Webhook não recebendo eventos

- Confirme que `STRIPE_WEBHOOK_SECRET` está correto
- Verifique se a URL é acessível publicamente
- Teste com `stripe listen --forward-to localhost:3001/api/webhooks/stripe`

### Pagamento não criando enrollment

- Verifique se o curso existe
- Confirme que o usuário está autenticado
- Cheque os system logs para erros

### Preço não aparecendo no Stripe

- Confirme que `STRIPE_SECRET_KEY` está correto
- Verifique que o Price ID está no .env
- Teste com API do Stripe diretamente

### Cron job não está executando

- Verifique se `CRON_SECRET` está configurado
- Confirme que a URL do endpoint está correta
- Teste manualmente com `curl` para validar o endpoint
- Verifique os logs em Admin Dashboard → System Logs

### Emails não estão sendo enviados

- Valide se `RESEND_API_KEY` está correto
- Confirme que o email de origem (`noreply@smeducacional.com`) está verificado no Resend
- Teste a função manualmente em um script Node.js
- Verifique os logs de erro em System Logs

---

**Última atualização:** 8 de dezembro de 2025
