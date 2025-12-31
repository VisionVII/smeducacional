# 📊 ANÁLISE COMPLETA DO PROJETO SM EDUCA

**Data:** 31 de Dezembro de 2025  
**Governance:** VisionVII Enterprise Governance 3.0  
**Status:** Orquestração Pronta para Planejamento

---

## 🎯 EXECUTIVE SUMMARY

O projeto **SM Educa** é uma plataforma educacional complexa com 18 rotas admin, 3 features premium bloqueadas por FeaturePurchase, e sistema de imagens híbrido (URLs no banco + Supabase Storage).

| Métrica                         | Valor                                        |
| ------------------------------- | -------------------------------------------- |
| **Rotas Admin Mapeadas**        | 18                                           |
| **Implementadas Completamente** | 8 (44%)                                      |
| **Em Presumido/Pendente**       | 10 (56%)                                     |
| **Services Pattern**            | 8 services ✅                                |
| **Features Premium**            | 3 (ai-assistant, mentorships, pro-tools)     |
| **Buckets Storage**             | 3+ (course-thumbnails, public-pages, videos) |

---

## 1️⃣ MAPEAMENTO DETALHADO DE ROTAS ADMIN

### 📍 Menu Principal (admin-sidebar.tsx)

**11 Itens de Menu com estrutura clara:**

#### 1. **Dashboard** `/admin`

- ✅ **Status:** Implementada
- 📄 **Arquivo:** `src/app/admin/page.tsx`
- 🎨 **Componentes:** DashboardComponents, AdminHeader, StatCard
- 📍 **Localização:** Entrada principal do admin

#### 2. **Usuários** `/admin/users`

- ✅ **Status:** Implementada
- 📄 **Arquivo:** `src/app/admin/users/page.tsx`
- 👥 **Submenu:**
  - Todos os Usuários
  - Alunos (`?role=STUDENT`)
  - Professores (`?role=TEACHER`)
  - Administradores (`?role=ADMIN`)
- 🔍 **Features:** Filtro por role, gerenciamento de perfis

#### 3. **Cursos** `/admin/courses`

- ✅ **Status:** Implementada
- 📄 **Arquivo:** `src/app/admin/courses/page.tsx`
- 📚 **Submenu:**
  - Todos os Cursos
  - Novo Curso (create)
  - Categorias
- 🎯 **Features:** CRUD de cursos, categories manager

#### 4. **Matrículas** `/admin/enrollments`

- ⚠️ **Status:** Menu + Rota (página presumida)
- 📊 **Dados:** Enrollment.status, Progress tracking
- ❌ **Falta:** Página implementada completa

#### 5. **Financeiro** (DollarSign)

- ✅ **Status:** Parcialmente implementada
- 📄 **Arquivo:** `src/app/admin/payments/page.tsx`
- 💳 **Submenu:**
  - Pagamentos (`/admin/payments`)
  - Assinaturas (`/admin/subscriptions`)
  - Relatório Fiscal (`/admin/financial-reports`)
  - Configuração Stripe (`/admin/stripe-config`) ✅
- 🔗 **Integração:** Stripe webhook + FeaturePurchase

#### 6. **Analytics** `/admin/analytics`

- ⚠️ **Status:** Menu apenas (página presumida)
- 📈 **Expectativa:** Charts, Metrics, DataVisualization

#### 7. **Mensagens** `/admin/messages`

- ⚠️ **Status:** Menu apenas + Badge "3"
- 💬 **Badge:** Indica 3 mensagens não lidas
- ❌ **Falta:** Implementação

#### 8. **Notificações** `/admin/notifications`

- ⚠️ **Status:** Menu apenas
- 🔔 **Expectativa:** Notification Center, Preferences

#### 9. **Relatórios** `/admin/reports`

- ⚠️ **Status:** Menu com submenu (páginas presumidas)
- 📋 **Submenu:**
  - Relatório Geral
  - Relatório de Acessos
  - Relatório de Certificados
- 📊 **Expectativa:** Export PDF, Analytics avançado

