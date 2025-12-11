# 💳 Sistema de Pagamentos VisionVII - Análise & Roadmap Enterprise

**Status:** Infraestrutura Parcial | **Prioridade:** ALTA | **Última atualização:** 11 dez 2025

---

## 📊 Executive Summary

O sistema possui **infraestrutura base de pagamentos Stripe** implementada, mas **incompleta** para um modelo de negócio dual (professores vendem cursos + professores pagam mensalidade da plataforma).

### ✅ O Que Já Existe

1. **Schema Prisma robusto** com modelos: `Payment`, `Invoice`, `TeacherSubscription`, `StudentSubscription`, `CheckoutSession`, `StudentEnrollmentPayment`
2. **Helpers Stripe** (`src/lib/stripe.ts`): funções para criar checkouts de cursos e assinaturas
3. **Webhook handler** (`/api/webhooks/stripe`): processa eventos Stripe (checkout, invoices, subscriptions)
4. **3 fluxos de checkout** implementados:
   - `/api/checkout/course` - Aluno compra curso
   - `/api/checkout/student-subscription` - Aluno assina plano
   - `/api/checkout/teacher-subscription` - Professor assina plataforma
5. **Dashboard do professor** com input de preço básico (campo `price` em Float)

### ❌ O Que Está Faltando

#### **1. Pricing Strategy Avançado**

- ❌ Sem campo `compareAtPrice` (preço de/por)
- ❌ Sem suporte a cupons de desconto
- ❌ Sem pricing tiers (ex: early bird, standard, late)
- ❌ Sem campos de monetização: `commissionRate`, `teacherEarnings`, `platformFee`

#### **2. Feature Gating Incompleto**

- ✅ Campo `isPaid` existe no schema
- ❌ Lógica de feature gating (verificar se aluno pode acessar curso pago)
- ❌ Middleware para bloquear acesso a conteúdo não pago
- ❌ UI de "curso bloqueado" com CTA de checkout

#### **3. Dashboard de Pagamentos Ausente**

- ❌ Professores não veem earnings, comissões, histórico de vendas
- ❌ Alunos não veem histórico de compras, faturas
- ❌ Admin não tem painel financeiro consolidado

#### **4. Teacher Subscription Enforcement**

- ✅ Models `TeacherFinancial` e `TeacherSubscription` existem
- ❌ Lógica de bloqueio quando professor não paga mensalidade
- ❌ Feature gating por plano:
  - Free: max 10 alunos, 1GB storage
  - Basic: 50 alunos, 5GB, analytics básico
  - Premium: 200 alunos, 20GB, analytics completo, custom domain
  - Enterprise: ilimitado, white-label, suporte dedicado

#### **5. Webhook Coverage Parcial**

- ✅ `checkout.session.completed` - OK
- ✅ `customer.subscription.updated` - OK
- ✅ `invoice.payment_succeeded` - OK
- ❌ `payment_intent.succeeded` - falta
- ❌ `charge.refunded` - falta
- ❌ `customer.subscription.trial_will_end` - falta (alerta 3 dias antes)

#### **6. Emails Transacionais Incompletos**

- ✅ Email de sucesso de pagamento existe
- ❌ Email de falha de pagamento com retry
- ❌ Email de assinatura expirando (7 dias antes)
- ❌ Email de nota fiscal

---

## 🏗️ Arquitetura Proposta: Dual Payment System

### Fluxo 1: Aluno → Compra Curso (Marketplace)

