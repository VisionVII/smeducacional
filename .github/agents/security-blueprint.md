# 🛡️ Security Blueprint - Proteção de Compras

## 🎯 Problema Identificado

Um professor conseguiu comprar o próprio curso no ambiente de teste, expondo falha crítica de validação.

## 📋 Regras de Negócio (Padrão Enterprise - Udemy, Coursera, Hotmart)

### ❌ Validações Obrigatórias (Red Lines)

1. **Instrutor não pode comprar próprio curso**

   - Status: ❌ NÃO IMPLEMENTADO
   - Local: `/api/checkout/course/route.ts`
   - Ação: Bloquear checkout

2. **Aluno já matriculado não pode comprar novamente**

   - Status: ✅ IMPLEMENTADO (linha 53-60)
   - Local: `/api/checkout/course/route.ts`

3. **Curso não publicado não pode ser comprado**

   - Status: ❌ NÃO IMPLEMENTADO
   - Local: `/api/checkout/course/route.ts`
   - Ação: Validar `isPublished: true`

4. **Curso arquivado não pode ser comprado**

   - Status: ❌ NÃO IMPLEMENTADO
   - Local: `/api/checkout/course/route.ts`
   - Ação: Validar `deletedAt: null`

5. **Carrinho deve validar disponibilidade antes de checkout**
   - Status: ⚠️ PARCIAL (validação básica existe)
   - Local: Frontend (CartContext)
   - Ação: Validar no servidor antes de criar sessão

### ✅ Separação Teste vs Produção

6. **Ambiente de teste deve ser isolado**
   - Status: ✅ IMPLEMENTADO
   - Local: Stripe webhook detecta `livemode: false`
   - Observação: Webhook já separa transações de teste

## 🏗️ Plano de Implementação (Service Pattern)

### Fase 1: Criar CourseAccessService

Arquivo: `src/lib/services/course-access.service.ts`

Responsabilidades:

- `canPurchaseCourse(userId, courseId)` → Valida TODAS as regras
- `validateCourseAvailability(courseId)` → Valida estado do curso
- `isInstructor(userId, courseId)` → Verifica ownership

### Fase 2: Atualizar API Routes

Arquivo: `src/app/api/checkout/course/route.ts`

Mudanças:

```typescript
// ANTES (linha ~15-60)
const course = await prisma.course.findUnique(...);
if (enrollment) return error;

// DEPOIS
const validation = await CourseAccessService.canPurchaseCourse(userId, courseId);
if (!validation.allowed) {
  return NextResponse.json({ error: validation.reason }, { status: 403 });
}
```

### Fase 3: Atualizar Webhook

Arquivo: `src/lib/payment.service.ts` (linha ~580)

Adicionar validação:

```typescript
// No processamento do webhook
const isOwner = course.instructorId === userId;
if (isOwner) {
  console.warn('[Webhook] Tentativa de compra do próprio curso bloqueada');
  return; // Não criar enrollment
}
```

### Fase 4: Validar no Frontend (UX)

Arquivo: `src/components/add-to-cart-button.tsx`

Adicionar verificação:

```typescript
// Desabilitar botão se for o instrutor
const isInstructor = session?.user?.id === course.instructorId;
```

## 🎬 Mensagens de Erro Padronizadas

```typescript
export const PURCHASE_ERROR_MESSAGES = {
  OWN_COURSE: 'Você não pode comprar seu próprio curso.',
  ALREADY_ENROLLED: 'Você já está matriculado neste curso.',
  COURSE_UNAVAILABLE: 'Este curso não está disponível para compra.',
  COURSE_NOT_PUBLISHED: 'Este curso ainda não foi publicado.',
  COURSE_ARCHIVED: 'Este curso foi arquivado e não está mais disponível.',
  COURSE_FREE: 'Este curso é gratuito.',
  INVALID_PRICE: 'Preço do curso inválido.',
};
```

## 📊 Matriz de Validação

| Validação               | Frontend      | API Route | Service  | Webhook    |
| ----------------------- | ------------- | --------- | -------- | ---------- |
| Instrutor próprio curso | ✅ (UX)       | ✅ OBRIG  | ✅ OBRIG | ✅ OBRIG   |
| Já matriculado          | ⚠️ (opcional) | ✅ OBRIG  | ✅ OBRIG | ⚠️ (check) |
| Curso publicado         | ❌ (não)      | ✅ OBRIG  | ✅ OBRIG | ⚠️ (check) |
| Curso não arquivado     | ❌ (não)      | ✅ OBRIG  | ✅ OBRIG | ⚠️ (check) |
| Preço válido            | ❌ (não)      | ✅ OBRIG  | ✅ OBRIG | ❌ (não)   |

**Legenda:**

- ✅ OBRIG = Validação obrigatória (bloqueia ação)
- ⚠️ (check) = Verificação adicional (log de segurança)
- ❌ (não) = Não necessário nesta camada

## 🔐 Auditoria

Todas as tentativas bloqueadas devem gerar log de auditoria:

```typescript
await AuditService.logAuditTrail({
  userId,
  action: 'PURCHASE_BLOCKED',
  entity: 'COURSE',
  entityId: courseId,
  details: { reason: 'OWN_COURSE' },
  ipAddress: req.headers.get('x-forwarded-for'),
});
```

## ✅ Checklist de Implementação

- [ ] Criar CourseAccessService com todas as validações
- [ ] Atualizar `/api/checkout/course/route.ts`
- [ ] Atualizar `/api/checkout/session/route.ts` (multi-curso)
- [ ] Adicionar validação no webhook
- [ ] Atualizar AddToCartButton (UI)
- [ ] Adicionar logs de auditoria
- [ ] Criar testes unitários
- [ ] Documentar no ADMIN_SECURITY_GUIDE.md

---

**Orquestrador:** Este blueprint segue as diretrizes VisionVII 3.0 Enterprise Governance.
**Padrão:** Service Pattern com validação em camadas.
**Segurança:** Defense in depth (múltiplas camadas de proteção).