#### 10. **Segurança** `/admin/security`

- ⚠️ **Status:** Menu apenas
- 🔐 **Expectativa:** Audit logs, Access control, 2FA settings

#### 11. **Configurações** `/admin/settings`

- ✅ **Status:** Implementada
- ⚙️ **Arquivo:** `src/app/admin/settings/page.tsx`
- 🎨 **Features:**
  - Theme selector (`/admin/settings/theme`)
  - System config
  - Preference settings

---

### 🎮 Slot Navigation (Features Premium)

**3 Itens em Espaço Separado (slot nav):**

| Feature             | Rota                    | Lock   | Feature ID     | Upsell               | Badge |
| ------------------- | ----------------------- | ------ | -------------- | -------------------- | ----- |
| **Chat IA**         | `/admin/ai-assistant`   | 🔒 YES | `ai-assistant` | `/checkout/ai-suite` | Pro   |
| **Mentorias**       | `/admin/plans/stripe`   | 🔓 NO  | `mentorships`  | -                    | -     |
| **Ferramentas Pro** | `/admin/advertisements` | 🔓 NO  | `pro-tools`    | -                    | -     |

📍 **Localização:** `src/components/dashboard/dashboard-shell.tsx` (linhas 137-158)

---

### 🆕 Rotas Adicionais Descobertas

| Rota                        | Status                  | Arquivo                  |
| --------------------------- | ----------------------- | ------------------------ |
| `/admin/audit`              | Menu em dashboard-shell | presumido                |
| `/admin/audit-logs`         | Em admin-menu.ts        | presumido                |
| `/admin/public-pages`       | ✅ CMS implementado     | PublicPagesDashboard.tsx |
| `/admin/public-theme`       | ⚠️ Página               | presumido                |
| `/admin/dev`                | ⚠️ Ferramentas dev      | presumido                |
| `/admin/stripe-config`      | ✅ Implementado         | stripe-config/page.tsx   |
| `/admin/advertisements`     | ✅ Implementado         | advertisements/page.tsx  |
| `/admin/tools/translator`   | ⚠️ Tradutor             | presumido                |
| `/admin/system/maintenance` | ⚠️ Manutenção           | presumido                |

---

### 🚨 Rotas Órfãs (Menu sem Page Implementada)

```
✅ Sidebar tem rota     | ❌ Página não existe completa
─────────────────────────────────────────────────
/admin/enrollments      | Presumida
/admin/analytics        | Presumida
/admin/messages         | Presumida (com badge)
/admin/notifications    | Presumida
/admin/reports          | Presumida + submenu
/admin/security         | Presumida
```

**Impacto:** Usuários clicam em menu e não encontram página funcional.

---

## 2️⃣ ESTRUTURA ATUAL DE IMAGENS