```
┌─────────────────────────────────────────────────────────────┐
│  ALUNO VISUALIZA CURSO PAGO                                 │
│  - Página de curso mostra preço, compareAtPrice, CTAs       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  CHECKOUT (via Stripe Checkout Session)                     │
│  - /api/checkout/course POST                                │
│  - Cria session Stripe com metadata: {userId, courseId}     │
│  - Adiciona aplicação de cupom (opcional)                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  WEBHOOK: checkout.session.completed                        │
│  1. Criar Enrollment (aluno matriculado)                    │
│  2. Criar Payment record                                     │
│  3. Calcular split: 70% professor, 30% plataforma           │
│  4. Criar Invoice para aluno                                │
│  5. Criar TeacherEarnings record                            │
│  6. Enviar email de confirmação + nota fiscal               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  ALUNO ACESSA CONTEÚDO                                      │
│  - Middleware verifica Enrollment.status === ACTIVE         │
│  - Player de vídeo liberado                                 │
│  - Progress tracking habilitado                             │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo 2: Professor → Paga Mensalidade (SaaS Subscription)

```
┌─────────────────────────────────────────────────────────────┐
│  PROFESSOR ESCOLHE PLANO                                    │
│  - /teacher/subscription                                     │
│  - Planos: Free, Basic (R$ 49/mês), Premium (R$ 99/mês),   │
│            Enterprise (R$ 249/mês)                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  CHECKOUT (via Stripe Subscription)                         │
│  - /api/checkout/teacher-subscription POST                  │
│  - Cria subscription Stripe com Price ID do plano           │
│  - Metadata: {userId, plan, type: 'teacher_subscription'}   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  WEBHOOK: customer.subscription.created                     │
│  1. Atualizar TeacherSubscription (status: active)          │
│  2. Atualizar TeacherFinancial com features do plano        │
│  3. Criar Payment record                                     │
│  4. Enviar email de boas-vindas com benefícios              │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  FEATURE GATING APLICADO                                    │
│  - Middleware verifica subscription.status                   │
│  - Limita upload de vídeos por storage                      │
│  - Bloqueia criação de curso se maxStudents atingido        │
│  - Dashboard analytics só para Premium+                     │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  COBRANÇA RECORRENTE (mensal)                               │
│  - Stripe cobra automaticamente                             │
│  - WEBHOOK: invoice.payment_succeeded → criar Payment       │
│  - WEBHOOK: invoice.payment_failed → suspender conta        │
│  - Email 7 dias antes de expirar trial                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Roadmap de Implementação (High-Level Enterprise)

### **FASE 1: Pricing & Monetization Core** (Prioridade: CRÍTICA)

#### 1.1 Schema Enhancements

```prisma
model Course {
  // ... campos existentes

  // Pricing avançado
  price             Float?
  compareAtPrice    Float?    // Preço "De"
  discountPercent   Int?      // Calculado automaticamente
  commissionRate    Float     @default(0.70) // 70% para professor
  platformFee       Float     @default(0.30) // 30% para plataforma

  // Monetização
  revenue           Float     @default(0)
  totalSales        Int       @default(0)

  // Coupons
  coupons           CourseCoupon[]
}

model CourseCoupon {
  id          String   @id @default(cuid())
  courseId    String
  code        String   @unique
  discount    Float    // valor ou percentual
  discountType String  // percentage, fixed
  maxUses     Int?
  usedCount   Int      @default(0)
  expiresAt   DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  course      Course   @relation(fields: [courseId], references: [id])

  @@index([courseId])
  @@index([code])
}

model TeacherEarnings {
  id              String   @id @default(cuid())
  teacherId       String
  paymentId       String   @unique
  courseId        String

  // Valores
  grossAmount     Float    // Valor bruto da venda
  commission      Float    // % do professor (70%)
  platformFee     Float    // % da plataforma (30%)
  netAmount       Float    // Quanto o professor recebe

  // Status
  status          String   @default("pending") // pending, available, paid, held
  availableAt     DateTime // Disponível após 14 dias (chargeback protection)
  paidAt          DateTime?

  // Payout
  stripeTransferId String?

  createdAt       DateTime @default(now())

  teacher         User     @relation(fields: [teacherId], references: [id])
  payment         Payment  @relation(fields: [paymentId], references: [id])
  course          Course   @relation(fields: [courseId], references: [id])

  @@index([teacherId])
  @@index([status])
}
```

#### 1.2 Dashboard de Precificação (/teacher/courses/[id]/pricing)

- Input `price` (requerido)
- Input `compareAtPrice` (opcional, mostra "De R$ X por R$ Y")
- Toggle `isPaid`
- Calculadora de comissão em tempo real
- Preview de como aparecerá na landing page

#### 1.3 API: `/api/teacher/courses/[id]/pricing` (PUT)

- Validação Zod: `price >= 0`, `compareAtPrice > price`
- Atualização dos campos no banco
- Retorno com earnings simulados

---

### **FASE 2: Feature Gating & Access Control** (Prioridade: ALTA)

#### 2.1 Middleware de Acesso a Cursos Pagos

```typescript
// src/middleware/courseAccess.ts
export async function canAccessCourse(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { isPaid: true, price: true },
  });

  // Curso gratuito
  if (!course?.isPaid || !course.price || course.price === 0) {
    return { allowed: true };
  }

  // Verificar enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId: userId, courseId },
    },
    select: { status: true },
  });

  if (enrollment?.status === 'ACTIVE') {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'course_not_purchased',
    course,
  };
}
```

#### 2.2 UI de Curso Bloqueado

