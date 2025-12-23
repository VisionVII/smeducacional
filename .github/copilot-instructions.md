🚀 PROMPT MASTER 2.0 — Sistema Escolar Enterprise (Copilot MCP)

---

## ☑️ Checklist de Segurança VisionVII (SecureOpsAI)

| Item              | O que checar                                                                | Onde/Como                                |
| ----------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| **Autenticação**  | Toda rota protegida chama `auth()`                                          | Exemplo: `/src/app/api/admin/*`          |
| **Autorização**   | Checagem de `session.user.role` antes de ações sensíveis                    | Exemplo: `session.user.role === 'ADMIN'` |
| **Validação**     | Todos inputs validados com Zod antes de qualquer lógica                     | Exemplo: `schema.safeParse(body)`        |
| **Sanitização**   | Não aceite HTML raw, Zod previne XSS básico                                 |                                          |
| **Rate Limiting** | Endpoints públicos usam `checkRateLimit` e `getClientIP`                    | `/src/lib/rate-limit.ts`                 |
| **Uploads**       | Nunca use filesystem local, só Supabase Storage                             | `/src/lib/supabase.ts`                   |
| **Secrets**       | Nunca exponha secrets no client, só `NEXT_PUBLIC_`                          |                                          |
| **Respostas**     | Nunca retorne dados sensíveis, use `{ data }` ou `{ error }`                |                                          |
| **Logs**          | Não logar senhas, tokens ou detalhes sensíveis                              |                                          |
| **Senhas**        | Sempre hash com bcrypt (12 rounds), nunca plain text                        |                                          |
| **CORS**          | Verificar config em `next.config.ts`                                        |                                          |
| **SQL Injection** | Sempre use Prisma ORM                                                       |                                          |
| **Campos Prisma** | Use nomes corretos: `instructor`, `isPublished`, `categoryId`, `enrolledAt` | `/prisma/schema.prisma`                  |

### Exemplo de API Route Segura

```typescript
import { auth } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success)
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  // ... lógica segura
}
```

---

Versão: VisionVII Enterprise Governance Blueprint
☑️ 1. Objetivo Estratégico

Este arquivo define, com precisão cirúrgica, todas as normas que o GitHub Copilot MCP deve seguir ao gerar, alterar, refatorar ou expandir qualquer componente do sistema escolar VisionVII.

Cada linha deve orientar escolhas técnicas, arquitetura, padrões visuais, fluxos de UX, queries, server actions, validações, nomenclaturas e integrações.

☑️ 2. Stack Tecnológico Real (Implementado)

**Frontend & Fullstack**

- Next.js 16.1.0 (App Router + Turbopack)
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

**API Routes Pattern (Implementado)**:

```
Client Component
  → fetch('/api/...')
    → API Route Handler
      → Zod Validation
      → auth() check
      → Prisma Query
      → Response
```

**Nunca escreva**:

- ❌ Lógica de domínio dentro de componentes React
- ❌ Queries Prisma diretamente em Client Components
- ❌ Validações fora de Zod schemas
- ❌ Fetchers dentro de hooks que não sejam TanStack Query
- ❌ Lógica de regra dentro da UI
- ❌ Server Actions (projeto não usa)

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

**Rotas API Admin Implementadas** (mapa completo):

```
/api/admin
  /users
    GET    - Listar usuários com filtros (role, search, pagination)
    POST   - Criar novo usuário (bcrypt hash, validação Zod)
  /users/[id]
    GET    - Detalhes do usuário
    PUT    - Atualizar usuário (email uniqueness check)
    DELETE - Remover usuário (cascade via Prisma)

  /profile
    GET    - Perfil do admin logado (bio, phone, avatar)
    PUT    - Atualizar perfil (email uniqueness, Zod validation)

  /password
    PUT    - Trocar senha (bcrypt verify + hash, prevent reuse)

  /avatar
    POST   - Upload avatar (Supabase Storage, delete old)

  /stats
    GET    - Dashboard statistics (users, courses, enrollments, revenue)

  /activities
    GET    - Feed de atividades recentes (users, enrollments, courses)

  /courses
    GET    - Listar cursos (filtros: search, status, category)
  /courses/[id]
    PUT    - Atualizar curso (isPublished, categoryId, instructor)
    DELETE - Remover curso (check active enrollments first)

  /system-config
    GET    - Configurações do sistema
    PUT    - Atualizar configurações (Zod validation)

  /system-theme
    PUT    - Atualizar tema (preset validation)
    DELETE - Resetar tema para default
```

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