### 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│ Aplicação (Next.js)                │
├─────────────────────────────────────┤
│ 1. Componente ImageUpload           │
│    ↓                                │
│ 2. POST /api/upload                 │
│    ↓                                │
│ 3. Supabase Storage Upload          │
│    ↓                                │
│ 4. Retorna URL pública              │
│    ↓                                │
│ 5. URL armazenada em campo String   │
│    (User.avatar, Course.thumbnail)  │
│    ↓                                │
│ 6. Componentes renderizam via URL   │
└─────────────────────────────────────┘
```

### 📦 Buckets Supabase

#### **1. `course-thumbnails` (Público)**

- 📸 **Uso:** Capas de cursos
- 🏷️ **Path:** `courses/{slug}/thumbnail.jpg`
- 🔗 **Exemplo:**
  ```
  https://okxgsvalfwxxoxcfxmhc.supabase.co/storage/v1/object/public/
  course-thumbnails/courses/python-basico/thumbnail.jpg
  ```
- 📍 **Usado em:**
  - `src/app/teacher/courses/new/page.tsx` (upload)
  - `src/app/teacher/courses/[id]/edit/page.tsx` (edit)
  - `src/components/teacher/course-card.tsx` (display)
  - `src/app/student/courses/page.tsx` (display)

#### **2. `public-pages` (Público)**

- 📸 **Uso:** Imagens de páginas públicas (CMS)
- 🏷️ **Path:** `images/{pageId}/{filename}`
- 📍 **Usado em:**
  - `src/components/admin/PublicPagesDashboard.tsx`
  - `src/components/admin/PublicPagesEditForm.tsx`
  - CMS Block Editor

#### **3. `videos` (Presumido)**

- 🎥 **Uso:** Vídeos de aulas + thumbnails geradas
- 🏷️ **Path:** `videos/{courseId}/...`

### 🗄️ Campos de Banco de Dados

#### **User Model**

```prisma
model User {
  avatar: String?  // URL do avatar (Supabase Storage)
  // ...
}
```

- 📍 **Onde é preenchido:**
  - Profile update user
  - Upload de avatar no dashboard

#### **Course Model**

```prisma
model Course {
  thumbnail: String?  // URL da capa do curso
  // ...
}
```

- 📍 **Onde é preenchido:**
  - `/admin/courses/create` (ImageUpload)
  - `/admin/courses/[id]/edit` (ImageUpload)

#### **PublicPage Model**

```prisma
model PublicPage {
  bannerUrl: String?   // URL do banner (Supabase)
  iconUrl: String?     // URL do ícone (Supabase)
  content: Json?       // Pode conter images em blocos
  // ...
}
```

#### **Material Model**

```prisma
model Material {
  url: String  // URL do arquivo/documento
}
```

#### **Submission Model**

```prisma
model Submission {
  fileUrl: String?  // URL do arquivo enviado
}
```

### 🎨 Componentes que Usam Imagens

#### **1. Avatar (shadcn/ui)**

```tsx
<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

- 📍 **Arquivo:** `src/components/ui/avatar.tsx`
- 🔍 **Usado em:** `dashboard-shell.tsx` (user profile dropdown)

#### **2. CourseCard**

```tsx
{
  course.thumbnail && <Image src={course.thumbnail} alt={course.title} />;
}
```

- 📍 **Arquivo:** `src/components/teacher/course-card.tsx`
- 🔍 **Usado em:**
  - Teacher courses listing
  - Student courses listing
  - Dashboard

#### **3. ImageUpload (Inteligente)**

```tsx
<ImageUpload
  value={formData.thumbnail}
  onChange={(url) => setThumbnail(url)}
  path={`courses/${slug}/thumbnail.jpg`}
/>
```

- 📍 **Arquivo:** `src/components/ui/ImageUpload.tsx`
- ✨ **Features:**
  - Drag-and-drop
  - Preview em tempo real
  - Progress bar
  - Validação de tipo (image/\*)
- 🔍 **Usado em:**
  - Course create/edit
  - Public page editor
  - User avatar upload

#### **4. BlockEditor**

- 📍 **Arquivo:** `src/components/ui/BlockEditor.tsx`
- 🎨 **Suporta:** Blocos de imagem no CMS

### 🔌 API Endpoints de Upload

#### **POST /api/upload** (Genérico)

```typescript
// src/app/api/upload/route.ts
const supabase = createClient();
const { data, error } = await supabase.storage.from(bucket).upload(path, file);

return { url: getPublicUrl() };
```

#### **POST/PUT /api/admin/public-pages** (CMS)

- ✅ Aceita: `bannerUrl`, `iconUrl` como strings
- 📍 Arquivo: `src/app/api/admin/public-pages/route.ts`

### 🚨 Problemas Críticos

| Problema                                | Gravidade | Impacto                        |
| --------------------------------------- | --------- | ------------------------------ |
| ❌ Imagens não são deletadas do Storage | 🔴 ALTA   | Storage cresce indefinidamente |
| ❌ URLs hardcoded no banco              | 🟡 MÉDIA  | Quebra se Supabase URL mudar   |
| ⚠️ Sem cleanup ao soft-delete           | 🟡 MÉDIA  | Orphaned files no Storage      |
| ✅ RLS policies corretas                | 🟢 VERDE  | Acesso controlado              |
| ✅ URLs públicas seguras                | 🟢 VERDE  | Sem credenciais expostas       |

