# 🔐 Feature Unlock System - Guia Completo

Sistema de controle de acesso a features baseado no plano de pagamento do professor.

## 📋 O que foi implementado

### 1. **Schema Expandido** (`prisma/schema.prisma`)

```prisma
model TeacherFinancial {
  // ... campos existentes ...

  // ✨ NOVO: Billing & Subscription
  subscriptionStatus    String       // active, inactive, trial, suspended
  plan                  String       // free, basic, premium, enterprise
  subscriptionStartDate DateTime?
  subscriptionExpiresAt DateTime?
  trialEndsAt          DateTime?
  lastPaymentDate      DateTime?
  paymentMethod        String?
  maxStudents          Int
  maxStorage           Int
  canUploadLogo        Boolean
  canCustomizeDomain   Boolean
  canAccessAnalytics   Boolean
}
```

### 2. **Lógica de Planos** (`src/lib/subscription.ts`)

- `getTeacherAccessControl(userId)` - Retorna acesso completo com feature flags
- `canAccessFeature(userId, feature)` - Verifica feature específica
- `hasActivePlan(userId)` - Verifica se plano está ativo
- `activatePlan(userId, plan, days)` - Ativa plano (para integração com Stripe)
- `activateTrial(userId, days)` - Ativa trial de 7 dias
- `cancelPlan(userId)` - Cancela plano

#### Planos Configurados:

| Plano      | Alunos | Storage | Logo | Domínio | Analytics | Pagamentos |
| ---------- | ------ | ------- | ---- | ------- | --------- | ---------- |
| Free       | 10     | 1GB     | ❌   | ❌      | ❌        | ❌         |
| Basic      | 50     | 10GB    | ✅   | ❌      | ✅        | ❌         |
| Premium    | 300    | 100GB   | ✅   | ✅      | ✅        | ❌         |
| Enterprise | 10k    | 1TB     | ✅   | ✅      | ✅        | ✅         |

### 3. **Hooks Reutilizáveis** (`src/hooks/useCanAccess.ts`)

#### `useCanAccess()` - Acesso Completo

```tsx
const { access, loading, error } = useCanAccess();
// access.plan, access.isActive, access.canUploadLogo, etc
```

#### `useFeatureAccess(feature)` - Verificação Única

```tsx
const canUpload = useFeatureAccess('canUploadLogo');
if (!canUpload) return <UpgradePrompt />;
```

#### `usePlanInfo()` - Informações do Plano

```tsx
const { plan, daysUntilExpiry, isActive } = usePlanInfo();
```

#### `<FeatureGate>` - Componente Wrapper

```tsx
<FeatureGate feature="canUploadLogo" fallback={<UpgradePrompt />}>
  <LogoUploadForm />
</FeatureGate>
```

### 4. **API Route com Guards** (`src/app/api/teacher/access-control/route.ts`)

```bash
GET /api/teacher/access-control
# Retorna acesso completo do usuário autenticado
```

### 5. **Exemplo de Rota Protegida** (`src/app/api/teacher/branding/logo/route.ts`)

```bash
POST /api/teacher/branding/logo
# Upload de logo (requer canUploadLogo)
# Retorna 402 Payment Required se sem acesso

GET /api/teacher/branding/logo?teacherId=xxx
# Fetch público de logo (sem auth)
```

### 6. **Componente UI** (`src/components/branding-customization.tsx`)

Exemplo completo com:

- Status do plano
- Comparação de features
- Feature gates em ação
- Upload form protegido

## 🚀 Como Usar

### Usar Hook para Verificar Feature

```tsx
'use client';
import { useFeatureAccess } from '@/hooks/useCanAccess';

export function LogoUploader() {
  const canUpload = useFeatureAccess('canUploadLogo');

  if (!canUpload) {
    return <div>Upgrade necessário para upload</div>;
  }

  return <UploadForm />;
}
```

### Proteger API Route

```ts
import { getTeacherAccessControl } from '@/lib/subscription';

export async function POST(request: Request) {
  const session = await auth();
  const access = await getTeacherAccessControl(session.user.id);

  if (!access.canUploadLogo) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 402 } // Payment Required
    );
  }

  // Processar upload...
}
```

### Usar FeatureGate Componente

```tsx
<FeatureGate
  feature="canCustomizeDomain"
  fallback={<UpgradeCard plan="premium" />}
>
  <DomainCustomizer />
</FeatureGate>
```

### Ativar Plano (Integração Stripe)

```ts
// Após receber webhook do Stripe com sucesso de pagamento
await activatePlan(userId, 'premium', 30); // 30 dias

// Ou trial
await activateTrial(userId, 7); // 7 dias
```

## 📊 Configurar Novo Plan

1. Adicionar em `PLAN_FEATURES` em `subscription.ts`:

```ts
custom: {
  plan: "custom",
  maxStudents: 100,
  maxStorageGB: 50,
  canUploadLogo: true,
  canCustomizeDomain: false,
  // ... outras features
}
```

2. Atualizar type `PlanType`:

```ts
export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise' | 'custom';
```

3. Pronto! Tudo funciona automaticamente.

## 🧪 Testar

### Executar Suite de Testes

```bash
npx ts-node scripts/test-feature-unlock.ts
```

Testa:

- ✅ Free plan (padrão)
- ✅ Trial activation
- ✅ Plan upgrades
- ✅ Feature access
- ✅ Plan expiration
- ✅ Plan cancellation

### Testar Manual no Banco

```sql
-- Ativar plan premium para um professor
UPDATE teacher_financial
SET
  subscription_status = 'active',
  plan = 'premium',
  subscription_expires_at = NOW() + INTERVAL '30 days',
  can_upload_logo = true,
  can_customize_domain = true,
  can_access_analytics = true
WHERE user_id = 'seu-user-id';

-- Verificar status
SELECT
  subscription_status,
  plan,
  subscription_expires_at,
  can_upload_logo,
  can_customize_domain
FROM teacher_financial
WHERE user_id = 'seu-user-id';
```

## 📡 Integração com Stripe

### Webhook Handler

```ts
export async function handleStripeWebhook(event: Stripe.Event) {
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;
    await activatePlan(
      subscription.metadata.userId,
      subscription.metadata.plan as PlanType,
      30
    );
  }

  if (event.type === 'customer.subscription.deleted') {
    await cancelPlan(subscription.metadata.userId);
  }
}
```

### Checkout Button

```tsx
async function handleUpgrade(plan: PlanType) {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });

  const { url } = await response.json();
  window.location.href = url;
}
```

## 🔒 Segurança

### Validações em Múltiplas Camadas

1. **Client-Side**: Hook retorna feature flag
2. **Server-Side**: API route verifica novamente antes de processar
3. **Database**: Timestamp de expiração força vencimento mesmo se falhar server

### Status Code Correto

- `401`: Não autenticado
- `402`: Plano inativo/expirado (Payment Required)
- `403`: Feature não disponível para este plano

## 📈 Monitoramento

### Verificar Planos Expirando

```sql
SELECT
  u.name,
  tf.plan,
  tf.subscription_expires_at,
  (tf.subscription_expires_at - NOW()) as time_remaining
FROM teacher_financial tf
JOIN users u ON u.id = tf.user_id
WHERE tf.subscription_status = 'active'
  AND tf.subscription_expires_at < NOW() + INTERVAL '7 days'
ORDER BY tf.subscription_expires_at;
```

### Estatísticas de Planos

```sql
SELECT
  plan,
  COUNT(*) as total,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active
FROM teacher_financial
GROUP BY plan;
```

## 🎯 Próximos Passos

1. **✅ Schema & Lógica**: Completo
2. **✅ Hooks & Components**: Completo
3. **⏳ Integração Stripe**: Criar webhook handler
4. **⏳ Admin Dashboard**: Gerenciar planos manualmente
5. **⏳ Email Notifications**: Aviso de expiração
6. **⏳ Analytics**: Rastrear upgrade/cancellation rate

## 📚 Arquivos Modificados/Criados

```
prisma/
  └── schema.prisma                    # ✨ TeacherFinancial expandido

src/
  ├── lib/
  │   └── subscription.ts              # 🆕 Lógica de planos
  │
  ├── hooks/
  │   └── useCanAccess.ts              # 🆕 Hooks reutilizáveis
  │
  ├── components/
  │   └── branding-customization.tsx   # 🆕 Exemplo UI completo
  │
  └── app/api/teacher/
      ├── access-control/
      │   └── route.ts                 # 🆕 API de access control
      │
      └── branding/logo/
          └── route.ts                 # 🆕 Exemplo rota protegida

scripts/
  └── test-feature-unlock.ts           # 🆕 Suite de testes
```

## ❓ FAQ

**P: Como o sistema verifica expiração?**
R: A função `getTeacherAccessControl()` sempre compara `subscriptionExpiresAt` com `NOW()`. Mesmo que o servidor fique "preso" em status ativo, o acesso é bloqueado automaticamente.

**P: Posso ter múltiplos plans ao mesmo tempo?**
R: Não - `TeacherFinancial` tem `userId @unique`. Mas você pode implementar histórico em tabela separada se precisar.

**P: Como integrar com múltiplas payment gateways?**
R: Adicione `paymentMethod` ao schema (já existe) e direcione webhooks com base nisso:

```ts
if (subscription.provider === 'stripe') handleStripe(subscription);
if (subscription.provider === 'pix') handlePix(subscription);
```

**P: Posso dar features grátis para usuários antigos?**
R: Sim! Use migrations Prisma para set `canUploadLogo = true` para free users com `createdAt < '2024-01-01'`.
