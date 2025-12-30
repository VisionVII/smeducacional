# 🎯 MISSÃO: REFACTOR PHASE 4 — SM Educa Evolution

**Data:** 30 de dezembro de 2025  
**Orquestrador:** Copilot Central  
**Status:** 🟡 EM EXECUÇÃO  
**Prioridade:** 🔴 ALTA

---

## 📋 OVERVIEW DA MISSÃO

Refatoração estratégica do SM Educa para:

1. Simplificar navegação Admin
2. Estabilizar hidratação
3. Implementar Social Hub e Broadcasting
4. Ativar Feature Gating (bloqueio de premium features)

---

## 🏗️ MISSÃO 1: ALINHAMENTO DE ROTAS E LIMPEZA

**Responsável:** [@ArchitectAI]  
**Prioridade:** P0 (Blocker para UX)  
**Estimativa:** 2-3 horas

### 📌 Objetivo

Reorganizar sidebar Admin em grupos lógicos, eliminar redundâncias e garantir consistência de redirecionamento de roles.

### 🎯 Deliverables

#### 1.1. Nova Estrutura de Navegação Admin

```typescript
// src/components/dashboard/dashboard-shell.tsx

const adminNavGroups = {
  intelligence: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Vendas', icon: DollarSign },
    { href: '/admin/users', label: 'Usuários', icon: Users },
  ],
  marketing: [
    { href: '/admin/advertisements', label: 'Anúncios', icon: Megaphone },
    { href: '/admin/broadcasting', label: 'Mensagens', icon: MessageSquare },
    {
      href: '/admin/social-hub',
      label: 'Social Hub',
      icon: Share2,
      badge: 'Pro',
    },
  ],
  core: [
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
    { href: '/admin/automation', label: 'n8n Workflows', icon: Workflow },
    { href: '/admin/audit', label: 'Logs', icon: Shield },
  ],
};
```

**Componente UI:**

```tsx
<div className="flex-1 px-3 py-4 overflow-y-auto">
  {Object.entries(adminNavGroups).map(([group, items]) => (
    <div key={group} className="mb-6">
      <p className="px-3 mb-2 text-xs uppercase tracking-wide text-muted-foreground">
        {group === 'intelligence' ? '🧠 Inteligência' :
         group === 'marketing' ? '📢 Marketing' : '⚙️ Core'}
      </p>
      <nav className="space-y-1">
        {items.map(item => (
          <div key={item.href} suppressHydrationWarning>
            <Link href={item.href} className={...}>
              {/* ... */}
            </Link>
          </div>
        ))}
      </nav>
    </div>
  ))}
</div>
```

#### 1.2. Rotas a Remover

- ❌ `/admin/courses` (duplicado com /admin/analytics)
- ❌ `/admin/enrollments` (integrar com /admin/users)
- ❌ `/admin/payments` (já está em /admin/analytics)

#### 1.3. Redirect Consistency Check

**Middleware validation:**

```typescript
// middleware.ts

// Garantir que usuários com role errado sejam redirecionados para dashboard correto
if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
  const dashboardUrl =
    userRole === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard';
  return NextResponse.redirect(new URL(dashboardUrl, request.url));
}
```

### ✅ Critérios de Aceitação

- [ ] Sidebar Admin agrupada em 3 categorias
- [ ] Navegação sem itens duplicados
- [ ] Redirect de roles funciona sem loop
- [ ] Teste com 3 roles (Admin/Teacher/Student)

---

## 🎨 MISSÃO 2: REFATORAÇÃO DE UI E ESTABILIDADE

**Responsável:** [@UIDirectorAI]  
**Prioridade:** P0 (Blocker para produção)  
**Estimativa:** 3-4 horas

### 📌 Objetivo

Eliminar warnings de hidratação e modernizar UI de configurações e dashboard.

### 🎯 Deliverables

#### 2.1. Pattern isMounted Global

**Criar hook reutilizável:**

```typescript
// src/hooks/use-mounted.ts

import { useEffect, useState } from 'react';

export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
```

**Aplicar em todos os Links com className dinâmico:**

```tsx
// src/components/dashboard/dashboard-shell.tsx

export function DashboardShell({ ... }) {
  const pathname = usePathname();
  const mounted = useMounted();

  return (
    <nav>
      {navigation.map(item => {
        const isActive = mounted && (pathname === item.href || pathname.startsWith(item.href + '/'));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'base-styles',
              isActive && 'active-styles'
            )}
          >
            {/* ... */}
          </Link>
        );
      })}
    </nav>
  );
}
```

#### 2.2. Página de Configurações com Tabs Verticais

**Criar componente:**