---

## 3️⃣ LÓGICA DE ACESSO A FEATURES

### 🎮 Modelo FeaturePurchase

```prisma
model FeaturePurchase {
  id: String             // PK
  userId: String         // FK → User
  featureId: String      // 'ai-assistant' | 'mentorships' | 'pro-tools'
  status: String         // 'active' | 'inactive' | 'expired'
  price: Float           // 29.90
  currency: String       // 'BRL'
  stripePaymentId: String // pi_1234...
  purchaseDate: DateTime // when payment confirmed
  expiresAt: DateTime?   // optional expiry
  updatedAt: DateTime
}
```

### 🔐 3 Features Principais

#### **1. 🔒 Chat IA (ai-assistant)**

- **Status:** LOCKED para students/teachers
- **Preço:** R$ 29,90 (BRL)
- **Rotas:**
  - `/student/ai-chat`
  - `/teacher/ai-assistant`
  - `/admin/ai-assistant`
- **Validação:** `src/app/api/student/ai-chat/access/route.ts`
- **Fluxo:**
  1. Usuário clica em "Chat IA"
  2. Componente verifica `FeaturePurchase.status === 'active'`
  3. Se locked, mostra botão "Upgrade" → `/checkout/ai-suite`
  4. Stripe payment → Webhook → FeaturePurchase criado
  5. Feature desbloqueado ✅

#### **2. 🔓 Mentorias (mentorships)**

- **Status:** UNLOCKED (admin + teacher gratuito)
- **Rotas:**
  - `/teacher/mentorships`
  - `/admin/plans/stripe` (config)
  - `/student/mentorships`
- **Validação:** Dashboard shell (hardcoded false)

#### **3. 🔓 Ferramentas Pro (pro-tools)**

- **Status:** UNLOCKED (gratuito)
- **Rotas:**
  - `/teacher/tools`
  - `/admin/advertisements`
- **Validação:** Sem lock

### 🔄 Fluxo de Validação

```
┌─────────────────────────────────────────┐
│ 1. Usuário acessa /student/ai-chat      │
├─────────────────────────────────────────┤
│ 2. Layout wrapper calcula access        │
│    checkFeatureAccessAction('ai-assistant')
├─────────────────────────────────────────┤
│ 3. Dashboard-shell verifica:            │
│    - FeaturePurchase.status === 'active'│
│    - StudentSubscription.active         │
├─────────────────────────────────────────┤
│ 4. Se unlocked → Renderiza página ✅    │
│    Se locked → Card com Upgrade button  │
├─────────────────────────────────────────┤
│ 5. Upgrade → /checkout/chat-ia          │
│    → Stripe payment                     │
│    → Webhook → FeaturePurchase ativo    │
│    → Feature desbloqueado 🔓            │
└─────────────────────────────────────────┘
```

### 📝 Funções de Gating

#### **Em `src/lib/feature-gating.ts`:**

```typescript
// Verifica acesso a curso pago
canAccessCourse(userId, courseId)
  → { allowed, reason, course }

// Verifica limite de cursos por plano
canCreateCourse(userId)
  → { allowed, reason }

// Verifica limite de vídeos
canUploadVideo(userId)
  → { allowed, reason }

// Verifica feature específica
canAccessFeature(userId, featureId)
  → boolean
```

#### **Em `src/lib/subscription.ts`:**

```typescript
const PLAN_FEATURES: Record<PlanType, TeacherAccessControl> = {
  free: {
    maxCourses: 1,
    canUploadLogo: false,
    canCustomizeDomain: false,
    canAccessAnalytics: false,
  },
  basic: {
    maxCourses: 5,
    canUploadLogo: true,
    canCustomizeDomain: false,
    canAccessAnalytics: true,
  },
  premium: {
    maxCourses: 20,
    canUploadLogo: true,
    canCustomizeDomain: true,
    canAccessAnalytics: true,
  },
  enterprise: {
    maxCourses: Infinity,
    // ... tudo desbloqueado
  },
};
```

