# 🎼 PLANO DE ORQUESTRAÇÃO - FASE 5: DASHBOARD REFACTOR COMPLETO

**Governança:** VisionVII Enterprise Governance 3.0  
**Data:** 31 de Dezembro de 2025  
**Orquestrador:** GitHub Copilot (Agent Master)  
**Status:** 🚀 Em Execução

---

## 📋 MISSÃO ESTRATÉGICA

Reajustar a **Dashboard Admin** de forma completa e funcional sob 3 pilares:

1. ✅ **Pillar 1: Reposicionamento de Rotas** - Entender, reorganizar e testar TODAS as rotas
2. 💾 **Pillar 2: Persistência de Imagens** - Garantir que TODAS as imagens sejam realmente salvas no BD
3. 🔐 **Pillar 3: Lógica de Acesso a Features** - Admin 100% acesso, Free com restrictions

---

## 🏗️ ESTRUTURA DE EXECUÇÃO

### **PILLAR 1: ROTAS & MENUS** (ArchitectAI)

**Objetivo:** Mapear, implementar e testar todas as rotas admin

#### Fase 1.1 - Auditoria Completa

- [ ] Mapear 18 rotas descobertas
- [ ] Identificar rotas órfãs (10 pendentes)
- [ ] Revisar menu structure atual (admin-sidebar, admin-menu)
- [ ] Validar navegação e submenu lógica

#### Fase 1.2 - Implementação de Páginas Faltantes

**Prioridade: CRÍTICA** (6 páginas)

- [ ] `/admin/enrollments/page.tsx` - Gestão de matrículas
- [ ] `/admin/analytics/page.tsx` - Dashboard de analytics
- [ ] `/admin/messages/page.tsx` - Centro de mensagens
- [ ] `/admin/notifications/page.tsx` - Centro de notificações
- [ ] `/admin/reports/page.tsx` + submenu - Relatórios detalhados
- [ ] `/admin/security/page.tsx` - Auditoria e segurança

**Padrão:**

```tsx
// Service Pattern obrigatório
// RBAC: session.user.role === 'ADMIN'
// Zod validation em todas as APIs
// AuditService.logAuditTrail() em ações sensíveis
```

#### Fase 1.3 - Menu Reorganização

- [ ] Consolidar menu em estrutura única (admin-sidebar.tsx)
- [ ] Remover redundâncias (admin-menu.ts vs dashboard-shell)
- [ ] Implementar auto-expand em rotas ativas
- [ ] Adicionar breadcrumbs dinâmicos

**Novo Menu Structure:**

```
📊 Dashboard
👥 Usuários
  └─ Todos
  └─ Alunos
  └─ Professores
  └─ Administradores
📚 Cursos
  └─ Todos
  └─ Novo
  └─ Categorias
👤 Matrículas
💳 Financeiro
  └─ Pagamentos
  └─ Assinaturas
  └─ Relatórios
  └─ Stripe Config ✅
📈 Analytics
💬 Mensagens (badge count)
🔔 Notificações
📋 Relatórios
  └─ Geral
  └─ Acessos
  └─ Certificados
🔐 Segurança
  └─ Logs de Auditoria
  └─ Controle de Acesso
  └─ 2FA
⚙️ Configurações
  └─ Sistema
  └─ Tema
  └─ Empresa
```

---

### **PILLAR 2: PERSISTÊNCIA DE IMAGENS** (DBMasterAI)

**Objetivo:** Garantir que TODAS as imagens salvas sejam realmente persistidas

#### Fase 2.1 - Auditoria de Imagens Atuais

- [ ] Mapear onde as imagens são salvas:
  - Course thumbnails → `course_thumbnails` bucket
  - Public pages → `public-pages` bucket
  - User avatars → `user-avatars` bucket
  - Video thumbnails → `videos` bucket
- [ ] Verificar se há URLs no BD ou apenas paths
- [ ] Identificar uploads sem persistência

#### Fase 2.2 - Schema Prisma Enhancement

**Criar/Atualizar Models:**

```prisma
model Image {
  id String @id @default(cuid())
  url String @unique
  bucketPath String
  fileName String
  mimeType String
  fileSize Int
  uploadedBy String
  uploadedAt DateTime @default(now())
  deletedAt DateTime?

  // Relações
  courseId String?
  course Course? @relation(fields: [courseId], references: [id], onDelete: Cascade)

  userProfileId String?
  userProfile UserProfile? @relation(fields: [userProfileId], references: [id], onDelete: Cascade)

  publicPageId String?
  publicPage PublicPage? @relation(fields: [publicPageId], references: [id], onDelete: Cascade)

  @@index([courseId])
  @@index([userProfileId])
  @@index([uploadedAt])
}

model Course {
  // ... campos existentes
  thumbnailImageId String?
  thumbnailImage Image? @relation(fields: [thumbnailImageId], references: [id])
}
```

#### Fase 2.3 - ImageService Implementation