```tsx
// src/app/admin/settings/page.tsx

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSettingsPage() {
  return (
    <div className="flex gap-6">
      <Tabs
        defaultValue="general"
        orientation="vertical"
        className="flex gap-6"
      >
        <TabsList className="flex-col h-auto space-y-1 w-48">
          <TabsTrigger value="general" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" /> Geral
          </TabsTrigger>
          <TabsTrigger value="theme" className="w-full justify-start">
            <Palette className="h-4 w-4 mr-2" /> Tema
          </TabsTrigger>
          <TabsTrigger value="email" className="w-full justify-start">
            <Mail className="h-4 w-4 mr-2" /> E-mail
          </TabsTrigger>
          <TabsTrigger value="integrations" className="w-full justify-start">
            <Zap className="h-4 w-4 mr-2" /> Integrações
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="general">{/* General settings */}</TabsContent>
          <TabsContent value="theme">{/* Theme customization */}</TabsContent>
          <TabsContent value="email">{/* Email config */}</TabsContent>
          <TabsContent value="integrations">{/* API keys */}</TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
```

#### 2.3. Cards de Análise Dinâmicos

**Substituir StatsCard simples por AnalyticsCard:**

```tsx
// src/components/admin/analytics-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change: number; // % de crescimento
  trend: number[]; // Array de valores para sparkline
  icon: React.ElementType;
}

export function AnalyticsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: AnalyticsCardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-2">
          <div
            className={`flex items-center text-xs ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change)}% vs mês anterior
          </div>
          <div className="w-20 h-8">
            <Sparklines data={trend} width={80} height={32}>
              <SparklinesLine color={isPositive ? '#16a34a' : '#dc2626'} />
            </Sparklines>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Instalar dependência:**

```bash
npm install react-sparklines
npm install --save-dev @types/react-sparklines
```

### ✅ Critérios de Aceitação

- [ ] Sem warnings de hidratação no console
- [ ] useMounted() implementado e aplicado
- [ ] Settings com tabs verticais funcional
- [ ] AnalyticsCard com sparklines renderizando

---

## ⚡ MISSÃO 3: NOVAS FUNCIONALIDADES E AUTOMAÇÃO

**Responsável:** [@FullstackAI]  
**Prioridade:** P1 (Feature add-on)  
**Estimativa:** 6-8 horas

### 📌 Objetivo

Implementar Broadcasting System e Social Hub com integração Meta API + n8n.

### 🎯 Deliverables

#### 3.1. Broadcasting System Backend

**Schema Prisma:**

```prisma
// prisma/schema.prisma

model BroadcastMessage {
  id              String   @id @default(cuid())
  title           String
  content         String   @db.Text
  targetAudience  String   // 'all', 'students', 'teachers', 'segment'
  segmentFilter   Json?    // Filtro customizado (ex: plano, curso específico)

  scheduledFor    DateTime?
  sentAt          DateTime?
  status          BroadcastStatus @default(DRAFT)

  channels        BroadcastChannel[] // Email, Push, SMS, WhatsApp

  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Analytics
  sentCount       Int      @default(0)
  openedCount     Int      @default(0)
  clickedCount    Int      @default(0)

  @@index([status, scheduledFor])
  @@index([createdBy])
}

enum BroadcastStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  FAILED
}

enum BroadcastChannel {
  EMAIL
  PUSH
  SMS
  WHATSAPP
}
```

**Service Layer:**

```typescript
// src/lib/services/broadcast.service.ts

import { prisma } from '@/lib/db';
import type { BroadcastStatus, BroadcastChannel } from '@prisma/client';

export class BroadcastService {
  static async createBroadcast(data: {
    title: string;
    content: string;
    targetAudience: string;
    segmentFilter?: any;
    scheduledFor?: Date;
    channels: BroadcastChannel[];
    createdBy: string;
  }) {
    return prisma.broadcastMessage.create({
      data: {
        ...data,
        status: data.scheduledFor ? 'SCHEDULED' : 'DRAFT',
      },
    });
  }

  static async scheduleBroadcast(id: string, scheduledFor: Date) {
    return prisma.broadcastMessage.update({
      where: { id },
      data: {
        scheduledFor,
        status: 'SCHEDULED',
      },
    });
  }

  static async sendBroadcast(id: string) {
    const broadcast = await prisma.broadcastMessage.findUnique({
      where: { id },
    });

    if (!broadcast) throw new Error('Broadcast not found');

    // Get target users
    const users = await this.getTargetUsers(
      broadcast.targetAudience,
      broadcast.segmentFilter as any
    );

    // Send via selected channels
    // TODO: Integrate with Resend, Twilio, WhatsApp API

    await prisma.broadcastMessage.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        sentCount: users.length,
      },
    });

    return { success: true, sentCount: users.length };
  }

  private static async getTargetUsers(audience: string, filter?: any) {
    // Implementar lógica de segmentação
    if (audience === 'all') {
      return prisma.user.findMany({ where: { emailVerified: { not: null } } });
    }

    if (audience === 'students') {
      return prisma.user.findMany({ where: { role: 'STUDENT' } });
    }

    // ... outras segmentações
    return [];
  }
}
```