### 🔌 Endpoints de Features

| Endpoint                               | Método | Arquivo                             | Função                         |
| -------------------------------------- | ------ | ----------------------------------- | ------------------------------ |
| `/api/student/ai-chat/access`          | GET    | ai-chat/access/route.ts             | Verifica acesso                |
| `/api/student/ai-chat/message`         | POST   | ai-chat/message/route.ts            | Envia mensagem (com validação) |
| `/api/admin/feature-purchases/:userId` | GET    | feature-purchases/[userId]/route.ts | Debug: lista purchases         |
| `/api/checkout/feature`                | POST   | checkout/feature/route.ts           | Inicia checkout                |
| `/api/webhooks/stripe`                 | POST   | webhooks/stripe/route.ts            | Webhook: cria FeaturePurchase  |

### 🔐 Componentes de Lock

#### **DashboardShell**

```tsx
const defaultSlotNav: Record<Role, SlotNavItem[]> = {
  ADMIN: [
    {
      href: '/admin/ai-assistant',
      label: 'Chat IA',
      icon: MessageSquare,
      locked: true, // 🔒
      upsellHref: '/checkout/ai-suite',
      badge: 'Pro',
      featureId: 'ai-assistant',
    },
    // ...
  ],
};
```

#### **Lock Rendering**

```tsx
const isLocked = checkFeatureAccessAction
  ? checkFeatureAccessAction(item.featureId) || item.locked
  : item.locked;

if (isLocked) {
  return <LockedFeatureCard label={item.label} upsellHref={item.upsellHref} />;
}
```

### 🚨 Observações Críticas

| Ponto                                             | Status  | Descrição                              |
| ------------------------------------------------- | ------- | -------------------------------------- |
| ✅ FeaturePurchase criado com status='active'     | Verde   | Na transação, não depois               |
| ✅ Validação dual: FeaturePurchase + Subscription | Verde   | Double-check de segurança              |
| ✅ Transação atômica Stripe                       | Verde   | Se FeaturePurchase falha, tudo reverte |
| ⚠️ Sem hard-delete de features                    | Amarelo | Status inativo apenas                  |
| 🔒 ai-assistant é paywall                         | Verde   | Monetização implementada               |
| 🔓 mentorships/pro-tools gratuito                 | Verde   | Conforme business model                |

---

## 4️⃣ PADRÃO ATUAL DE MENU ADMIN

### 📍 Três Fontes de Menu

| Localização           | Tipo             | Status        | Usado Por           |
| --------------------- | ---------------- | ------------- | ------------------- |
| `admin-sidebar.tsx`   | Componente React | ✅ Primária   | Admin layout        |
| `admin-menu.ts`       | Config file      | ⚠️ Secundária | Fallback/legacy     |
| `dashboard-shell.tsx` | Shell component  | ✅ Primária   | Slot nav + features |

### 🎯 Hierarquia de Autoridade

```
1. admin-sidebar.tsx (Fonte de Verdade Principal)
   ↓
2. dashboard-shell.tsx (Slot Nav + Features)
   ↓
3. admin-menu.ts (Legacy/Fallback)
```

### 📄 `admin-sidebar.tsx` (Principal)

**Localização:** `src/components/admin/admin-sidebar.tsx`

```tsx
interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  children?: Array<{
    title: string;
    href: string;
  }>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    href: '/admin/users',
    icon: Users,
    children: [
      { title: 'Todos os Usuários', href: '/admin/users' },
      { title: 'Alunos', href: '/admin/users?role=STUDENT' },
      // ...
    ],
  },
  // ... (total de 11 itens)
];
```

**Comportamento:**

- ✅ Usa `usePathname()` para highlighting ativo
- ✅ Collapsible com seta rotativa
- ✅ Badge opcional (ex: "3" em Messages)
- ✅ `suppressHydrationWarning` para SSR
- ✅ Estado local de abertos/fechados