☑️ 6. Segurança VisionVII (SecurityOpsAI)

**Autenticação & Autorização (NextAuth JWT, RBAC)**

- Sempre use `auth()` de `/src/lib/auth.ts` em TODAS as rotas protegidas.
- Session JWT enriquece com `{ id, role, avatar }` (garanta que role está presente e correta).
- Cookies de sessão: `__Secure-next-auth.session-token` (prod) e `next-auth.session-token` (dev). Nunca misture ambientes.
- Middleware (`/src/middleware.ts`) faz RBAC estrito: bloqueia acesso por role, valida JWT com `getToken()` e respeita `PUBLIC_ROUTES`.
- Roles: `STUDENT` (acesso restrito), `TEACHER` (criação/gestão de cursos), `ADMIN` (controle total).

**Validação & Sanitização (Zod)**

- Todos os inputs de API devem ser validados com Zod antes de qualquer lógica ou query.
- Nunca processe ou armazene dados não validados.
- Exemplo obrigatório:

```typescript
const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { error: result.error.errors[0].message },
    { status: 400 }
  );
}
```

**Rate Limiting**

- Implemente rate limiting em endpoints públicos (login, register, reset) usando `/src/lib/rate-limit.ts`.
- Identifique IP com `getClientIP(req)` e limite tentativas (ex: 5/minuto).
- Exemplo:

```typescript
const ip = getClientIP(req);
const rateLimitResult = await checkRateLimit(ip, {
  limit: 5,
  windowSeconds: 60,
});
if (!rateLimitResult.success) {
  return NextResponse.json(
    {
      error: `Muitas tentativas. Tente novamente em ${rateLimitResult.retryAfter}s`,
    },
    { status: 429 }
  );
}
```

**Uploads & Storage Seguro**

- Nunca use filesystem local para uploads (Vercel é ephemeral). Sempre use Supabase Storage via `/src/lib/supabase.ts`.
- Antes de novo upload, delete o arquivo antigo (exemplo em `/api/admin/avatar`).
- Nunca exponha secrets no client (apenas variáveis `NEXT_PUBLIC_` são seguras para client-side).

**Respostas & Logging Seguro**

- Nunca retorne dados sensíveis (senhas, tokens) em responses.
- Sempre use o padrão de resposta:
  - Sucesso: `{ data, message? }`
  - Erro: `{ error }`, status HTTP correto
- Logue erros apenas no server, nunca exponha detalhes sensíveis ao client.

**Senhas & Bcrypt**

- Sempre hash de senha com bcrypt (12 rounds). Nunca armazene plain text.
- Exemplo:

```typescript
const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(inputPassword, user.password);
```

**Checklist SecurityOpsAI**

- [x] Auth obrigatório em rotas protegidas
- [x] Role check antes de operações sensíveis
- [x] Zod em todos os inputs
- [x] Rate limiting em endpoints públicos
- [x] Uploads apenas via Supabase
- [x] Nunca exponha secrets ou dados sensíveis
- [x] Logging seguro (sem leaks)

**ArmadiIhas comuns**

- Não misture cookies de ambientes diferentes (prod/dev)
- Não aceite dados não validados
- Não faça upload local
- Não exponha stacktrace ou detalhes de erro ao client

Consulte `/src/lib/auth.ts`, `/src/lib/rate-limit.ts`, `/src/lib/supabase.ts` e exemplos em `/src/app/api/admin/*` para patterns seguros.

☑️ 7. Padrões de Erro e Response (Obrigatórios)

**API Routes** devem retornar:

```typescript
// Sucesso (200 OK)
{ data: T, message?: string }

// Sucesso criação (201 Created)
{ data: T, message: "Recurso criado com sucesso" }

// Erro
{ error: string }, { status: 4xx | 5xx }
```

**HTTP Status Codes Padrão**:

- `200 OK` - Sucesso em GET/PUT/DELETE
- `201 Created` - Sucesso em POST (criação)
- `400 Bad Request` - Validação falhou, dados inválidos
- `401 Unauthorized` - Não autenticado (sem sessão)
- `403 Forbidden` - Autenticado mas sem permissão (role errado)
- `404 Not Found` - Recurso não existe
- `409 Conflict` - Conflito (ex: email duplicado)
- `500 Internal Server Error` - Erro inesperado do servidor

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

**Pattern Completo de API Route**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema Zod
const updateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Role check
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // 3. Parse body
    const body = await req.json();

    // 4. Validate with Zod
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email } = result.data;

    // 5. Business logic checks
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== params.id) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    // 6. Database operation
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { name, email },
    });

    // 7. Success response
    return NextResponse.json({
      data: user,
      message: 'Usuário atualizado com sucesso',
    });
  } catch (error) {
    console.error('[API /admin/users/[id] PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}
```

**NUNCA aceitar dados não validados** em API routes ou funções críticas.

### ☑️ 7.1. Security & Rate Limiting (Obrigatório em Produção)

**Rate Limiting Pattern** (`src/lib/rate-limit.ts`):

```typescript
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limiting em endpoints públicos (login, register, reset)
  const ip = getClientIP(req);
  const rateLimitResult = await checkRateLimit(ip, {
    limit: 5, // 5 tentativas
    windowSeconds: 60, // por minuto
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: `Muitas tentativas. Tente novamente em ${rateLimitResult.retryAfter}s`,
      },
      { status: 429 }
    );
  }

  // ... resto da lógica
}
```

**Security Checklist para API Routes**:

- ✅ **Autenticação**: Sempre chamar `auth()` em rotas protegidas
- ✅ **Autorização**: Verificar `session.user.role` antes de operações sensíveis
- ✅ **Validação**: Usar Zod para validar TODOS os inputs
- ✅ **Sanitização**: Zod já previne XSS básico, mas cuidado com HTML raw
- ✅ **SQL Injection**: Prisma protege automaticamente (usar sempre Prisma)
- ✅ **Rate Limiting**: Aplicar em endpoints públicos (login, register, reset)
- ✅ **CORS**: Configurado no Next.js, verificar em `next.config.ts`
- ✅ **Secrets**: NUNCA expor secrets no client-side (prefixo `NEXT_PUBLIC_`)
- ✅ **Logs**: Não logar senhas, tokens ou dados sensíveis

**Password Security (bcrypt pattern)**:

```typescript
import bcrypt from 'bcryptjs';

// Hash password (12 rounds = boa segurança + performance)
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(inputPassword, user.password);

// NUNCA armazene senhas em plain text
// NUNCA envie senhas em responses
```

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

**Performance Best Practices**:

```typescript
// ✅ BOM: Parallel queries
const [totalUsers, totalCourses] = await Promise.all([
  prisma.user.count(),
  prisma.course.count(),
]);

// ❌ RUIM: Sequential queries
const totalUsers = await prisma.user.count();
const totalCourses = await prisma.course.count();

// ✅ BOM: Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// ❌ RUIM: Fetch all fields
const users = await prisma.user.findMany();

// ✅ BOM: Use transactions for multiple writes
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.enrollment.create({ data: enrollmentData }),
]);
```

**Rate Limiting** (`src/lib/rate-limit.ts`):

- In-memory Map store (considerar Redis para produção)
- `checkRateLimit(identifier, { limit, windowSeconds })`
- `getClientIP(request)` - detecta IP através de proxies

**File Storage** (Supabase):

- Buckets: `videos`, `pdfs`, `images`, `materials`
- Helpers: `uploadFile()`, `deleteFile()`, `listFiles()`
- RLS policies obrigatórias (ver SUPABASE_STORAGE_SETUP.md)

**Avatar Upload Pattern (CRÍTICO)**:

```typescript
// NUNCA usar filesystem local (ephemeral no Vercel)
// ❌ ERRADO:
import { writeFile } from 'fs/promises';
await writeFile('/public/uploads/avatars/...', buffer);

// ✅ CORRETO:
import { uploadFile, deleteFile } from '@/lib/supabase';

