# 💰 Sistema de Monetização VisionVII - Documentação Técnica

## 🎯 Visão Geral

A VisionVII utiliza um modelo de monetização baseado em **3 camadas** que beneficia todos os atores do ecossistema:

```
┌─────────────────────────────────────────────────────────┐
│                    ALUNO (FREE ou PREMIUM)              │
│         Acessa cursos, vê anúncios (se free)            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├─ Paga Professor (Curso Premium)
                   │
                   └─ Vê Anúncios (Plano Free)
                              ↓
┌──────────────────────────────────────────────────────────┐
│         PROFESSOR (Cria cursos, ganha com alunos)       │
│  Recebe 40% de cada venda + Pode pagar para remover ads │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ├─ Paga Admin (Plano Premium)
                   │
                   └─ Bloqueia Anúncios em seus cursos
                              ↓
┌──────────────────────────────────────────────────────────┐
│     ADMIN (Gerencia plataforma, monetiza com ads)       │
│  Recebe 30% comissão + Receita de anúncios (CPM/CPC)    │
└──────────────────────────────────────────────────────────┘
```

---

## 💳 1. Fluxo de Pagamento - Aluno → Professor

### **Cenário:** Aluno entra em um curso e paga

```
┌──────────────────┐
│ Aluno paga R$100 │
│   (via Stripe)   │
└────────┬─────────┘
         │
         ▼
    [STRIPE PROCESSA]
    Retém 2.9% + R$0.30 (taxa)
    Desconto: R$3.20
    Restante: R$96.80
         │
         ▼
    [DISTRIBUIÇÃO]
    ├─ Professor: R$38.72 (40%)
    ├─ Admin:     R$29.04 (30%)
    └─ Plataforma: R$29.04 (30%)
         │
         ▼
    [Crédito em conta]
```

### **Código de Implementação:**

```typescript
// src/lib/monetization.ts

interface PaymentDistribution {
  studentPaid: number;
  stripeFee: number;
  netAmount: number;
  teacherShare: number; // 40%
  adminShare: number; // 30%
  platformShare: number; // 30%
}

export function distributePayment(amount: number): PaymentDistribution {
  const stripeFeePercent = 0.029;
  const stripeFeeFixed = 0.3;

  const stripeFee = amount * stripeFeePercent + stripeFeeFixed;
  const netAmount = amount - stripeFee;

  return {
    studentPaid: amount,
    stripeFee,
    netAmount,
    teacherShare: netAmount * 0.4, // Professor
    adminShare: netAmount * 0.3, // Admin
    platformShare: netAmount * 0.3, // Plataforma
  };
}

// Exemplo:
const distribution = distributePayment(100);
console.log(distribution);
/*
{
  studentPaid: 100,
  stripeFee: 3.20,
  netAmount: 96.80,
  teacherShare: 38.72,    // Vai para conta do professor
  adminShare: 29.04,      // Vai para conta do admin
  platformShare: 29.04,   // Retém para operação
}
*/
```

---

## 💎 2. Fluxo de Pagamento - Professor → Admin (Plano Premium)

### **Cenário:** Professor paga para remover anúncios

```
┌─────────────────────────────┐
│ Professor paga R$29.90/mês  │
│   (Plano Premium)           │
│   (via Stripe)              │
└────────┬────────────────────┘
         │
         ▼
    [STRIPE PROCESSA]
    Retém 2.9% + R$0.30 (taxa)
    Desconto: R$1.17
    Restante: R$28.73
         │
         ▼
    [ADMIN RECEBE]
    Admin: R$28.73
         │
         ▼
    [ATIVAÇÃO]
    - Bloqueia anúncios dos cursos do professor
    - Certificado: "Premium Teacher"
    - Sem limite de estudantes
```

### **Código de Implementação:**

```typescript
// Criar assinatura premium do professor

interface TeacherSubscription {
  teacherId: string;
  planType: 'FREE' | 'PREMIUM';
  monthlyPrice: number; // 29.90
  stripeSubscriptionId: string;
  startDate: Date;
  renewalDate: Date;
  isActive: boolean;
  adBlockingEnabled: boolean;
}

export async function createTeacherSubscription(
  teacherId: string
): Promise<TeacherSubscription> {
  // 1. Criar subscription no Stripe
  const subscription = await stripe.subscriptions.create({
    customer: teacherId,
    items: [{ price: process.env.STRIPE_TEACHER_PREMIUM_PRICE_ID }],
    payment_behavior: 'default_incomplete',
  });

  // 2. Salvar no banco de dados
  const dbSubscription = await prisma.teacherSubscription.create({
    data: {
      teacherId,
      planType: 'PREMIUM',
      monthlyPrice: 29.9,
      stripeSubscriptionId: subscription.id,
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      adBlockingEnabled: true, // ← Ativa bloqueio de anúncios
    },
  });

  // 3. Atualizar todos os cursos do professor para bloquear anúncios
  await prisma.course.updateMany({
    where: { teacherId },
    data: { adsDisabled: true },
  });

  return dbSubscription;
}

// Cancelar subscription
export async function cancelTeacherSubscription(
  teacherId: string
): Promise<void> {
  // 1. Cancelar no Stripe
  const subscription = await prisma.teacherSubscription.findFirst({
    where: { teacherId },
  });

  await stripe.subscriptions.del(subscription.stripeSubscriptionId);

  // 2. Atualizar banco
  await prisma.teacherSubscription.update({
    where: { id: subscription.id },
    data: { isActive: false, adBlockingEnabled: false },
  });

  // 3. Reativar anúncios nos cursos
  await prisma.course.updateMany({
    where: { teacherId },
    data: { adsDisabled: false },
  });
}
```