### 📋 `admin-menu.ts` (Config)

**Localização:** `src/config/admin-menu.ts`

```typescript
export const adminMenu = [
  {
    label: 'Usuários',
    href: '/admin/users',
    icon: 'users',
  },
  {
    label: 'Cursos',
    href: '/admin/courses',
    icon: 'book-open',
  },
  // ... (total de 6 itens)
];
```

**Status:** ⚠️ Pode estar desatualizado (não sincronizado)

### 🎮 `dashboard-shell.tsx` (Slot Nav)

**Localização:** `src/components/dashboard/dashboard-shell.tsx` (linhas 137-158)

```typescript
const defaultSlotNav: Record<Role, SlotNavItem[]> = {
  ADMIN: [
    {
      href: '/admin/ai-assistant',
      label: 'Chat IA',
      icon: MessageSquare,
      locked: true,
      upsellHref: '/checkout/ai-suite',
      badge: 'Pro',
      featureId: 'ai-assistant',
    },
    {
      href: '/admin/plans/stripe',
      label: 'Mentorias',
      icon: Sparkles,
      locked: false,
      featureId: 'mentorships',
    },
    {
      href: '/admin/advertisements',
      label: 'Ferramentas Pro',
      icon: BarChart3,
      featureId: 'pro-tools',
    },
  ],
  TEACHER: [
    /* ... */
  ],
  STUDENT: [
    /* ... */
  ],
};
```

### 🔗 Submenu Colapsível

| Pai            | Filhos                                     | Tipo              |
| -------------- | ------------------------------------------ | ----------------- |
| **Usuários**   | Todos, Alunos, Professores, Admins         | Filtro por role   |
| **Cursos**     | Todos, Novo, Categorias                    | CRUD + gestão     |
| **Financeiro** | Pagamentos, Assinaturas, Relatório, Stripe | Gestão financeira |
| **Relatórios** | Geral, Acessos, Certificados               | Analytics         |

### 📊 Estrutura Completa

```
📍 /admin
├── 📍 /admin/users
│   ├── Todos os Usuários
│   ├── Alunos (?role=STUDENT)
│   ├── Professores (?role=TEACHER)
│   └── Administradores (?role=ADMIN)
├── 📍 /admin/courses
│   ├── Todos os Cursos
│   ├── Novo Curso
│   └── Categorias
├── 📍 /admin/enrollments
├── 📍 /admin/payments
│   ├── Pagamentos
│   ├── Assinaturas
│   ├── Relatório Fiscal
│   └── Configuração Stripe
├── 📍 /admin/analytics
├── 📍 /admin/messages (badge: "3")
├── 📍 /admin/notifications
├── 📍 /admin/reports
│   ├── Relatório Geral
│   ├── Acessos
│   └── Certificados
├── 📍 /admin/security
└── 📍 /admin/settings
    └── /admin/settings/theme

🎮 SLOT NAV (Premium Features):
├── 🔒 Chat IA → /checkout/ai-suite
├── 🔓 Mentorias → /admin/plans/stripe
└── 🔓 Ferramentas Pro → /admin/advertisements
```

### 🚨 Problemas Identificados

| Problema                             | Severidade | Recomendação            |
| ------------------------------------ | ---------- | ----------------------- |
| ⚠️ admin-menu.ts desatualizado       | MÉDIA      | Sincronizar ou remover  |
| ❌ 6 rotas sem página completa       | MÉDIA      | Implementar páginas     |
| ⚠️ Badges estáticos ("3")            | BAIXA      | Fazer dinâmicos via API |
| ❌ Sem middleware de role protection | ALTA       | Adicionar middleware    |

---

## 📊 INTEGRAÇÃO DE SERVICES (VisionVII Pattern)

### ✅ Services Implementados

