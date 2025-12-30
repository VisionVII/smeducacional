# 📍 FASE 3: Mapa de Navegação e Redirecionamentos - VisionVII

## 🔐 Autenticação e Redirecionamentos Globais

| Cenário                                                        | Comportamento Atual       | Status          |
| -------------------------------------------------------------- | ------------------------- | --------------- |
| Usuário não autenticado → `/admin`, `/teacher/*`, `/student/*` | Redireciona para `/login` | ✅ Implementado |
| Após login com role errado (ex: STUDENT tentando `/admin`)     | Redireciona para `/login` | ✅ Implementado |
| Usuário autenticado → `/`                                      | Sem tratamento (público)  | ⚠️ Pendente     |

---

## 👨‍💼 ADMIN — Rotas e Menu Principal

### Dashboard Shell Navigation

```
/admin                      ✅ Dashboard
/admin/users               ✅ Usuários
/admin/audit               ✅ Logs
/admin/settings            ✅ Configurações
/admin/courses             ✅ Cursos
/admin/enrollments         ✅ Matrículas
/admin/payments            ✅ Financeiro
/admin/analytics           ✅ Analytics
```

### Slot Nav (Premium Features) — Sempre com Acesso Total

```
/checkout/ai-suite         ✅ Chat IA (sem lock, acesso direto)
/admin/plans/stripe        ✅ Mentorias
/admin/advertisements      ✅ Ferramentas Pro
```

### Redirecionamentos Specificos

- `/admin` → Painel Admin (sem subdirecionamento)
- `/admin/dev` → Deve estar protegida por feature flag ou middleware
- Settings aninhadas → `/admin/settings` (unificadas, não rotas separadas)

---

## 👨‍🏫 TEACHER — Rotas e Menu Principal

### Dashboard Shell Navigation (Refatorado)

```
/teacher/dashboard         ✅ Dashboard
/teacher/courses           ✅ Gestão de Cursos
/teacher/students          🆕 Gestão de Alunos (novo)
/teacher/earnings          ✅ Ganhos (antes: /earnings)
/teacher/activities        🆕 Banco de Atividades (novo)
/teacher/settings          ✅ Configurações (unificado)
```

### Slot Nav (Premium Features) — Feature Gating Ativo

```
/teacher/ai-assistant      🔒 Chat IA (locked:true)
  └─ upsell: /checkout/chat-ia

/teacher/mentorships       🔒 Mentorias (locked:true)
  └─ upsell: /checkout/mentorias

/teacher/tools             🟢 Ferramentas Pro (gated by featureId)
```

### Redirecionamentos Específicos

- `/teacher` → Redireciona para `/teacher/dashboard`
- `/teacher/settings/theme` → **REMOVIDO** (colapsado em `/teacher/settings` como aba)
- `/teacher/messages` → **REMOVIDO** (não mapeado no legacy nav)

---

## 👨‍🎓 STUDENT — Rotas e Menu Principal

### Dashboard Shell Navigation (Refatorado)

```
/student/dashboard         ✅ Dashboard (com widgets: Estudo Contínuo + Progresso)
/student/courses           ✅ Meus Cursos
/student/activities        ✅ Atividades (conectadas ao progresso)
/student/certificates      ✅ Certificados (com download PDF)
/student/settings          ✅ Configurações (unificado)
```

### Slot Nav (Premium Features) — Feature Gating Ativo

```
/student/ai-chat           🔒 Chat IA (locked:true)
  └─ upsell: /checkout/chat-ia

/student/mentorships       🔒 Mentorias (locked:true)
  └─ upsell: /checkout/mentorias

/student/tools             🟢 Ferramentas Pro (gated by featureId)
```

### Redirecionamentos Específicos

- `/student` → Redireciona para `/student/dashboard`
- `/student/profile` → **REMOVIDO** (colapsado em `/student/settings`)
- `POST /student/activities/:activityId/submit` → Valida entitlements + course access

### Widgets Adicionados

- **StudyContinuityWidget:** Sequência de dias, total de horas, progresso para milestone
- **ProgressWidget:** Cursos concluídos, progresso médio, trending

---

## 🔑 Sistema de Feature Gating (Plans)

