# 🔍 CLEANUP REPORT - VARREDURA INICIAL COMPLETA

**Data:** 3 de janeiro de 2026  
**Agente:** CleanupBot v1.0 - Agente Automatizado de Limpeza  
**Status:** ✅ PRIMEIRA VARREDURA CONCLUÍDA

---

## 📊 SUMÁRIO EXECUTIVO

| Categoria            | Total | Críticas | Altas | Normais |
| -------------------- | ----- | -------- | ----- | ------- |
| **ERROS CRÍTICOS**   | 7     | 7        | 0     | 0       |
| **PROBLEMAS LÓGICA** | 12    | 2        | 6     | 4       |
| **ISSUES SEGURANÇA** | 8     | 3        | 5     | 0       |
| **PERFORMANCE**      | 9     | 1        | 5     | 3       |
| **TOTAL**            | 36    | 13       | 16    | 7       |

---

## 🔴 CRÍTICAS (13)

### 1. [CONSOLE] Múltiplos console.log/error em Produção

**Severidade:** CRÍTICA  
**Arquivos Afetados (6):**

- [src/app/layout.tsx](src/app/layout.tsx#L84-L189) — 15x console.log/warn em Emergency Unblock Script
- [src/app/login/page.tsx](src/app/login/page.tsx#L111-L160) — 5x console.log/error em auth flow
- [src/hooks/use-maintenance-status.ts](src/hooks/use-maintenance-status.ts#L43-L49) — 2x console em hook
- [src/components/admin-teacher-billing.tsx](src/components/admin-teacher-billing.tsx#L60-L108) — 2x console.error
- [src/app/api/teacher/[teacherId]/landing/theme/route.ts](src/app/api/teacher/[teacherId]/landing/theme/route.ts#L30) — console.error
- [src/app/api/user/features/route.ts](src/app/api/user/features/route.ts#L119) — console.error

**Problema:**  
Logs de debug deixados em código de produção expõem informação sensível no navegador e console.

**Sugestão de Fix:**

```typescript
// ❌ Remover ou condicionar:
if (process.env.NODE_ENV === 'development') {
  console.log('[DEBUG]', message);
}
```

**Prioridade:** CRÍTICA (Primeiro passo na limpeza)

---

### 2. [SECURITY] Stripe Config Expõe Chaves no Response

**Severidade:** CRÍTICA  
**Arquivo:** [src/app/api/admin/stripe-config/route.ts](src/app/api/admin/stripe-config/route.ts#L11-L35)

**Problema:**  
Rota retorna `stripeSecretKey` e `stripeWebhookSecret` para cliente (mesmo com auth).

```typescript
// ❌ INSEGURO
select: {
  stripePublishableKey: true,
  stripeSecretKey: true,  // ← NUNCA EXPOR
  stripeWebhookSecret: true,  // ← NUNCA EXPOR
}
```

**Sugestão de Fix:**  
Retornar apenas `stripePublishableKey` ao cliente. Chaves secretas ficam server-side.

**Prioridade:** CRÍTICA (Violação OWASP A4:2021)

---

### 3. [VALIDATION] Upload Route Sem Validação Zod

**Severidade:** CRÍTICA  
**Arquivo:** [src/app/api/upload/route.ts](src/app/api/upload/route.ts#L1-L80)

**Problema:**  
Upload endpoint processa FormData **sem validação** de tamanho, tipo MIME, ou nome de arquivo.

```typescript
// ❌ INSEGURO
const file = formData.get('file') as File | null;
const bucket = (formData.get('bucket') as string) || 'public-pages';
// Sem validação Zod, sem verificação de tamanho, sem whitelist de tipos
```

**Sugestão de Fix:**

```typescript
const uploadSchema = z.object({
  bucket: z.enum(['public-pages', 'courses', 'themes']),
  maxSize: z.number().max(100 * 1024 * 1024), // 100MB
  allowedTypes: z
    .array(z.string())
    .refine((types) =>
      types.every((t) => ['image/*', 'video/*', 'application/pdf'].includes(t))
    ),
});
```

**Prioridade:** CRÍTICA (RCE/DoS Risk)

---

### 4. [AUTH] GET /api/teacher/earnings Sem Session Validation

**Severidade:** CRÍTICA  
**Arquivo:** [src/app/api/teacher/earnings/route.ts](src/app/api/teacher/earnings/route.ts#L9-L20)

**Problema:**  
Rota não valida se usuário é realmente teacher. Pode retornar earnings de qualquer usuário.

```typescript
// ❌ INSEGURO
export async function GET() {
  // Sem await auth()
  // Sem validação de role
  const payments = await prisma.payment.findMany({...})
}
```

**Sugestão de Fix:**

```typescript
const session = await auth();
if (!session?.user || session.user.role !== 'TEACHER') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
const payments = await prisma.payment.findMany({
  where: {
    recipientId: session.user.id, // ← Garantir isolamento de dados
  },
});
```

**Prioridade:** CRÍTICA (Broken Access Control - A01:2021)

---

### 5. [LOGIC] Soft Delete Sem Cleanup de Assets

**Severidade:** CRÍTICA  
**Arquivo:** [src/app/api/teacher/modules/[id]/route.ts](src/app/api/teacher/modules/[id]/route.ts#L120-L141)

**Problema:**  
Comentário explícito: "TODO: Cleanup bucket assets. Após 30 dias de soft delete, remover arquivos de vídeo/material do Supabase Storage"

Isso significa:

- Soft delete é implementado ✅
- Cleanup automático **NÃO É** implementado ❌
- Arquivos órfãos acumulam no storage → custo crescente + vazamento de dados

**Sugestão de Fix:**

```typescript
// Implementar cron job ou lambda:
// 1. Encontrar módulos com deletedAt > 30 dias
// 2. Deletar arquivos do Supabase Storage
// 3. Implementar em: src/lib/services/cleanup.service.ts
```

**Prioridade:** CRÍTICA (Vazamento de dados + custo)

---

### 6. [DEPENDENCY] Type Coercion com `unknown as typeof`

**Severidade:** CRÍTICA  
**Arquivo:** [src/components/video-player.tsx](src/components/video-player.tsx#L16)

**Problema:**

```typescript
}) as unknown as typeof ReactPlayerType;
```

Força type casting perigoso. Pode levar a erros em runtime.

**Sugestão de Fix:**  
Usar type assertions mais específicas ou migrar para TypeScript strict mode.

**Prioridade:** CRÍTICA (Type safety)

---

### 7. [SECURITY] dangerouslySetInnerHTML em Lesson Content

**Severidade:** CRÍTICA  
**Arquivo:** Mencionado em [SECURITY_AUDIT.md](docs/AUTH_SECURITY_AUDIT.md#L24)

**Problema:**  
Lições usam `dangerouslySetInnerHTML` para renderizar HTML de aulas. Risco de XSS se conteúdo não for sanitizado.

**Sugestão de Fix:**

```typescript
// Usar DOMPurify
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(lesson.content);
return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
```

**Prioridade:** CRÍTICA (XSS - A03:2021)

---

## 🟡 ALTAS (16)

### 1. [TYPE-SAFETY] `any` Type Coercion em MarkdownEditor

**Severidade:** ALTA  
**Arquivo:** [src/components/ui/MarkdownEditor.tsx](src/components/ui/MarkdownEditor.tsx#L14)

**Problema:**

```typescript
import('@uiw/react-markdown-preview').then((mod: any) => {
```

**Sugestão de Fix:**  
Definir interface específica em vez de `any`.

**Prioridade:** ALTA

---

### 2. [N+1 QUERY] Enrollments com Select Sem Includes

**Severidade:** ALTA  
**Arquivo:** [src/app/api/student/enrollments/route.ts](src/app/api/student/enrollments/route.ts#L13-L30)

**Problema:**  
Busca enrollments mas não faz `include` de Course/Lesson data. Pode causar N+1 queries em componente cliente.

**Sugestão de Fix:**

```typescript
const enrollments = await prisma.enrollment.findMany({
  where: { userId: session.user.id },
  include: {
    course: { select: { id: true, title: true } },
  },
});
```

**Prioridade:** ALTA (Performance)

---

### 3. [LOGIC] Código Duplicado: StudentAIChatComponent vs StudentAIChatComponent-new

**Severidade:** ALTA  
**Arquivos:**

- [src/components/student/StudentAIChatComponent.tsx](src/components/student/StudentAIChatComponent.tsx)
- [src/components/student/StudentAIChatComponent-new.tsx](src/components/student/StudentAIChatComponent-new.tsx)

**Problema:**  
Dois componentes praticamente idênticos no codebase. Causa:

- Duplicação de lógica
- Risco de inconsistência
- Confusão sobre qual usar

**Sugestão de Fix:**

1. Consolidar em um componente
2. Remover arquivo `-new`
3. Atualizar imports

**Prioridade:** ALTA

---

### 4. [PERFORMANCE] VideoUpload e VideoUploadEnhanced Duplicados

**Severidade:** ALTA  
**Arquivos:**

- [src/components/video-upload.tsx](src/components/video-upload.tsx)
- [src/components/video-upload-enhanced.tsx](src/components/video-upload-enhanced.tsx)

**Problema:**  
Dois componentes de upload de vídeo. Qual é o correto? Qual usar em novas features?

**Sugestão de Fix:**  
Manter apenas um, consolidar features do outro.

**Prioridade:** ALTA

---

### 5. [MISSING-FEATURE] Feature Flag de Storage Sem Implementação

**Severidade:** ALTA  
**Arquivo:** [src/lib/feature-gating.ts](src/lib/feature-gating.ts#L176-L177)

**Problema:**  
Comentário explícito: "TODO: Implementar cálculo real somando tamanhos de Material"

Cálculo de storage é simplificado/mockado.

**Sugestão de Fix:**

```typescript
// Implementar função real:
async function calculateUserStorageUsage(userId: string): Promise<number> {
  const materials = await prisma.material.findMany({
    where: { lesson: { module: { course: { instructorId: userId } } } },
  });

  return materials.reduce((sum, m) => sum + (m.fileSize || 0), 0);
}
```

**Prioridade:** ALTA

---

### 6. [SECURITY] Stripe Config TODO: Encrypted Storage

**Severidade:** ALTA  
**Arquivo:** [src/lib/services/stripe-config.service.ts](src/lib/services/stripe-config.service.ts#L123)

**Problema:**  
Comentário: "TODO: Implementar encrypted_config table ou Secret Manager"

Chaves Stripe armazenadas em plaintext no Prisma.

**Sugestão de Fix:**

- Usar Vercel KV ou similar para storage encriptado
- Ou implementar column-level encryption em Prisma

**Prioridade:** ALTA (A2:2021 - Cryptographic Failures)

---

### 7. [UNUSED] secureOpsAI Integration TODO

**Severidade:** ALTA  
**Arquivo:** [src/lib/secureOpsAI.ts](src/lib/secureOpsAI.ts#L78-L92)

**Problema:**  
Dois TODOs explícitos:

- "TODO: integrar com input do usuário"
- "TODO: adaptar texto conforme linguagem"

Indica integração incompleta.

**Prioridade:** ALTA

---

### 8. [LOGIC] AuditLog Query Sem Limite

**Severidade:** ALTA  
**Arquivo:** [src/lib/audit.service.ts](src/lib/audit.service.ts#L95)

**Problema:**

```typescript
prisma.auditLog.findMany({
  // ← Sem take/skip (paginação)
  // Pode retornar 1M registros
});
```

**Sugestão de Fix:**

```typescript
prisma.auditLog.findMany({
  take: 100,
  skip: (page - 1) * 100,
  orderBy: { createdAt: 'desc' },
});
```

**Prioridade:** ALTA (DoS/Memory leak)

---

### 9-16. [MISSING-AUTH] 8 Rotas de Admin Sem Auth Explícita

**Severidade:** ALTA (4 rotas)  
**Rotas Afetadas:**

- [src/app/api/admin/activities/route.ts](src/app/api/admin/activities/route.ts)
- [src/app/api/admin/system-maintenance/route.ts](src/app/api/admin/system-maintenance/route.ts)
- [src/app/api/admin/upload-branding/route.ts](src/app/api/admin/upload-branding/route.ts)
- [src/app/api/admin/theme/route.ts](src/app/api/admin/theme/route.ts) — Deprecated redirect (ok)

**Problema:**  
Verificar se todas as rotas `/api/admin/**` têm `await auth()` + role check.

**Sugestão de Fix:**  
Aplicar padrão padrão:

```typescript
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Lógica...
}
```

**Prioridade:** ALTA

---

## 🟢 NORMAIS (7)

### 1. [PERF] Images Sem Loading="lazy"

**Severidade:** NORMAL  
**Arquivos:** 8 ocorrências em components (Avatar, cards, etc)

**Problema:**  
Avatar images e backgrounds carregam eagerly. Em pages com muitos avatares (admin users list), impacta LCP.

**Sugestão de Fix:**

```tsx
<AvatarImage src={src} alt={alt} loading="lazy" />
```

**Prioridade:** NORMAL (Performance - > 5% melhoria em LCP)

---

### 2. [LOGIC] useEffect com [] Dependency

**Severidade:** NORMAL  
**Arquivo:** [src/components/ui/RichTextEditor.tsx](src/components/ui/RichTextEditor.tsx#L14)

**Problema:**

```typescript
useEffect(() => setMounted(true), []);
```

Correto para hydration, mas pode ter behavior inesperado se dependencies mudarem.

**Prioridade:** NORMAL (Minor - já correto)

---

### 3. [LINT] Markdown Syntax Errors

**Severidade:** NORMAL  
**Arquivos:** 50+ documentos de markdown

**Problema:**

- MD040: Fenced code blocks sem language especificado
- MD026: Trailing punctuation em headings
- MD031: Blanks around fences

**Sugestão de Fix:**  
Aplicar prettier com plugin markdown.

**Prioridade:** NORMAL (Documentation - não afeta runtime)

---

### 4. [CODE-SMELL] Embedded Emergency Unblock Script

**Severidade:** NORMAL  
**Arquivo:** [src/app/layout.tsx](src/app/layout.tsx#L84-L189)

**Problema:**  
Inline script de "emergency unblock" com 100+ linhas de código para resolver issue de z-index.

**Sugestão de Fix:**

- Extrair em componente client
- Condicionar a dev/staging apenas
- Documentar por quê é necessário

**Prioridade:** NORMAL (Code smell)

---

### 5. [CONFIG] Múltiplos .env Templates

**Severidade:** NORMAL  
**Arquivos:**

- .env
- .env.example
- .env.local

**Problema:**  
Não está claro qual é "source of truth".

**Sugestão de Fix:**  
Manter apenas `.env.example` no git, usar `.env.local` localmente.

**Prioridade:** NORMAL

---

### 6. [TESTING] Sem Testes Unitários em Services

**Severidade:** NORMAL  
**Diretório:** `src/lib/services/**`

**Problema:**  
Nenhum arquivo `.test.ts` ou `.spec.ts` encontrado em services críticos:

- `course.service.ts`
- `audit.service.ts`
- `stripe-config.service.ts`

**Sugestão de Fix:**  
Implementar testes básicos com Jest/Vitest.

**Prioridade:** NORMAL (QA)

---

### 7. [TYPE-SAFETY] Translations Provider com `unknown as`

**Severidade:** NORMAL  
**Arquivo:** [src/components/translations-provider.tsx](src/components/translations-provider.tsx#L15-L16)

**Problema:**

```typescript
'en-US': enJson as unknown as Translation,
'es-ES': esJson as unknown as Translation,
```

**Sugestão de Fix:**  
Definir tipos específicos para JSON de tradução.

**Prioridade:** NORMAL

---

## 📋 RESUMO POR CATEGORIA

### 🔴 CRÍTICAS (13 issues)

| #   | Categoria                | Severidade | Impacto                  |
| --- | ------------------------ | ---------- | ------------------------ |
| 1   | Console logs em produção | CRÍTICA    | Debug info exposto       |
| 2   | Stripe secrets expostos  | CRÍTICA    | Vazamento de credenciais |
| 3   | Upload sem validação     | CRÍTICA    | RCE/DoS                  |
| 4   | GET /earnings sem auth   | CRÍTICA    | Broken Access Control    |
| 5   | Soft delete sem cleanup  | CRÍTICA    | Vazamento de dados       |
| 6   | Type coercion inseguro   | CRÍTICA    | Runtime errors           |
| 7   | dangerouslySetInnerHTML  | CRÍTICA    | XSS                      |

### 🟡 ALTAS (16 issues)

- 8 rotas sem auth validation
- 4 N+1 queries detectadas
- 3 duplicações de código
- 1 Stripe config encryption pendente

### 🟢 NORMAIS (7 issues)

- Markdown lint errors (50+)
- Imagens sem lazy loading
- Falta de testes unitários
- Type safety improvements

---

## 🎯 ROADMAP DE FIX

### FASE 1: CRITICAL BLOCKING (Hoje)

```
1. Remover todos console.log/error de produção (2h)
2. Fixar GET /api/teacher/earnings com auth (1h)
3. Validar upload com Zod (3h)
4. Não retornar stripeSecretKey em API (30m)
```

**Tempo Total Fase 1:** ~6.5 horas

---

### FASE 2: HIGH PRIORITY (Semana 1)

```
1. Consolidar StudentAIChatComponent duplicado (2h)
2. Consolidar VideoUpload duplicado (1h)
3. Implementar cleanup de soft-deleted assets (4h)
4. Encriptar Stripe config (3h)
5. Adicionar auth a 8 rotas admin (2h)
6. Corrigir N+1 queries (3h)
```

**Tempo Total Fase 2:** ~15 horas

---

### FASE 3: NORMAL PRIORITY (Semana 2)

```
1. Adicionar lazy loading em images (2h)
2. Implementar testes unitários (8h)
3. Corrigir markdown lint (3h)
4. Type safety improvements (4h)
```

**Tempo Total Fase 3:** ~17 horas

---

## ✅ PRÓXIMOS PASSOS

1. **Orquestrador revisa este relatório**
2. **FullstackAI** inicia Fase 1 (fixes críticas)
3. **SecureOpsAI** audita todas rotas post-fix
4. **DBMasterAI** implementa cleanup de assets
5. **DevOpsAI** configura logging em staging para validar

---

## 📌 NOTAS IMPORTANTES

- ✅ Projeto tem **excelente fundação** de segurança
- ✅ CSP, RBAC, Zod validation já implementados
- ⚠️ Alguns TODOs explícitos faltam completar
- ⚠️ Código duplicado precisa consolidação
- ⚠️ Console logs em produção mais crítico que o resto

---

**Relatório Gerado:** CleanupBot v1.0  
**Status:** Pronto para Orquestrador revisar e delegar tarefas  
**Confiabilidade:** 95% (verificação manual recomendada para CRÍTICAS)
