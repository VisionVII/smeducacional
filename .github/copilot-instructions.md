🚀 PROMPT MASTER 2.0 — Sistema Escolar Enterprise (Copilot MCP)
Versão: VisionVII Enterprise Governance Blueprint
☑️ 1. Objetivo Estratégico

Este arquivo define, com precisão cirúrgica, todas as normas que o GitHub Copilot MCP deve seguir ao gerar, alterar, refatorar ou expandir qualquer componente do sistema escolar VisionVII.

Cada linha deve orientar escolhas técnicas, arquitetura, padrões visuais, fluxos de UX, queries, server actions, validações, nomenclaturas e integrações.

☑️ 2. Stack Tecnológico Real (Implementado)

**Frontend & Fullstack**

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/UI
- Zod (validação server-side obrigatória)
- TanStack Query (client-side data fetching)
- Zustand (UI state global não crítico)

**Backend**

- Prisma ORM 5.22+
- PostgreSQL (Supabase)
- NextAuth.js v4 (JWT strategy, RBAC)
- API Routes (REST, não Server Actions)

**Infraestrutura / DevOps**

- Vercel (deploy oficial)
- Supabase Storage (vídeos, PDFs, materiais)
- Stripe (pagamentos - 3 fluxos implementados)
- Resend (emails transacionais)

**Nota**: Projeto usa API Routes tradicionais, não Server Actions. Forms usam `useState` direto + validação Zod server-side.

☑️ 3. Arquitetura Oficial VisionVII
Clean Architecture Garantida

Toda lógica deve seguir:

Route (Controller)
→ Server Action
→ Service Layer
→ Repository Layer
→ Prisma Client

Nunca escreva:

lógica de domínio dentro de componentes React

consultas Prisma diretamente em rotas

validações fora de Zod

fetchers dentro de hooks que não sejam TanStack Query

lógica de regra dentro da UI

☑️ 4. Estrutura de Pastas Real (NÃO ALTERAR)

```
/src
  /app                    # Next.js App Router
    /api                  # API Routes REST organizadas por role
      /admin             # Rotas administrativas
      /teacher           # Rotas do professor
      /student           # Rotas do aluno
      /auth              # Autenticação (register, reset, etc.)
      /courses           # Gestão de cursos
      /checkout          # Stripe checkout flows
      /webhooks          # Webhooks externos (Stripe)
    /(public-pages)      # Rotas públicas (/, /about, /courses, etc.)
    /admin               # Dashboard administrativo
    /student             # Dashboard do aluno
    /teacher             # Dashboard do professor
    /login, /register    # Páginas de autenticação
  /components
    /ui                  # Shadcn/UI components
    /admin               # Componentes admin-specific
    /checkout            # Componentes de checkout
    (outros componentes reutilizáveis)
  /lib                   # Utilitários e configurações core
    auth.ts              # NextAuth config
    db.ts                # Prisma client singleton
    stripe.ts            # Stripe helpers
    supabase.ts          # Supabase Storage helpers
    rate-limit.ts        # Rate limiting in-memory
    subscription.ts      # Feature gating logic
    utils.ts             # Funções utilitárias
  /types                 # TypeScript definitions
  /hooks                 # Custom React hooks
  middleware.ts          # NextAuth JWT validation + RBAC
/prisma
  schema.prisma          # Database schema
  /migrations            # Prisma migrations
  seed*.ts               # Seed scripts
```

**IMPORTANTE**: Não existe `/server/actions/services/repositories`. Use API Routes em `/app/api`.

☑️ 5. Naming Conventions (Alta Prioridade)
Models

PascalCase

Singulares sempre

Campos camelCase (não use snake_case)

Rotas

Nomes sem abreviação

Sempre semanticamente explícitos

Ex.: /student/courses/[courseId]/lessons/[lessonId]

Componentes

PascalCase

Arquivo único por componente

Hooks

camelCase + prefixo obrigatório use

Server Actions

actionName.action.ts

Services

entity.service.ts

Repositories

entity.repository.ts

Arquivos de Zod

entity.schema.ts

