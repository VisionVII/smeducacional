# ✅ Checkout Multiple - Melhorias Implementadas

## 🎯 Problema Identificado

O usuário estava usando `/api/checkout/multiple` para checkout com múltiplos cursos, mas o endpoint **não tinha validação de segurança** e **não tinha logs detalhados** para debug.

**Erro:** `Error 500 - Erro ao processar checkout` (muito genérico)

---

## 🔧 Solução Implementada

### **1. Adicionado `canPurchaseCourse` Validation** ✅

O endpoint `/api/checkout/multiple` agora valida **CADA curso** antes de permitir o checkout:

```typescript
// 🛡️ VALIDAÇÃO ENTERPRISE: Verificar cada curso
for (const course of courses) {
  try {
    const canPurchase = await canPurchaseCourse(session.user.id, course.id);

    if (!canPurchase.allowed) {
      validationErrors.push({
        courseId: course.id,
        reason: canPurchase.reason,
      });
    }
  } catch (validationError) {
    // Log de erro
  }
}

if (validationErrors.length > 0) {
  return NextResponse.json(
    {
      error: 'Alguns cursos não estão disponíveis para compra',
      details: validationErrors,
    },
    { status: 403 }
  );
}
```

**RED LINES Protegidas:**

- ❌ Instrutor não pode comprar próprio curso
- ❌ Aluno já matriculado não pode comprar novamente
- ❌ Curso não publicado não pode ser comprado
- ❌ Curso arquivado não pode ser comprado
- ❌ Curso deve ter preço válido

---

### **2. Adicionado Sistema de Logs Completo** ✅

**Camada 1 - Frontend** (`multi-course-checkout.tsx`):

```typescript
console.log('[Multi-Course-Checkout] Iniciando checkout para cursos:', {
  courseIds,
  count,
});
console.log('[Multi-Course-Checkout] Resposta recebida:', {
  status,
  statusText,
});
console.error('[Multi-Course-Checkout] Erro completo:', {
  message,
  error,
  stack,
});
```

**Camada 2 - API Route** (`/api/checkout/multiple`):

```typescript
console.log('[Checkout/Multiple] Iniciando checkout:', {
  userId,
  courseIdsCount,
});
console.log('[Checkout/Multiple] Validando permissões de compra...');
console.log('[Checkout/Multiple] Cursos encontrados:', { total, courseIds });
console.log('[Checkout/Multiple] Cursos disponíveis para compra:', {
  total,
  alreadyEnrolled,
});
console.log('[Checkout/Multiple] Line items criados:', { count, total });
console.log('[Checkout/Multiple] Sessão Stripe criada com sucesso:', {
  sessionId,
  hasUrl,
});
console.error('[Checkout/Multiple] ⚠️ ERRO NÃO TRATADO:', {
  message,
  stack,
  type,
});
```

---

### **3. Corrigido Variável de Ambiente** ✅

**ANTES:**

```typescript
success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?...`;
cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`;
```

**DEPOIS:**

```typescript
const baseUrl =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000');

const successUrl = new URL('/checkout/success', baseUrl);
const cancelUrl = new URL('/cart', baseUrl);
```

---

### **4. Melhorado Tratamento de Erro** ✅

**ANTES:**

```typescript
} catch (error) {
  console.error('❌ [CHECKOUT/MULTIPLE] Erro:', error);
  return NextResponse.json({ error: 'Erro ao processar checkout' }, { status: 500 });
}
```

**DEPOIS:**

```typescript
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : 'N/A';

  console.error('[Checkout/Multiple] ⚠️ ERRO NÃO TRATADO:', {
    message: errorMessage,
    stack: errorStack,
    type: error instanceof Error ? error.constructor.name : typeof error,
    error,
  });

  return NextResponse.json(
    {
      error: errorMessage || 'Erro ao processar checkout',
      debug: process.env.NODE_ENV === 'development'
        ? { message: errorMessage, stack: errorStack }
        : undefined,
    },
    { status: 500 }
  );
}
```

---

### **5. Adicionado Try-Catch Específico para Stripe** ✅