| Service                   | Arquivo                    | Funções                               | Status |
| ------------------------- | -------------------------- | ------------------------------------- | ------ |
| **User Service**          | `user.service.ts`          | getUserById, updateUser, deleteUser   | ✅     |
| **Course Service**        | `course.service.ts`        | createCourse, updateCourse, publish   | ✅     |
| **Payment Service**       | `payment.service.ts`       | processPayment, createFeaturePurchase | ✅     |
| **AI Service**            | `ai.service.ts`            | generateResponse, validateFeature     | ✅     |
| **Dashboard Service**     | `dashboard.service.ts`     | getDashboardData, getAnalytics        | ✅     |
| **System Service**        | `system.service.ts`        | getConfig, updateConfig               | ✅     |
| **Stripe Config Service** | `stripe-config.service.ts` | getConfig, updateConfig               | ✅     |
| **Video Service**         | `video.service.ts`         | uploadVideo, generateThumbnail        | ✅     |
| **Plan Service**          | `plan.service.ts`          | getPlanFeatures, validateAccess       | ✅     |

**Total:** 9 services ✅ Service Pattern implementado corretamente

---

## 🎯 PRÓXIMOS PASSOS PARA ORQUESTRAÇÃO

### 📋 Prioridade 1️⃣ (Crítico)

- [ ] Sincronizar `admin-menu.ts` com `admin-sidebar.tsx`
- [ ] Implementar middleware de role protection `/admin/*`
- [ ] Implementar páginas presumidas (6 rotas)
  - [ ] `/admin/enrollments`
  - [ ] `/admin/analytics`
  - [ ] `/admin/messages`
  - [ ] `/admin/notifications`
  - [ ] `/admin/reports`
  - [ ] `/admin/security`

### 📋 Prioridade 2️⃣ (Importante)

- [ ] Adicionar lógica de cleanup de imagens no Storage
- [ ] Implementar deleção de FeaturePurchase ao soft-deletar usuário
- [ ] Criar testes E2E para fluxo de feature unlock
- [ ] Documentar transação Stripe → FeaturePurchase

### 📋 Prioridade 3️⃣ (Melhorias)

- [ ] Fazer badges dinâmicos (ex: messages count via API)
- [ ] Criar dashboard de auditoria (logs de ações admin)
- [ ] Implementar logs de acesso a features premium
- [ ] Adicionar analytics de feature adoption

---

## 📁 ARQUIVOS DE REFERÊNCIA

```
📦 SM Educa
├── 📊 ANALISE_COMPLETA_PROJETO.json (este arquivo em JSON)
├── 📄 ANALISE_COMPLETA_PROJETO.md (este documento)
├── 📁 src/
│   ├── app/admin/
│   │   ├── page.tsx (Dashboard)
│   │   ├── users/page.tsx ✅
│   │   ├── courses/page.tsx ✅
│   │   ├── payments/page.tsx ✅
│   │   ├── ai-assistant/page.tsx ✅
│   │   ├── advertisements/page.tsx ✅
│   │   ├── stripe-config/page.tsx ✅
│   │   └── ... (outros)
│   ├── components/admin/
│   │   ├── admin-sidebar.tsx (Menu principal)
│   │   ├── admin-header.tsx
│   │   ├── dashboard-shell.tsx (Slot nav)
│   │   └── ...
│   ├── lib/
│   │   ├── feature-gating.ts
│   │   ├── subscription.ts
│   │   ├── payment.service.ts
│   │   ├── services/ (8 services)
│   │   └── ...
│   └── config/
│       └── admin-menu.ts (Config)
└── 📊 prisma/
    └── schema.prisma (User, Course, FeaturePurchase, etc)
```

---

## 🎓 CONCLUSÃO

O projeto SM Educa possui uma **arquitetura sólida** com:

- ✅ Menu admin bem estruturado
- ✅ Feature gating via FeaturePurchase
- ✅ Imagens centralizadas no Supabase
- ✅ Service Pattern implementado
- ✅ Soft delete strategy

**Próxima Fase:** Orquestração para completar implementações presumidas e otimizar fluxos de pagamento/feature access.

---

**Análise Completa & Pronta para Planejamento de Orquestração**  
_SM Educa x VisionVII Enterprise Governance 3.0_