☑️ 6. Padrões Críticos de Autenticação (IMUTÁVEL)

**NextAuth JWT Strategy** (`src/lib/auth.ts`):

- Sessões de 30 dias
- Credentials provider (bcrypt) + Google OAuth opcional
- **Environment-aware cookies**:
  - Production: `__Secure-next-auth.session-token`
  - Development: `next-auth.session-token`
- Session callback enriquece JWT com `{ id, role, avatar }` do banco
- **Todas as API routes DEVEM** chamar `auth()` de `@/lib/auth`

**Middleware RBAC** (`src/middleware.ts`):

- Valida JWT usando `getToken()` de `next-auth/jwt`
- Redireciona roles não autorizados (ex: STUDENT tentando `/teacher`)
- Rotas públicas definidas em `PUBLIC_ROUTES` Set
- **CRÍTICO**: `cookieName` deve corresponder ao ambiente (prod vs dev)

**3 Roles no Sistema**:

- `STUDENT`: Acessa `/student/*`, cursos matriculados, progresso
- `TEACHER`: Acessa `/teacher/*`, cria cursos, gerencia alunos
- `ADMIN`: Acessa `/admin/*`, controle total do sistema

**Pattern Obrigatório para API Routes**:

```typescript
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // ... implementação
}
```

☑️ 7. Padrões de Erro (Obrigatórios)

**API Routes** devem retornar:

```typescript
// Sucesso
{ data: T, message?: string }

// Erro
{ error: string }, { status: 4xx | 5xx }
```