```typescript
let stripeSession;
try {
  stripeSession = await stripe.checkout.sessions.create({
    // ...
  });

  console.log('[Checkout/Multiple] Sessão Stripe criada com sucesso:', {
    sessionId: stripeSession.id,
    hasUrl: !!stripeSession.url,
  });
} catch (stripeError) {
  console.error('[Checkout/Multiple] Erro ao criar sessão Stripe:', {
    error: stripeError,
    message: stripeError instanceof Error ? stripeError.message : 'Unknown',
  });
  return NextResponse.json(
    {
      error:
        stripeError instanceof Error
          ? stripeError.message
          : 'Erro ao criar sessão de pagamento',
    },
    { status: 500 }
  );
}
```

---

## 📋 Arquivos Modificados

1. **[src/app/api/checkout/multiple/route.ts](src/app/api/checkout/multiple/route.ts)**

   - ✅ Adicionado logs detalhados em 7+ pontos
   - ✅ Adicionado validação com `canPurchaseCourse()` para cada curso
   - ✅ Corrigido variável de ambiente (`NEXT_PUBLIC_URL`)
   - ✅ Adicionado try-catch específico para Stripe
   - ✅ Melhorado tratamento de erro final

2. **[src/components/checkout/multi-course-checkout.tsx](src/components/checkout/multi-course-checkout.tsx)**

   - ✅ Adicionado logs detalhados do lado do cliente
   - ✅ Melhorado tratamento de erro de parse JSON
   - ✅ Logs com courseIds, status, messages completas

3. **[CHECKOUT_DEBUG_INSTRUCTIONS.md](CHECKOUT_DEBUG_INSTRUCTIONS.md)**
   - ✅ Atualizado para incluir `/api/checkout/multiple`
   - ✅ Adicionadas instruções para múltiplos cursos

---

## 🚀 Como Testar

### **1. Abra o Console do Navegador**

```
F12 → Aba "Console"
```

### **2. Tente o Checkout**

1. Vá para a página de carrinho de compras
2. Selecione múltiplos cursos
3. Clique em "Finalizar Compra"
4. **Observe os logs aparecendo**

### **3. Verifique os Logs**

**No Console (F12):**

```
✅ [Multi-Course-Checkout] Iniciando checkout para cursos: { courseIds: [...], count: 3 }
✅ [Multi-Course-Checkout] Resposta recebida: { status: 200, statusText: "OK" }
✅ Redirecionamento para Stripe...
```

**No Terminal do Servidor:**

```
✅ [Checkout/Multiple] Iniciando checkout: { userId: "...", courseIdsCount: 3 }
✅ [Checkout/Multiple] Cursos encontrados: { total: 3, courseIds: [...] }
✅ [Checkout/Multiple] Validando permissões de compra...
✅ [Checkout/Multiple] Cursos disponíveis para compra: { total: 3, alreadyEnrolled: 0 }
✅ [Checkout/Multiple] Sessão Stripe criada com sucesso: { sessionId: "cs_...", hasUrl: true }
```

---

## 🛡️ Segurança Garantida

**Defense in Depth (3 Camadas):**

1. **Camada 1 - API Route:** Validação com `canPurchaseCourse()` para cada curso
2. **Camada 2 - Webhook:** Validação no webhook do Stripe (already implemented in payment.service.ts)
3. **Camada 3 - Database:** Constraints e triggers no banco de dados

---

## 🎯 O Que Muda

### **ANTES:**

- ❌ Nenhuma validação de segurança
- ❌ Erro 500 genérico
- ❌ Impossível debugar

### **DEPOIS:**

- ✅ Validação enterprise em cada curso
- ✅ Mensagens de erro específicas
- ✅ Logs detalhados para debug
- ✅ Proteção contra professor comprar próprio curso
- ✅ Proteção contra aluno comprar curso já matriculado

---

## 📞 Status

**Status:** ✅ **COMPLETO**

- ✅ Validação adicionada
- ✅ Logs implementados
- ✅ Erro específico retornado
- ✅ Nenhum erro de compilação
- ✅ Documentação atualizada

**Próximo Passo:** Testar o checkout novamente e compartilhar os logs!