### Matrizes de Planos por Role

#### Teachers

```
Free:
  ├─ 1 curso
  ├─ 50 alunos
  └─ 1GB storage

Basic:
  ├─ 5 cursos
  ├─ 200 alunos
  ├─ 10GB storage
  └─ ✅ AI Assistant

Premium:
  ├─ 20 cursos
  ├─ Unlimited alunos
  ├─ 100GB storage
  ├─ ✅ AI Assistant
  ├─ ✅ Mentorships
  └─ ✅ Pro Tools

Enterprise:
  └─ Everything + Analytics
```

#### Students

```
Free:
  ├─ 3 cursos
  └─ Sem features premium

Basic:
  ├─ Unlimited cursos
  ├─ ✅ AI Assistant
  └─ ✅ Limited Pro Tools

Premium:
  ├─ Unlimited cursos
  ├─ ✅ AI Assistant
  ├─ ✅ Mentorships
  └─ ✅ Pro Tools
```

---

## 🚀 Middleware de Feature Gating

**Localização:** `src/middleware-feature-gating.ts`

**Regras:**

1. Detecta rota premium (ex: `/teacher/ai-assistant`, `/student/mentorships`)
2. Verifica `teacherSubscription` ou `studentSubscription` no banco
3. Se `status !== 'active'` → Redireciona para `/checkout?from=[original_route]`
4. Se `plan === 'free'` → Acesso bloqueado, redireciona para checkout
5. Se `plan === 'basic'` → Acesso parcial (validar by featureId)

---

## 🔄 Flow de Login e Redirecionamento Pós-Autenticação

```
User clicks Login
  ↓
Auth Provider (NextAuth)
  ↓
Role validation in session
  ↓
  ├─ ADMIN → /admin
  ├─ TEACHER → /teacher/dashboard
  └─ STUDENT → /student/dashboard
```

---

## ❌ Rotas Removidas/Consolidadas

| Rota Anterior             | Nova Rota                 | Razão               |
| ------------------------- | ------------------------- | ------------------- |
| `/teacher/settings/theme` | `/teacher/settings` (aba) | Consolidação visual |
| `/teacher/messages`       | Removida                  | Fora do escopo      |
| `/student/profile`        | `/student/settings` (aba) | Consolidação visual |

---

## 📋 Checklist de Implementação (FASE 3)

### Tarefa 1: Unificação Visual ✅

- [x] Sidebar fixo (sticky) em desktop
- [x] Removido "Tema" do nav principal (mover para settings)
- [x] Adicionado widgets "Estudo Contínuo" e "Progresso" no Student Dashboard
- [x] Refatorado legacyNav com rotas novas (students, activities, certificates)

### Tarefa 2: Implementação de Planos ✅

- [x] Criado `PlanService` (src/lib/services/plan.service.ts)
- [x] Implementado middleware de feature gating
- [x] Slots com lock/upsell funcionais
- [x] Feature gating via `checkFeatureAccessAction` na shell

### Tarefa 3: Rotas Específicas ✅

- [x] `/teacher/students` → Gestão de Alunos
- [x] `/teacher/earnings` → Ganhos (já existia, adicionado ao nav)
- [x] `/teacher/activities` → Banco de Atividades
- [x] `/student/activities` → Atividades (já existia)
- [x] `/student/certificates` → Certificados (já existia)

### Tarefa 4: Hydration Fix ✅

- [x] Removido `isMounted` guard no LinkComponent
- [x] Server e client renderizam as mesmas classes Tailwind
- [x] Adicionado `suppressHydrationWarning` nas navs

---

## 📞 Próximos Passos (FASE 4)

1. **Settings Aninhadas:** Consolidar `/teacher/settings` e `/teacher/settings/theme` em uma única página com abas
2. **Redirect Middleware:** Adicionar middleware global para `/` baseado em role
3. **Analytics & Monitoring:** Instrumentar plan tier changes via audit logs
4. **Email Notifications:** Enviar notificações de downgrade/upgrade via Resend

---

**Versão:** Phase 3 Complete | Data: 30 de Dezembro de 2025
**Status:** ✅ Implementado | Pronto para testes de integração