**API Route:**

```typescript
// src/app/api/admin/broadcasting/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { BroadcastService } from '@/lib/services/broadcast.service';
import { z } from 'zod';

const createBroadcastSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  targetAudience: z.enum(['all', 'students', 'teachers', 'segment']),
  scheduledFor: z.string().datetime().optional(),
  channels: z.array(z.enum(['EMAIL', 'PUSH', 'SMS', 'WHATSAPP'])),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createBroadcastSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const broadcast = await BroadcastService.createBroadcast({
    ...parsed.data,
    scheduledFor: parsed.data.scheduledFor
      ? new Date(parsed.data.scheduledFor)
      : undefined,
    createdBy: session.user.id,
  });

  return NextResponse.json(broadcast);
}
```

#### 3.2. Social Hub + Meta API

**Schema Prisma:**

```prisma
model SocialAccount {
  id           String   @id @default(cuid())
  platform     SocialPlatform
  accountId    String   // ID da conta na plataforma
  accessToken  String   @db.Text
  refreshToken String?  @db.Text
  expiresAt    DateTime?

  isActive     Boolean  @default(true)

  userId       String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([platform, accountId])
  @@index([userId])
}

enum SocialPlatform {
  FACEBOOK
  INSTAGRAM
  LINKEDIN
  TWITTER
}

model SocialPost {
  id          String   @id @default(cuid())
  content     String   @db.Text
  mediaUrls   String[] // URLs de imagens/vídeos

  platforms   SocialPlatform[]

  scheduledFor DateTime?
  publishedAt  DateTime?
  status       PostStatus @default(DRAFT)

  createdBy   String
  createdAt   DateTime @default(now())

  @@index([status, scheduledFor])
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  FAILED
}
```

**n8n Webhook Integration:**

```typescript
// src/lib/services/n8n.service.ts

export class N8nService {
  private static readonly WEBHOOK_BASE = process.env.N8N_WEBHOOK_URL;

  static async triggerWorkflow(workflowName: string, payload: any) {
    const response = await fetch(`${this.WEBHOOK_BASE}/${workflowName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.N8N_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n workflow failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async publishToSocial(post: any) {
    return this.triggerWorkflow('social-publisher', {
      content: post.content,
      platforms: post.platforms,
      mediaUrls: post.mediaUrls,
    });
  }
}
```

### ✅ Critérios de Aceitação

- [ ] Schema Prisma atualizado (broadcast + social)
- [ ] BroadcastService completo com segmentação
- [ ] API /api/admin/broadcasting funcional
- [ ] N8nService com trigger de workflows
- [ ] Migration rodada com sucesso

---

## 🔐 MISSÃO 4: VALIDAÇÃO DE PLANOS (FEATURE GATING)

**Responsável:** [@DevOpsAI + @SecurityAI]  
**Prioridade:** P0 (Security/Revenue)  
**Estimativa:** 4-5 horas

### 📌 Objetivo

Bloquear features premium (AI Assistant, Mentorias, Social Hub) para usuários sem plano adequado.

### 🎯 Deliverables

#### 4.1. Atualizar PlanService com Feature Matrix

```typescript
// src/lib/services/plan.service.ts

const FEATURE_MATRIX = {
  free: ['basic_dashboard', 'basic_courses', 'basic_chat'],
  standard: [
    'basic_dashboard',
    'basic_courses',
    'basic_chat',
    'activity_bank',
    'limited_students', // até 50
    'email_support',
  ],
  premium: [
    'basic_dashboard',
    'basic_courses',
    'basic_chat',
    'activity_bank',
    'unlimited_students',
    'ai_assistant',
    'mentorships',
    'social_hub',
    'advanced_analytics',
    'certificate_issuing',
    'priority_support',
  ],
  enterprise: [
    // Admins têm tudo
    'all_features',
  ],
};

export class PlanService {
  static async getUserPlanInfo(
    userId: string,
    role: string
  ): Promise<PlanInfo> {
    if (role === 'ADMIN') {
      return {
        planId: 'enterprise',
        tier: 'enterprise',
        features: ['all_features'],
        isActive: true,
      };
    }

    // Buscar subscription ativa
    const subscription =
      role === 'TEACHER'
        ? await prisma.teacherSubscription.findFirst({
            where: { userId, status: 'active' },
            include: { plan: true },
          })
        : await prisma.studentSubscription.findFirst({
            where: { userId, status: 'active' },
            include: { plan: true },
          });

    if (!subscription) {
      return {
        planId: 'free',
        tier: 'free',
        features: FEATURE_MATRIX.free,
        isActive: true,
      };
    }

    const tier =
      subscription.plan.tier.toLowerCase() as keyof typeof FEATURE_MATRIX;

    return {
      planId: subscription.planId,
      tier,
      features: FEATURE_MATRIX[tier] || FEATURE_MATRIX.free,
      isActive: subscription.status === 'active',
    };
  }