---

## 📺 3. Sistema de Anúncios (CPM/CPC)

### **Como gera receita:**

```
ALUNO (FREE) vê vídeo com anúncios
        ↓
   [AD IMPRESSION]
   (CPM: Cost Per Mille)
   $2-5 por 1000 visualizações
        ↓
   Se clica no anúncio:
   [AD CLICK]
   (CPC: Cost Per Click)
   $0.50-2 por clique
        ↓
   ADMIN recebe receita
```

### **Métricas:**

```typescript
interface AdMetrics {
  impressions: number; // Visualizações
  clicks: number; // Cliques
  conversions: number; // Conversões (vendas)
  cpmRate: number; // $3.50 / 1000 impressões
  cpcRate: number; // $1.00 / clique
}

function calculateAdRevenue(metrics: AdMetrics): number {
  const cpmRevenue = (metrics.impressions / 1000) * metrics.cpmRate;
  const cpcRevenue = metrics.clicks * metrics.cpcRate;
  return cpmRevenue + cpcRevenue;
}

// Exemplo:
const metrics = {
  impressions: 10000, // 10k visualizações
  clicks: 150, // 150 cliques
  conversions: 5, // 5 conversões
  cpmRate: 3.5,
  cpcRate: 1.0,
};

const revenue = calculateAdRevenue(metrics);
// (10000 / 1000) * 3.50 = $35
// 150 * 1.00 = $150
// Total = $185
```

---

## 📊 4. Dashboard Financeiro (Dados exibidos)

### **Admin Dashboard - `/admin/dashboard`**

```
┌─────────────────────────────────────────┐
│        RECEITA TOTAL DO MÊS              │
│              R$ 15.000,00                │
├─────────────────────────────────────────┤
│  De Aluno → Professor:   R$ 8.000,00    │
│  De Professor → Admin:   R$ 2.500,00    │
│  De Anúncios (CPM/CPC): R$ 4.500,00    │
├─────────────────────────────────────────┤
│  DISTRIBUIÇÃO:                           │
│  ├─ Admin:     R$ 5.000,00 (comissão)   │
│  ├─ Professor: R$ 3.200,00 (40% vendas) │
│  └─ Plataforma:R$ 6.800,00 (operação)   │
└─────────────────────────────────────────┘
```

### **Teacher Dashboard - `/teacher/dashboard`**

```
┌─────────────────────────────────────────┐
│         SEUS GANHOS ESTE MÊS             │
│              R$ 2.400,00                 │
├─────────────────────────────────────────┤
│  De Alunos:        R$ 2.500,00          │
│  Comissão admin:   -R$ 750,00           │
│  Pós taxas Stripe: -R$ 75,00            │
│  SALDO:            R$ 1.675,00          │
├─────────────────────────────────────────┤
│  Seu Plano: PREMIUM (sem anúncios)      │
│  Custo: R$ 29,90/mês                    │
│  Próxima renovação: 13/01/2026          │
└─────────────────────────────────────────┘
```

### **Student Dashboard - `/student/dashboard`**

```
┌─────────────────────────────────────────┐
│         SEUS CURSOS (PLANO FREE)        │
├─────────────────────────────────────────┤
│  1. Python 101 - 45% completo            │
│  2. JavaScript - 82% completo            │
│  3. React Avançado - 10% completo        │
├─────────────────────────────────────────┤
│  ℹ️  Seu plano inclui anúncios            │
│  Atualize para Premium para removê-los   │
│  Upgrade por R$ 9,90/mês                │
└─────────────────────────────────────────┘
```

---

## 🔗 5. Webhook de Pagamento (Stripe)

### **Evento: `customer.subscription.created`**

