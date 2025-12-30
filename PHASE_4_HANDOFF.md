# 🚀 FASE 4: Handoff — Instruções para Agentes

**Data:** 30 de Dezembro de 2025  
**De:** Orquestrador Central (GitHub Copilot)  
**Para:** ArchitectAI, FullstackAI, UIDirectorAI, QA Agent  
**Status:** PRONTO PARA EXECUÇÃO

---

## 📌 Contexto Anterior (FASE 3)

✅ **Completado:**

- Sidebar fixo com sticky layout
- Menu refatorado com novas rotas (students, activities, certificates)
- Widgets educacionais (StudyContinuity, Progress)
- PlanService com feature gating
- Middleware de proteção de rotas premium
- Hydration mismatch corrigido

**Arquivos críticos:**

- `src/components/dashboard/dashboard-shell.tsx` — Centro de navegação
- `src/lib/services/plan.service.ts` — Lógica de plano/features
- `src/middleware-feature-gating.ts` — Proteção de rotas

---

## 🎯 FASE 4: Consolidação e Integração

### **TASK 1: ArchitectAI — Settings Aninhadas**

**Objetivo:** Consolidar páginas de settings separadas em abas dentro de uma única rota.

**Rotas a Consolidar:**

```
TEACHER:
  /teacher/settings/theme → /teacher/settings (aba: "Tema")
  /teacher/settings       → /teacher/settings (aba: "Geral")

STUDENT:
  /student/profile        → /student/settings (aba: "Perfil")
  /student/settings       → /student/settings (aba: "Geral")

ADMIN:
  /admin/settings         → Manter como está (já singular)
```

**Arquivos a Criar/Modificar:**

1. `src/app/teacher/settings/page.tsx` — Página com Tabs (Geral, Tema, Notificações)
2. `src/app/student/settings/page.tsx` — Página com Tabs (Perfil, Geral, Privacidade)
3. Remover: `src/app/teacher/settings/theme/page.tsx`
4. Remover: `src/app/student/profile/page.tsx` (ou redirecionar para `/student/settings?tab=profile`)

**Validação:**

- [ ] URLs `/teacher/settings` e `/student/settings` funcionam
- [ ] Abas renderizam corretamente (default: "Geral")
- [ ] Sem warnings de rota não encontrada
- [ ] Query param `?tab=` funciona (ex: `/teacher/settings?tab=theme`)

---

### **TASK 2: FullstackAI — Redirect Global Middleware**

**Objetivo:** Adicionar middleware que redireciona `/` baseado no role do usuário.

**Comportamento:**

```
GET /
  ├─ Não autenticado → /login
  ├─ role === ADMIN → /admin
  ├─ role === TEACHER → /teacher/dashboard
  └─ role === STUDENT → /student/dashboard
```

**Arquivo a Criar:**

- `src/middleware.ts` (atualizar se existir, ou novo)

**Implementação:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const role = token.role as string;
    const redirectMap: Record<string, string> = {
      ADMIN: '/admin',
      TEACHER: '/teacher/dashboard',
      STUDENT: '/student/dashboard',
    };

    const redirectUrl = redirectMap[role] || '/login';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