- Componente `<LockedCourseCard>` com:
  - Thumbnail com overlay escurecido
  - Ícone de cadeado
  - Preço destacado
  - Botão "Comprar Curso" → redireciona para checkout

#### 2.3 Player de Vídeo com Paywall

- Antes de renderizar `<VideoPlayer>`, chamar `canAccessCourse()`
- Se bloqueado, mostrar preview (2 min gratuitos) + modal de upgrade

---

### **FASE 3: Teacher Subscription Enforcement** (Prioridade: ALTA)

#### 3.1 Feature Gating Service

```typescript
// src/lib/subscription.ts (JÁ EXISTE, EXPANDIR)

export async function canCreateCourse(userId: string) {
  const teacher = await prisma.teacherFinancial.findUnique({
    where: { userId },
    select: { subscriptionStatus, plan, maxStudents },
  });

  if (teacher?.subscriptionStatus !== 'active') {
    return { allowed: false, reason: 'subscription_inactive' };
  }

  // Contar cursos ativos
  const courseCount = await prisma.course.count({
    where: { instructorId: userId, isPublished: true },
  });

  const limits = {
    free: 1,
    basic: 5,
    premium: 20,
    enterprise: Infinity,
  };

  if (courseCount >= limits[teacher.plan]) {
    return { allowed: false, reason: 'course_limit_reached' };
  }

  return { allowed: true };
}

export async function canUploadVideo(userId: string, fileSizeMB: number) {
  const teacher = await prisma.teacherFinancial.findUnique({
    where: { userId },
    select: { maxStorage, plan },
  });

  // Calcular storage usado
  const usedStorage = await calculateUsedStorage(userId);

  if (usedStorage + fileSizeMB > teacher.maxStorage) {
    return {
      allowed: false,
      reason: 'storage_limit_exceeded',
      used: usedStorage,
      max: teacher.maxStorage,
    };
  }

  return { allowed: true };
}
```

#### 3.2 Middleware de Subscription

- Proteger rotas `/teacher/*` (exceto `/teacher/subscription`)
- Se `subscriptionStatus !== 'active'`, redirecionar para `/teacher/subscription/upgrade`

#### 3.3 Dashboard `/teacher/subscription`

- Plano atual com features desbloqueadas
- Uso de limites (alunos, storage, cursos)
- Botão "Upgrade" → redireciona para checkout
- Histórico de pagamentos

---

### **FASE 4: Dashboards Financeiros** (Prioridade: MÉDIA)

#### 4.1 `/teacher/earnings` - Dashboard do Professor

- **KPIs:**
  - Ganhos totais (lifetime)
  - Ganhos do mês atual
  - Saldo disponível para saque
  - Saldo pendente (14 dias de hold)
- **Tabela de Transações:**
  - Data, Curso, Valor bruto, Comissão, Líquido, Status
- **Gráfico:** Ganhos por mês (últimos 12 meses)
- **Botão:** "Solicitar Saque" (via Stripe Connect)

#### 4.2 `/student/purchases` - Histórico do Aluno

- Lista de cursos comprados
- Notas fiscais (download PDF)
- Assinatura ativa (se houver)
- Botão "Cancelar Assinatura"

#### 4.3 `/admin/financeiro` - Painel Admin

- **Overview:**
  - Receita total (cursos + assinaturas de professores)
  - Comissão da plataforma (30% das vendas de curso)
  - Assinaturas ativas de professores
  - MRR (Monthly Recurring Revenue)
- **Tabelas:**
  - Top 10 cursos mais vendidos
  - Professores com maior receita
  - Assinaturas expirando nos próximos 7 dias

---

### **FASE 5: Webhook Hardening & Email Flows** (Prioridade: MÉDIA)

#### 5.1 Novos Webhooks

```typescript
// src/app/api/webhooks/stripe/route.ts

case 'payment_intent.succeeded': {
  // Backup para quando checkout.session.completed não dispara
  await handlePaymentIntentSucceeded(event.data.object);
  break;
}

case 'charge.refunded': {
  // Cancelar enrollment + enviar email de reembolso
  await handleChargeRefunded(event.data.object);
  break;
}

case 'customer.subscription.trial_will_end': {
  // Email 3 dias antes de trial expirar
  await sendTrialExpiringEmail(event.data.object);
  break;
}

case 'invoice.upcoming': {
  // Email 7 dias antes da cobrança recorrente
  await sendUpcomingInvoiceEmail(event.data.object);
  break;
}
```

#### 5.2 Templates de Email (Resend)