  static async hasFeatureAccess(
    userId: string,
    role: string,
    feature: string
  ): Promise<boolean> {
    const planInfo = await this.getUserPlanInfo(userId, role);

    if (planInfo.features.includes('all_features')) return true;

    return planInfo.features.includes(feature);
  }
}
```

#### 4.2. Integrar Feature Gating nos Layout Wrappers

```typescript
// src/components/layouts/teacher-layout-wrapper.tsx

'use client';

import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useState, useEffect } from 'react';

export function TeacherLayoutWrapper({ user, children }: Props) {
  const { data: session } = useSession();
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/plan?userId=${session.user.id}&role=TEACHER`)
        .then((res) => res.json())
        .then((data) => setPlanFeatures(data.features || []));
    }
  }, [session]);

  const checkFeatureAccessAction = (featureId: string) => {
    // Admins sempre têm acesso
    if (session?.user?.role === 'ADMIN') return true;

    // Verificar se feature está no plano
    return planFeatures.includes(featureId);
  };

  return (
    <DashboardShell
      role="TEACHER"
      user={user}
      onLogoutAction={() => signOut({ callbackUrl: '/login' })}
      checkFeatureAccessAction={checkFeatureAccessAction}
    >
      {children}
    </DashboardShell>
  );
}
```

#### 4.3. Modal de Upgrade

```tsx
// src/components/upgrade-modal.tsx

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, TrendingUp } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan: 'standard' | 'premium';
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  requiredPlan,
}: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push(`/checkout/${requiredPlan}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Desbloqueie {feature}
          </DialogTitle>
          <DialogDescription className="text-center">
            Este recurso está disponível apenas no plano{' '}
            {requiredPlan === 'standard' ? 'Standard' : 'Premium'}. Faça upgrade
            agora e aproveite todas as funcionalidades!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm">
              Acesso ilimitado a ferramentas avançadas
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm">Suporte prioritário</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Agora não
          </Button>
          <Button onClick={handleUpgrade} className="flex-1">
            Fazer Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 4.4. Aplicar Feature Gating em Rotas

```typescript
// src/app/admin/social-hub/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { UpgradeModal } from '@/components/upgrade-modal';

export default function SocialHubPage() {
  const { data: session } = useSession();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch(
        `/api/user/plan?userId=${session.user.id}&role=${session.user.role}`
      )
        .then((res) => res.json())
        .then((data) => {
          const access = data.features?.includes('social_hub') || false;
          setHasAccess(access);
          if (!access) setShowUpgrade(true);
        });
    }
  }, [session]);

  if (hasAccess === null) {
    return <div>Carregando...</div>;
  }

  if (!hasAccess) {
    return (
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Social Hub"
        requiredPlan="premium"
      />
    );
  }

  return <div>{/* Conteúdo do Social Hub */}</div>;
}
```

### ✅ Critérios de Aceitação

- [ ] PlanService atualizado com FEATURE_MATRIX
- [ ] Layout wrappers integrados com feature check
- [ ] UpgradeModal criado e estilizado
- [ ] Rotas premium bloqueadas para free tier
- [ ] Teste: Free tier vê modal de upgrade ao clicar em slot premium

---

## 📊 PRIORIZAÇÃO E TIMELINE

| Missão   | Prioridade | Blocker? | Estimativa | Responsável           |
| -------- | ---------- | -------- | ---------- | --------------------- |
| Missão 1 | P0         | ✅ Sim   | 2-3h       | ArchitectAI           |
| Missão 2 | P0         | ✅ Sim   | 3-4h       | UIDirectorAI          |
| Missão 4 | P0         | ✅ Sim   | 4-5h       | DevOpsAI + SecurityAI |
| Missão 3 | P1         | ❌ Não   | 6-8h       | FullstackAI           |

**Sequência recomendada:**

1. Missão 2 (estabilizar hidratação) → P0
2. Missão 4 (feature gating) → P0
3. Missão 1 (reorganizar nav) → P0
4. Missão 3 (broadcasting/social) → P1

**Total estimado:** 15-20 horas (2-3 dias de trabalho)

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

**[@UIDirectorAI]** — Iniciar Missão 2 (useMounted pattern)  
**[@DevOpsAI]** — Preparar migrations Prisma para Missão 3  
**[@SecurityAI]** — Revisar FEATURE_MATRIX e validar bloqueios  
**[@ArchitectAI]** — Documentar nova estrutura de nav no blueprint

---

**Documento gerado por:** Orquestrador Central  
**Versão:** 1.0 — Refactor Phase 4 Missions  
**Classificação:** Internal Use — Agentes VisionVII