**Localização:** `src/lib/services/image.service.ts`

```typescript
class ImageService {
  // Salvar imagem com persistência BD
  async saveImage(file: File, metadata: ImageMetadata): Promise<Image>;

  // Recuperar imagem com fallback
  async getImage(id: string): Promise<string>;

  // Atualizar imagem (delete old, save new)
  async updateImage(id: string, file: File): Promise<Image>;

  // Soft delete com limpeza storage
  async deleteImage(id: string): Promise<void>;

  // Gerar signed URLs para Supabase
  async getSignedUrl(path: string, expiresIn: number): Promise<string>;

  // Validar arquivo antes de upload
  validateFile(file: File): ValidationResult;
}
```

#### Fase 2.4 - Implementar Upload com Persistência

**Todos os uploads devem:**

1. Validar arquivo (Zod)
2. Upload → Supabase Storage
3. Salvar metadados no BD (Image model)
4. Retornar record persistido

**Afetados:**

- `/admin/courses` - course thumbnails
- `/admin/settings/theme` - theme images
- `/admin/public-pages` - page images
- User profiles - avatars
- `/admin/users` - admin avatars

---

### **PILLAR 3: LÓGICA DE FEATURES** (SecureOpsAI)

**Objetivo:** Admin 100% acesso, Free com restrictions, Premium desbloqueado

#### Fase 3.1 - FeaturePurchase Audit

**Status Atual:**

- ✅ Chat IA: locked (featureId: `ai-assistant`)
- ✅ Mentorias: unlocked (featureId: `mentorships`)
- ✅ Ferramentas Pro: unlocked (featureId: `pro-tools`)

#### Fase 3.2 - Enhance FeatureControl Service

**Localização:** `src/lib/services/feature-control.service.ts`

```typescript
interface FeatureAccessPolicy {
  featureId: string;
  plans: {
    FREE: boolean;
    PREMIUM: boolean;
    ENTERPRISE: boolean;
  };
  roles: {
    STUDENT: boolean;
    TEACHER: boolean;
    ADMIN: boolean;
  };
  exceptions: string[]; // user IDs com acesso excepcional
}

class FeatureControlService {
  // Verificar se usuário tem acesso
  async canAccessFeature(
    userId: string,
    featureId: string,
    role: UserRole,
    plan: PlanType
  ): Promise<boolean>;

  // Listar features disponíveis para usuário
  async listAvailableFeatures(userId: string): Promise<Feature[]>;

  // Admin pode adicionar exceção
  async grantFeatureException(userId: string, featureId: string): Promise<void>;

  // Admin pode revogar exceção
  async revokeFeatureException(
    userId: string,
    featureId: string
  ): Promise<void>;

  // Get todas as exceptions (para admin dashboard)
  async getFeatureExceptions(): Promise<FeatureException[]>;
}
```

#### Fase 3.3 - Feature Policy Configuration

**Banco de Dados:**

```prisma
model FeaturePolicy {
  id String @id @default(cuid())
  featureId String @unique
  featureName String

  // Disponibilidade por plano
  availableInFree Boolean @default(false)
  availableInPremium Boolean @default(true)
  availableInEnterprise Boolean @default(true)

  // Disponibilidade por role
  availableForStudent Boolean @default(true)
  availableForTeacher Boolean @default(true)
  availableForAdmin Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model FeatureException {
  id String @id @default(cuid())
  userId String
  featureId String
  grantedBy String
  grantedAt DateTime @default(now())
  expiresAt DateTime?
  reason String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  grantedByUser User @relation("grantedExceptions", fields: [grantedBy], references: [id])

  @@unique([userId, featureId])
}
```

#### Fase 3.4 - Admin Dashboard: Feature Manager

**Página:** `/admin/features/page.tsx`

```tsx
export default function AdminFeaturesPage() {
  // Mostrar:
  // 1. Todas as features e suas políticas (editar por plano/role)
  // 2. Exceções ativas (table com user, feature, grant date, expiry)
  // 3. Bulk actions (grant to multiple users, revoke exceptions)
  // 4. Audit log de mudanças
}
```

#### Fase 3.5 - Verificação em Componentes

**Atualizar todos os componentes que mostram features:**

```tsx
// Antes:
{
  slotNavigation.map((item) => {
    const isLocked = item.locked;
    // ...
  });
}

// Depois:
{
  slotNavigation.map((item) => {
    const hasAccess = await checkFeatureAccess(userId, item.featureId);
    const hasException = await hasFeatureException(userId, item.featureId);
    // Se ADMIN: sempre mostrar
    // Se Free + locked + sem exception: mostrar locked
    // Se Premium: mostrar desbloqueado
  });
}
```

---

## 🎯 VISÃO MULTI-PERSPECTIVA DA DASHBOARD

### 👨‍💻 **PERSPECTIVA DESENVOLVEDOR**

Dashboard para:

- 🔍 Monitorar health do sistema
- 🐛 Ver logs de erro em tempo real
- ⚡ Performance metrics (API response time, DB queries)
- 🔧 Dev tools (cache clear, job queues, DB cleanup)
- 📊 Metrics: Active users, API calls, Storage usage

**Implementar:**

- `/admin/system/health` - System status
- `/admin/developer/metrics` - Performance dashboard
- `/admin/developer/logs` - Real-time logs
- `/admin/developer/tools` - Dev utilities

---

### 💼 **PERSPECTIVA RH/FINANÇAS**

Dashboard para:

- 👥 Total usuários (breakdown por role)
- 💰 Revenue (recorrente, one-time)
- 📊 Plano breakdown (FREE, PREMIUM, ENTERPRISE)
- 🎓 Course sales & performance
- 👨‍🏫 Teacher earnings
- 📈 Growth trends (MoM, YoY)

**Implementar:**

- `/admin/reports/financial` - Financial analysis
- `/admin/reports/users` - User demographics
- `/admin/reports/courses` - Course performance
- `/admin/reports/revenue` - Revenue breakdown

---

### 🚀 **PERSPECTIVA EMPREENDEDOR**

Dashboard para:

- ⭐ Top courses (engagement, ratings, revenue)
- 🎯 Content strategy (gaps, trends, recommendations)
- 👥 Student success (completion rate, certificates issued)
- 🏆 Teacher performance (student ratings, course sales)
- 💡 Growth opportunities (feature adoption, upsell)
- 🌍 Market insights (regional trends, popular topics)

**Implementar:**

- `/admin/insights/overview` - Business intelligence
- `/admin/insights/content` - Content performance
- `/admin/insights/engagement` - User engagement
- `/admin/insights/growth` - Growth strategies

---

## 🚦 ROADMAP DE EXECUÇÃO

### **SEMANA 1: FUNDAÇÃO**

- [ ] ArchitectAI: Mapear todas as 18 rotas
- [ ] DBMasterAI: Criar Image model + migrations
- [ ] SecureOpsAI: Implementar FeaturePolicy + FeatureException models

### **SEMANA 2: PÁGINAS FALTANTES**

- [ ] Implementar 6 páginas órfãs (/enrollments, /analytics, /messages, /notifications, /reports, /security)
- [ ] Integrar com Services (EnrollmentService, AnalyticsService, etc)
- [ ] Adicionar RBAC em todas

### **SEMANA 3: PERSISTÊNCIA DE IMAGENS**

- [ ] ImageService completo
- [ ] Atualizar todos os uploads (Course, PublicPages, Users)
- [ ] Implementar signed URLs
- [ ] Criar cleanup job para imagens órfãs

### **SEMANA 4: FEATURES & DASHBOARD MULTI-PERSPECTIVA**

- [ ] FeatureControlService + exceptions
- [ ] Feature Manager admin page
- [ ] Implementar perspectivas (Developer, RH/Finance, Entrepreneur)
- [ ] Testes e validação

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica                   | Target           | Current    | Status |
| ------------------------- | ---------------- | ---------- | ------ |
| **Rotas Implementadas**   | 18/18            | 8/18       | 44%    |
| **Menu Consolidado**      | 1 único          | 3 arquivos | ❌     |
| **Imagens Persistidas**   | 100%             | ~60%       | ⚠️     |
| **Features com Policy**   | 100%             | 0%         | ❌     |
| **Admin Dashboard Views** | 3 (Dev/RH/Biz)   | 0          | ❌     |
| **RBAC em Rotas**         | 100%             | ~70%       | ⚠️     |
| **Teste Completo**        | Pass 18/18 rotas | N/A        | ❓     |

---

## 🤝 DELEGAÇÃO DE AGENTES

| Agent           | Responsável             | Tarefas             |
| --------------- | ----------------------- | ------------------- |
| **ArchitectAI** | Rotas & Menu Structure  | 1.1, 1.2, 1.3       |
| **DBMasterAI**  | Imagens & Schema        | 2.1, 2.2, 2.4       |
| **SecureOpsAI** | Features & RBAC         | 3.1, 3.2, 3.3, 3.5  |
| **FullstackAI** | Services & Pages        | 2.3, Implementation |
| **DevOpsAI**    | Deployment & Monitoring | Validação Final     |

---

## ⚠️ CONSIDERAÇÕES CRÍTICAS

1. **Soft Deletes Obrigatórios** - Image model deve ter `deletedAt`
2. **Sem Server Actions** - Usar API Routes REST apenas
3. **Transações** - `prisma.$transaction` para múltiplas operações
4. **Audit Trail** - AuditService.logAuditTrail() em TODAS ações admin
5. **Tipo de Storage** - Sempre Supabase Storage (não fs.writeFile)
6. **URLs Assinadas** - Usar signed URLs para imagens privadas

---

**Próxima Ação:** Aguardando confirmação para iniciar Fase 1.1 (ArchitectAI - Auditoria Completa de Rotas)