- `payment-success.tsx` - ✅ Já existe
- `payment-failed.tsx` - ❌ Criar
- `subscription-expiring.tsx` - ❌ Criar
- `invoice-receipt.tsx` - ❌ Criar
- `trial-ending-soon.tsx` - ❌ Criar

---

### **FASE 6: Coupons & Promoções** (Prioridade: BAIXA)

#### 6.1 `/teacher/courses/[id]/coupons` - Gestão de Cupons

- Criar cupons de desconto (%, valor fixo)
- Definir data de expiração
- Limitar número de usos
- Dashboard de cupons mais usados

#### 6.2 API: `/api/checkout/validate-coupon` (POST)

- Body: `{ courseId, couponCode }`
- Retorna: `{ valid: boolean, discount, newPrice }`
- Stripe Checkout Session inclui `discounts` array

---

## 🔐 Considerações de Segurança

### Webhook Security

- ✅ Assinatura Stripe verificada (`stripe.webhooks.constructEvent`)
- ✅ Idempotência: verificar se Payment já existe antes de criar
- ⚠️ Rate limiting: adicionar para evitar spam

### Payment Fraud Prevention

- Implementar Stripe Radar (detecção automática de fraude)
- Hold de 14 dias para ganhos de professor (chargeback protection)
- Limitar tentativas de pagamento falhas (3 max)

### PCI Compliance

- ✅ Stripe Checkout (hosted) - PCI Level 1 compliant
- ❌ Nunca armazenar dados de cartão no banco

---

## 📈 Métricas de Sucesso

### KPIs Críticos

1. **Conversion Rate:** % de visitantes que compram curso (meta: 2-5%)
2. **Average Order Value (AOV):** Ticket médio de compra (meta: R$ 150)
3. **Teacher MRR:** Receita recorrente de assinaturas de professores (meta: R$ 10k/mês)
4. **Platform Revenue:** 30% das vendas de curso + 100% das subs de professor
5. **Churn Rate:** % de professores que cancelam assinatura (meta: <5%/mês)

### Monitoramento

- Dashboard de métricas em `/admin/analytics`
- Alertas via email quando:
  - Payment failed > 10% das transações
  - MRR cai >15% no mês
  - Webhook failures > 5% dos eventos

---

## 🚀 Quick Wins (Implementar Primeiro)

### 1. Campo `compareAtPrice` no Dashboard do Professor (4h)

- Adicionar input em `/teacher/courses/[id]/edit`
- Atualizar API de update course
- Mostrar "De/Por" na landing page

### 2. Feature Gating Básico para Cursos Pagos (8h)

- Middleware `canAccessCourse()`
- Componente `<LockedCourseCard>`
- Redirecionar para checkout se não comprou

### 3. Dashboard de Earnings Simples (12h)

- `/teacher/earnings` com saldo disponível
- Tabela de transações (últimos 30 dias)
- Query no banco: `SUM(netAmount) WHERE teacherId`

---

## 📚 Referências Técnicas

### Stripe Docs

- [Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Connect (Payouts)](https://stripe.com/docs/connect)

### Arquiteturas de Referência

- [Gumroad](https://gumroad.com) - Marketplace de criadores
- [Teachable](https://teachable.com) - Plataforma de cursos SaaS
- [Hotmart](https://hotmart.com) - Split payment 70/30

### Compliance

- [Lei Geral de Proteção de Dados (LGPD)](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [Nota Fiscal Eletrônica](https://www.nfe.fazenda.gov.br/)
- [Stripe Radar](https://stripe.com/radar) - Fraud detection

---

## ✅ Checklist de Deploy

Antes de ir para produção:

- [ ] Webhook secret configurado em `.env`
- [ ] Stripe Price IDs criados para todos os planos
- [ ] Teste E2E: comprar curso → webhook → enrollment criado
- [ ] Teste E2E: assinar plano professor → feature gating aplicado
- [ ] Monitoramento de webhooks em `/admin/webhooks/logs`
- [ ] Rate limiting em endpoints de checkout (10 req/min por IP)
- [ ] Emails de confirmação funcionando (Resend)
- [ ] Dashboard de earnings acessível
- [ ] Stripe Connect configurado (payouts para professores)
- [ ] Backup diário do banco (Payment e Invoice são críticos)

---

**Desenvolvido com excelência pela VisionVII** — Sistema de Pagamentos Enterprise para Plataforma EJA.

**Próximos Passos:**  
→ Priorizar **FASE 1** (Pricing Core) + **Quick Win #2** (Feature Gating)  
→ Implementar em sprint de 2 semanas  
→ Deploy incremental com feature flags