```typescript
// POST /api/webhooks/stripe

export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;

    // 1. Identificar se é professor ou aluno
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: subscription.customer },
    });

    if (user.role === 'TEACHER') {
      // 2. Ativar plano premium do professor
      await createTeacherSubscription(user.id);
    } else if (user.role === 'STUDENT') {
      // 2. Marcar aluno como premium
      await prisma.user.update({
        where: { id: user.id },
        data: { planType: 'PREMIUM' },
      });
    }

    // 3. Registrar no banco para analytics
    await prisma.paymentLog.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_CREATED',
        amount: subscription.items.data[0].price.unit_amount / 100,
        status: 'SUCCESS',
      },
    });
  }

  return NextResponse.json({ received: true });
}
```

---

## 💳 6. Modelos Prisma para Monetização

```prisma
// prisma/schema.prisma

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  name          String
  role          Role       // STUDENT, TEACHER, ADMIN
  planType      PlanType   @default(FREE)  // FREE, PREMIUM

  // Stripe
  stripeCustomerId    String?  @unique
  stripeSubscriptionId String?

  // Financeiro
  totalEarned   Float      @default(0)
  totalSpent    Float      @default(0)

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  courses       Course[]
  enrollments   Enrollment[]
  subscriptions TeacherSubscription[]
  paymentLogs   PaymentLog[]
}

model TeacherSubscription {
  id                    String   @id @default(cuid())
  teacherId             String
  teacher               User     @relation(fields: [teacherId], references: [id], onDelete: Cascade)

  planType              String   @default("PREMIUM")
  monthlyPrice          Float    @default(29.90)
  stripeSubscriptionId  String

  isActive              Boolean  @default(true)
  adBlockingEnabled     Boolean  @default(true)

  startDate             DateTime @default(now())
  renewalDate           DateTime
  cancelledDate         DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model PaymentLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        PaymentType  // COURSE_PURCHASE, SUBSCRIPTION, REFUND
  amount      Float
  stripeId    String
  status      PaymentStatus // PENDING, SUCCESS, FAILED

  fromUser    String?  // Quem pagou (student id)
  toUser      String?  // Quem recebeu (teacher id)

  createdAt   DateTime @default(now())
}

model AdMetrics {
  id              String   @id @default(cuid())
  courseId        String
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  impressions     Int      @default(0)
  clicks          Int      @default(0)
  conversions     Int      @default(0)

  estimatedRevenue Float   @default(0)

  date            DateTime @default(now())
}

enum PlanType {
  FREE
  PREMIUM
}

enum PaymentType {
  COURSE_PURCHASE
  SUBSCRIPTION
  REFUND
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}
```

---

## 🎯 7. APIs de Monetização

### **GET `/api/admin/revenue`**

```typescript
// Retorna receita total e distribuição

interface RevenueResponse {
  total: number;
  bySource: {
    coursesSales: number;
    subscriptions: number;
    ads: number;
  };
  distribution: {
    admin: number;
    teachers: number;
    platform: number;
  };
  period: {
    from: Date;
    to: Date;
  };
}
```

### **GET `/api/teacher/earnings`**

```typescript
// Retorna ganhos do professor

interface TeacherEarningsResponse {
  total: number;
  fromSales: number;
  subscription: {
    isActive: boolean;
    monthlyPrice: number;
    nextRenewal: Date;
  };
  breakdown: {
    grossSales: number;
    stripeFee: number;
    adminCommission: number;
    net: number;
  };
}
```

### **POST `/api/student/upgrade-premium`**

```typescript
// Aluno faz upgrade para Premium

interface UpgradeRequest {
  paymentMethodId: string;
}

interface UpgradeResponse {
  success: boolean;
  subscription: {
    id: string;
    planType: 'PREMIUM';
    adsDisabled: boolean;
    expiryDate: Date;
  };
}
```

---

## 📈 8. Relatórios Analytics

### **MRR (Monthly Recurring Revenue)**

```
MRR = Total de subscriptions ativas × preço mensal
MRR = (50 teachers × $29.90) + (200 students × $9.90)
MRR = $1.495 + $1.980 = $3.475
```

### **LTV (Lifetime Value)**

```
LTV = Valor médio de transação × Número médio de transações × Vida útil
LTV = $40 × 3 × 12 meses = $1.440
```

### **CAC (Customer Acquisition Cost)**

```
CAC = Custo total de marketing / Novos clientes
CAC = $500 / 50 = $10 por usuário
```

---

## 🔒 9. Conformidade e Segurança

- ✅ PCI-DSS compliant (Stripe)
- ✅ Sem armazenamento de dados de cartão
- ✅ Webhooks verificados
- ✅ Rate limiting em endpoints de pagamento
- ✅ Logs auditáveis de todas as transações
- ✅ LGPD compliant (dados de pagamento)

---

**Desenvolvido com excelência pela VisionVII** — Transformando educação através da tecnologia.

Victor Hugo | visionvidevgri@proton.me