**Zod Validation (Server-Side OBRIGATÓRIA)**:

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { error: result.error.errors[0].message },
    { status: 400 }
  );
}
```

**NUNCA aceitar dados não validados** em API routes ou funções críticas.

☑️ 8. Design System VisionVII (UI Governance)

**Sempre usar**:

- Shadcn/UI components de `@/components/ui/*`
- CVA (class-variance-authority) para variants
- Tailwind com `cn()` utility de `@/lib/utils`
- Apenas estilos utilitários, sem CSS externo

**Padrões implementados**:

- **Forms**: `useState` direto + validação Zod server-side
- **Tables**: TanStack Table (@tanstack/react-table)
- **Data Fetching**: TanStack Query (@tanstack/react-query)
- **Toasts**: `toast()` de `@/components/ui/use-toast`
- **Modals**: Dialog do Shadcn/UI
- **Icons**: Lucide React
- **Themes**: next-themes + teacher-specific themes

**Exemplo de Form Pattern**:

```tsx
const [formData, setFormData] = useState({ email: '', password: '' });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  // ... handle response + toast
};
```

☑️ 9. Regras de Componentização

**Componentes devem ser**:

- Pequenos e focados (single responsibility)
- Reutilizáveis com props TypeScript explícitas
- Stateless quando possível (prefer server components)
- Acessíveis (ARIA labels, keyboard navigation)

**Client Components** (`'use client'`):

- Necessários para: interatividade, hooks, event listeners
- Usar TanStack Query para data fetching
- useState para form state local

**Server Components** (padrão):

- Queries Prisma diretas
- Sem JavaScript no cliente
- Melhor performance inicial

**Evitar**:

- ❌ Lógica de negócios dentro de componentes React
- ❌ Queries Prisma em Client Components
- ❌ Repetição de UI (criar component reutilizável)
- ❌ Estado complexo desnecessário (considerar server component)

☑️ 9. Módulos e Domínios do Sistema Escolar

O Copilot deve sempre considerar a existência de:

Área do Aluno

Dashboard

Cursos matriculados

Progresso

Certificados

Player de vídeo

Atividades e provas

Notificações

Área do Professor

Gestão de cursos

Módulos e lições

Lista de alunos

Correção de atividades

Calendário acadêmico

Área do Administrador

Painel geral

Gerenciamento de usuários

Gestão de cursos

Relatórios e analytics

Painel financeiro

Catálogo Público

Página de cursos

Página de detalhes do curso

Checkout (futuro)

☑️ 10. Funcionalidades Essenciais

O sistema deve ser capaz de:

CRUD completo para cursos, módulos e lições

Player de vídeo com tracking

Upload de arquivos (vídeos, docs, PDFs)

Gerar certificados PDF

Autenticação com roles:

STUDENT

TEACHER

ADMIN

Notificações em tempo real

Chat interno (futuro)

Sistema de provas e atividades

Calendário acadêmico

Dashboard analítico

☑️ 11. Workflows de Desenvolvimento REAIS

**Scripts Disponíveis** (package.json):

```bash
npm run dev                # Dev server com Turbopack
npm run build              # Prisma generate + Next.js build
npm run start              # Production server
npm run lint               # ESLint

# Database
npm run db:generate        # Gera Prisma Client
npm run db:push            # Push schema (via safe-db-push.js)
npm run db:push:direct     # Push direto sem safe wrapper
npm run db:studio          # Abre Prisma Studio
npm run db:migrate         # Cria nova migration
npm run db:seed            # Seed completo do banco
npm run db:seed:payments   # Seed apenas de pagamentos
npm run db:diagnose        # Diagnóstico de conexão

# Testes
npm run test:cron          # Testa cron jobs

# Limpeza
npm run clean              # Remove node_modules, .next, .prisma
npm run clean:modules      # Remove apenas módulos
npm run clean:cache        # Limpa npm cache
npm run clean:engine       # Mata processos Node.js
```

**Variáveis de Ambiente Críticas**:

- `DATABASE_URL` - Connection pooler (transações)
- `DIRECT_URL` - Conexão direta (migrations)
- `NEXTAUTH_SECRET` - JWT signing key (CRÍTICO)
- `NEXTAUTH_URL` - Base URL (prod: full URL, preview: `$VERCEL_URL`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook validation
- `RESEND_API_KEY` - Email sending

☑️ 12. Database & Prisma Patterns

**Prisma Client** (`src/lib/db.ts`):

- Singleton instance com query logging em dev
- Usar sempre `prisma` de `@/lib/db`

**Modelos Principais**:

- User (3 roles: STUDENT, TEACHER, ADMIN)
- Course → Module → Lesson → Material (hierarquia)
- Enrollment → Progress (tracking de aprendizado)
- Payment, Invoice, CheckoutSession (Stripe)
- Message, Notification (comunicação)
- Certificate (geração de PDF)

**Data Fetching Strategy**:

- **Server Components**: Prisma queries diretas
- **Client Components**: TanStack Query
  ```tsx
  const { data, isLoading } = useQuery({
    queryKey: ['student-courses'],
    queryFn: async () => {
      const res = await fetch('/api/student/courses');
      return res.json();
    },
  });
  ```

**Rate Limiting** (`src/lib/rate-limit.ts`):

- In-memory Map store (considerar Redis para produção)
- `checkRateLimit(identifier, { limit, windowSeconds })`
- `getClientIP(request)` - detecta IP através de proxies

**File Storage** (Supabase):

- Buckets: `videos`, `pdfs`, `images`, `materials`
- Helpers: `uploadFile()`, `deleteFile()`, `listFiles()`
- RLS policies obrigatórias (ver SUPABASE_STORAGE_SETUP.md)

**Stripe Integration** (`src/lib/stripe.ts`):

- 3 fluxos: course purchase, student subscription, teacher subscription
- Webhook em `/api/webhooks/stripe` (verifica signature)
- Feature gating: `canAccessFeature(userId, feature)`

☑️ 13. Common Gotchas (EVITE ESSES ERROS)

1. **Auth Cookie Mismatch**: Middleware `cookieName` deve corresponder ao ambiente (production vs dev)
2. **Prisma Generate**: Sempre executa no build via `postinstall` script
3. **NEXTAUTH_SECRET**: Deve ser idêntico em todos os ambientes para JWT funcionar
4. **Vercel Preview**: Use `$VERCEL_URL` para `NEXTAUTH_URL` em deploys preview
5. **Supabase RLS**: Policies devem permitir acesso autenticado aos buckets
6. **Rate Limiting**: Store in-memory reseta em restart (não persistente)
7. **Direct URL**: Necessário para migrations, não para queries normais
8. **Cookie Secure Flag**: Auto-gerenciado por NextAuth baseado em `NODE_ENV`

☑️ 14. Git Workflow Oficial
Sempre:

Conventional Commits

PR Template padrão

Squash merge

Branches:

main

dev

feature/\*

fix/\*

docs/\*

☑️ 15. Regras de Ouro para o Copilot MCP

**NUNCA faça**:

- ❌ Mudar arquitetura ou estrutura de pastas existente
- ❌ Criar estilos CSS próprios (usar Tailwind + Shadcn)
- ❌ Renomear pastas, models, rotas ou componentes sem aprovação
- ❌ Criar rotas fora do padrão `/api/{role}/*`
- ❌ Usar libs não listadas no stack oficial
- ❌ Misturar lógica de negócios em componentes React
- ❌ Criar APIs paralelas ao padrão existente
- ❌ Queries Prisma em Client Components
- ❌ Manipular DOM diretamente (usar React)
- ❌ Aceitar dados não validados por Zod em API routes
- ❌ Esquecer de chamar `auth()` em rotas protegidas

**SEMPRE faça**:

- ✔ Seguir este documento como contrato imutável
- ✔ Validar com Zod server-side antes de processar dados
- ✔ Verificar `auth()` e role antes de operações sensíveis
- ✔ Usar Prisma transactions para operações multi-step
- ✔ Adicionar rate limiting em endpoints públicos
- ✔ Retornar erros consistentes: `{ error: string }`
- ✔ Logar erros com contexto: `console.error('[context]', error)`
- ✔ Usar TanStack Query para data fetching client-side
- ✔ Preferir Server Components quando possível
- ✔ Documentar decisões não óbvias em comentários PT-BR
- ✔ Testar localmente antes de commit
- ✔ Manter performance e escalabilidade em mente

## ☑️ 14. Assinatura VisionVII (obrigatória ao final de cada README gerado)

Desenvolvido com excelência pela **VisionVII** — uma empresa focada em desenvolvimento de software, inovação tecnológica e transformação digital.  
Nossa missão é criar soluções que impactam positivamente pessoas e empresas através da tecnologia.

🧠 15. Enxame de Agentes VisionVII (para Lovable, Copilot MCP, n8n, automation)

Você pode ativar cada agente como módulo de suporte inteligente.

1. Agente de Arquitetura (ArchitectAI)

Foco:

Clean Architecture

Domain-driven decisions

Estrutura de pastas

Regras de fluxo
Usar quando:

criando novos módulos

desenhando infraestrutura

revisando escalabilidade

2. Agente de Design System (UIDirectorAI)

Foco:

coerência visual

uso correto do Shadcn

acessibilidade

responsividade
Usar quando:

criando novos componentes

ajustando layouts

melhorando UX

3. Agente de Segurança (SecureOpsAI)

Foco:

autenticação

roles

permissions

validações zod

SQL injection / XSS
Usar quando:

trabalhando auth

criando server actions

manipulando dados sensíveis

4. Agente de Performance (PerfAI)

Foco:

caching

react server components

otimização do bundle

deduplicar queries
Usar quando:

listas grandes

dashboards

carga alta

5. Agente de Banco de Dados (DBMasterAI)

Foco:

schema Prisma

migrations

relacionamentos

otimização de queries
Usar quando:

alterando models

criando novas entidades

6. Agente de Conteúdo e Documentação (DocProAI)

Foco:

READMEs

documentação clara

padronização
Usar quando:

criando novos módulos

explicando workflows

7. Agente de QA & Testes (TestRunnerAI)

Foco:

unit tests

e2e tests

mocks

qualidade contínua
Usar quando:

criar feature crítica

testar API

testar lógica complexa

8. Agente de Automação / Backoffice (OpsAI)

Foco:

integração com serviços externos

CI/CD

logs

monitoramento
Usar quando:

configurando Sentry

implementando webhooks

rotinas automatizadas