```

**Validação:**

- [ ] `/` com ADMIN → redireciona `/admin`
- [ ] `/` com TEACHER → redireciona `/teacher/dashboard`
- [ ] `/` com STUDENT → redireciona `/student/dashboard`
- [ ] `/` sem autenticação → redireciona `/login`

---

### **TASK 3: UIDirectorAI — Pages Refinement**

**Objetivo:** Refinar stub pages criadas em FASE 3 com melhor UX.

**Pages a Melhorar:**

1. `src/app/teacher/students/page.tsx`

   - Adicionar filtros: Status (Todos/Ativos/Inativos)
   - Adicionar search bar funcional (client-side)
   - Adicionar skeleton loading para dados

2. `src/app/teacher/activities/page.tsx`

   - Adicionar button "Nova Atividade" (modal/form)
   - Tabs: Recentes, Rascunhos, Publicadas
   - Badges de status (draft, published, archived)

3. `src/app/student/dashboard/page.tsx` (já aprimorado em FASE 3)
   - Validar widgets renderizam com dados corretos
   - Adicionar fallback skeleton se query loading

**Componentes a Criar (se necessário):**

- `src/components/teacher/students-table.tsx` — Tabela com estudantes
- `src/components/teacher/activity-editor-modal.tsx` — Modal para criar atividade
- `src/components/student/progress-chart.tsx` — Gráfico de progresso (futuros)

**Validação:**

- [ ] Pages carregam sem erros
- [ ] Skeletons exibem enquanto loading
- [ ] Filtros e search bars funcionam (client-side)
- [ ] Buttons abrem modals/forms esperados
- [ ] Responsivo em mobile

---

### **TASK 4: QA Agent — Testes Automatizados**

**Objetivo:** Criar testes automatizados para validar fluxos críticos.

**Testes a Implementar:**

#### 4.1 Testes de Autenticação e Redirecionamento

**Arquivo:** `tests/auth-redirect.spec.ts`

```typescript
describe('Auth Redirects', () => {
  it('should redirect unauthenticated user to /login', async () => { ... });
  it('should redirect ADMIN to /admin', async () => { ... });
  it('should redirect TEACHER to /teacher/dashboard', async () => { ... });
  it('should redirect STUDENT to /student/dashboard', async () => { ... });
  it('should deny STUDENT access to /admin', async () => { ... });
});
```

#### 4.2 Testes de Feature Gating

**Arquivo:** `tests/feature-gating.spec.ts`

```typescript
describe('Feature Gating', () => {
  it('should allow ADMIN access to all premium routes', async () => { ... });
  it('should block TEACHER (free) access to /teacher/ai-assistant', async () => { ... });
  it('should redirect to /checkout when accessing premium', async () => { ... });
  it('should allow TEACHER (premium) access to /teacher/mentorships', async () => { ... });
});
```

#### 4.3 Testes de Navegação

**Arquivo:** `tests/navigation.spec.ts`

```typescript
describe('Navigation', () => {
  it('should render sidebar with correct items per role', async () => { ... });
  it('should highlight active route in sidebar', async () => { ... });
  it('should show slot nav with correct locking status', async () => { ... });
});
```

**Framework sugerido:** Playwright ou Vitest
**Executar:** `npm run test` ou `npm run test:e2e`

**Validação:**

- [ ] Todos os testes passam
- [ ] Coverage >= 80% para rutas críticas
- [ ] CI/CD integrado no GitHub Actions

---

### **TASK 5: SecureOpsAI — Audit Logging**

**Objetivo:** Implementar logging de eventos críticos (failed access, plan changes).

**Eventos a Logar:**

1. Tentativa de acesso a rota premium por free user
2. Downgrade/upgrade de plano
3. Mudança de role
4. Failed login attempts

**Arquivo a Atualizar:**

- `src/lib/audit.service.ts` (já existe, expandir)

**Exemplo:**

```typescript
export async function logBlockedAccess(
  userId: string,
  route: string,
  reason: 'free_plan' | 'wrong_role'
) {
  await prisma.auditTrail.create({
    data: {
      userId,
      action: 'BLOCKED_ACCESS',
      targetId: route,
      targetType: 'ROUTE',
      metadata: JSON.stringify({ reason }),
    },
  });
}
```

**Validação:**

- [ ] Blocos de acesso registrados em `auditTrail`
- [ ] Query `/api/admin/activities` retorna logs
- [ ] Dashboard Admin exibe "Atividades Bloqueadas"

---

## 📋 Checklist de Entrega (FASE 4)

- [ ] **ArchitectAI:** Settings aninhadas com abas
- [ ] **FullstackAI:** Redirect global middleware em `/`
- [ ] **UIDirectorAI:** Pages refinadas com UX melhorada
- [ ] **QA Agent:** Testes automatizados passando
- [ ] **SecureOpsAI:** Audit logging implementado
- [ ] Documentação atualizada
- [ ] Build sem warnings/erros
- [ ] Pronto para staging/production

---

## 🔗 Interdependências

```
ArchitectAI (Settings)
  ↓ Depende de:
  └─ Tabs component (shadcn/ui)

FullstackAI (Middleware)
  ↓ Depende de:
  ├─ NextAuth (já existe)
  └─ Prisma session data

UIDirectorAI (Pages)
  ↓ Depende de:
  ├─ TanStack Query (react-query)
  ├─ shadcn/ui components
  └─ API routes (backend stubs)

QA Agent (Testes)
  ↓ Depende de:
  ├─ Playwright/Vitest
  └─ Staging environment

SecureOpsAI (Audit)
  ↓ Depende de:
  ├─ Prisma AuditTrail model
  └─ LogBlockedAccess function
```

---

## 🚨 Bloqueadores Potenciais

1. **API Routes não implementadas:** `/api/dashboard/teacher`, `/api/student/activities`

   - Workaround: Usar mock data em Storybook enquanto backend em desenvolvimento

2. **Prisma schema desatualizado:** Verificar se AuditTrail tem campos necessários

   - Comando: `npx prisma db push` (dev) ou `migrate deploy` (prod)

3. **NextAuth config:** Validar que token.role está sendo retornado
   - Check: `src/lib/auth.ts` — callbacks.jwt

---

## 📞 Comunicação Entre Agentes

**Checkin diário recomendado:**

- 09:00 — ArchitectAI finaliza settings
- 11:00 — FullstackAI testa middleware com settings
- 14:00 — UIDirectorAI integra dados nas pages
- 16:00 — QA Agent roda testes com novo fluxo
- 17:00 — SecureOpsAI valida logs

---

## 🎬 Go-Live Checklist

Antes de fazer deploy para production:

- [ ] Todos os testes E2E passam em staging
- [ ] Feature flags ativos para rollback (se necessário)
- [ ] Audit logs funcionando e armazenados
- [ ] Backup de database realizado
- [ ] Performance: LCP < 2.5s, CLS < 0.1
- [ ] Segurança: CSP headers, CORS validado, rate-limiting ativo
- [ ] Documentação atualizada no Notion/Wiki
- [ ] On-call engineer pronto para monitorar (primeiras 2 horas)

---

## 📖 Referências Úteis

- **Constituição do Projeto:** `c/.github/copilot-instructions.md`
- **Navegação FASE 3:** `PHASE_3_NAVIGATION_COMPLETE.md`
- **Relatório FASE 3:** `PHASE_3_EXECUTION_REPORT.md`
- **Next.js Docs:** https://nextjs.org/docs/advanced-features/middleware
- **Playwright Guide:** https://playwright.dev/docs/intro

---

**Assinado por:** Orquestrador Central  
**Data:** 30 de Dezembro de 2025  
**Próxima Review:** 2 de Janeiro de 2026 (FASE 4 Completion)

🎯 **Status:** PRONTO PARA INICIAR FASE 4