// 1. Deletar avatar antigo antes de upload
const currentUser = await prisma.user.findUnique({
  where: { id },
  select: { avatar: true },
});

if (currentUser?.avatar) {
  const oldPath = currentUser.avatar.split('/images/').pop();
  if (oldPath?.startsWith('avatars/')) {
    await deleteFile('images', oldPath);
  }
}

// 2. Upload novo avatar
const fileName = `avatars/${userId}-${Date.now()}.${extension}`;
const { url, error } = await uploadFile(file, 'images', fileName);

// 3. Atualizar banco
await prisma.user.update({
  where: { id },
  data: { avatar: url },
});
```

**Rotas implementadas**: `/api/admin/avatar`, `/api/teacher/avatar`, `/api/student/avatar`

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
9. **Avatar Upload Local**: NUNCA use filesystem local (`fs.writeFile`), SEMPRE use Supabase Storage
10. **Prisma Schema Field Names**: Veja seção abaixo para campos corretos
11. **CSP Errors**: Middleware (`middleware.ts`) já inclui `unsafe-eval` para Next.js HMR

### 🔒 Content Security Policy (CSP)

**Configuração Atual** (`middleware.ts`):

O middleware aplica headers de segurança em todas as rotas, incluindo CSP que permite:

```typescript
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com;
```

**Por que `unsafe-eval`?**

- ✅ **Necessário** para Next.js HMR (Hot Module Replacement) em desenvolvimento
- ✅ **Necessário** para algumas bibliotecas React que usam `new Function()`
- ✅ **Aceitável** em produção com outras camadas de segurança ativas

**Outros Headers de Segurança**:

- `X-Frame-Options: DENY` - Previne clickjacking
- `X-Content-Type-Options: nosniff` - Previne MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - Force HTTPS
- `Referrer-Policy` - Controla informações de referrer

**IMPORTANTE**:

- ❌ NÃO remover `unsafe-eval` - Next.js precisa
- ✅ CSP é aplicado via middleware, não via meta tags
- ✅ Vercel aplica automaticamente security headers extras

### ⚠️ Prisma Schema Field Names (CRÍTICO)

Erros comuns de TypeScript build causados por campos incorretos:

```typescript
// ❌ ERRADO (causa erro de build):
const course = await prisma.course.findMany({
  where: { published: true }, // Não existe
  include: { teacher: true }, // Não existe
  select: { category: true }, // Não existe
});

// ✅ CORRETO (schema real):
const course = await prisma.course.findMany({
  where: { isPublished: true }, // Boolean field
  include: { instructor: true }, // Relation to User
  select: { categoryId: true }, // String foreign key
});
```

**Course Model - Campos Corretos**:

- `instructor` → Relação com User (NOT `teacher`)
- `instructorId` → String foreign key
- `isPublished` → Boolean (NOT `published`)
- `publishedAt` → DateTime opcional
- `categoryId` → String foreign key (NOT `category`)

**User Model - Campos Corretos**:

- `avatar` → String opcional (URL do Supabase)
- `role` → Enum (STUDENT, TEACHER, ADMIN)
- `createdAt` → DateTime

**Enrollment Model - Campos Corretos**:

- `enrolledAt` → DateTime (NOT `createdAt` para enrollments)
- `student` → Relação com User
- `course` → Relação com Course

**Payment Model - Campos Corretos**:

- `status` → Enum com valor `COMPLETED` (use para aggregate revenue)
- `amount` → Float

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

### 📋 Checklist Pré-Commit (OBRIGATÓRIO)

Antes de fazer commit, SEMPRE verificar:

```bash
# 1. TypeScript compilation
npm run build

# 2. Linting
npm run lint

# 3. Verificar campos Prisma
# - instructor (NOT teacher)
# - isPublished (NOT published)
# - categoryId (NOT category)
# - enrolledAt (para Enrollment)

# 4. Verificar imports de storage
# - Usar @/lib/supabase (NOT fs/promises)
# - uploadFile() + deleteFile() pattern

# 5. Verificar auth em API routes
# - const session = await auth()
# - Role check: session.user.role === 'ADMIN'

# 6. Verificar Zod validation
# - safeParse() antes de processar dados
# - Retornar erro 400 se validação falhar
```

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
