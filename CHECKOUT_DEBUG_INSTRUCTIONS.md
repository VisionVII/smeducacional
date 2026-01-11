# 🐛 Checkout Debug - Instruções Completas

## ❌ Erro Relatado

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Erro no checkout: Error: Erro ao processar checkout
at handleCheckout (multi-course-checkout.tsx:79:15)
```

## 📊 Estratégia de Debug Implementada

Adicionei múltiplas camadas de logging em **4 locais** para identificar exatamente onde a falha ocorre:

### **CAMADA 1: Frontend** (`multi-course-checkout.tsx`)

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

### **CAMADA 2: API Route - Single Course** (`/api/checkout/course`)

```typescript
console.log('[Checkout/Course] Iniciando checkout:', { userId, courseId });
try {
  validation = await canPurchaseCourse(...);
} catch (validationError) {
  console.error('[Checkout/Course] Erro na validação:', validationError);
}
try {
  checkoutSession = await createCourseCheckoutSession(...);
} catch (stripeError) {
  console.error('[Checkout/Course] Erro ao criar sessão Stripe:', stripeError);
}
```

### **CAMADA 3: API Route - Session Provider** (`/api/checkout/session`)

```typescript
console.log('[Checkout/Session] Iniciando checkout:', { userId, courseId, provider });
try {
  validation = await canPurchaseCourse(...);
} catch (validationError) {
  console.error('[Checkout/Session] Erro na validação:', validationError);
}
try {
  sessionData = await paymentProvider.createSession(...);
} catch (paymentError) {
  console.error('[Checkout/Session] Erro ao criar sessão de pagamento:', paymentError);
}
// Catch final
console.error('[Checkout/Session] ⚠️ ERRO NÃO TRATADO:', { message, stack, type });
```

### **CAMADA 4: API Route - Multiple Courses** (`/api/checkout/multiple`) ✨ NOVO

```typescript
console.log('[Checkout/Multiple] Iniciando checkout:', { userId, courseIdsCount });
console.log('[Checkout/Multiple] Validando permissões de compra...');
// Valida CADA curso com canPurchaseCourse()
try {
  stripeSession = await stripe.checkout.sessions.create(...);
} catch (stripeError) {
  console.error('[Checkout/Multiple] Erro ao criar sessão Stripe:', stripeError);
}
// Catch final
console.error('[Checkout/Multiple] ⚠️ ERRO NÃO TRATADO:', { message, stack, type });
```

---

## 🔍 Como Debugar

### **PASSO 1: Abra o Console do Navegador**

```
Pressione F12 → Aba "Console"
```

### **PASSO 2: Abra o Terminal do Servidor**

```
Onde você rodou: npm run dev
(ou yarn dev)
```

### **PASSO 3: Tente Fazer o Checkout**

1. Acesse a página do carrinho de compras (múltiplos cursos)
2. Clique em "Finalizar Compra"
3. **Aguarde o erro aparecer**

### **PASSO 4: Verifique os Logs em Ordem**

**No Console do Navegador (F12):**

```
✅ [CheckoutButton] Iniciando checkout para curso: course-id
✅ [CheckoutButton] Resposta recebida: { status: 500, statusText: "Internal Server Error" }
❌ [CheckoutButton] Erro completo: { message: "...", error: {...}, stack: "..." }
```

**No Terminal do Servidor:**

```
✅ [Checkout/Course] Iniciando checkout: { userId: "...", courseId: "..." }
✅ [Checkout/Course] Dados para Stripe: { courseId, title, price, email }
❌ [Checkout/Course] Erro na validação: Error: ...
  OU
❌ [Checkout/Course] Erro ao criar sessão Stripe: Error: ...
  OU
❌ [Checkout/Course] ⚠️ ERRO NÃO TRATADO: { message: "...", stack: "..." }
```

---

## 🎯 Interpretando os Logs

### **Cenário 1: Erro na Validação**

```
[Checkout/Course] Erro na validação: Error: ...
→ Problema no CourseAccessService (validateCourseAvailability, canPurchaseCourse, etc)
→ Verificar regras de negócio
```

### **Cenário 2: Erro ao Criar Sessão Stripe**

```
[Checkout/Course] Erro ao criar sessão Stripe: Error: ...
→ Problema com credenciais do Stripe (STRIPE_SECRET_KEY)
→ Problema com parâmetros enviados ao Stripe
→ Limite de requisições do Stripe (rate limit)
```

### **Cenário 3: Erro Não Tratado (Mais Grave)**

```
[Checkout/Course] ⚠️ ERRO NÃO TRATADO: { message: "...", stack: "..." }
→ Erro em um ponto inesperado
→ Stack trace mostrará exatamente onde falhou
```

### **Cenário 4: Erro no Parse JSON (Cliente)**

```
[CheckoutButton] Erro ao fazer parse da resposta JSON: ...
[CheckoutButton] Texto da resposta: <html>...
→ A API está retornando HTML em vez de JSON
→ Possível erro 500 do servidor que não está sendo retornado como JSON
```

---

## 📋 Checklist de Validação

Antes de testar, certifique-se de:

- [ ] Servidor está rodando (`npm run dev`)
- [ ] Você está logado como um aluno (NÃO professor)
- [ ] O curso é PAGO (`price > 0`)
- [ ] O curso está PUBLICADO (`isPublished = true`)
- [ ] Você NÃO está matriculado no curso
- [ ] `STRIPE_SECRET_KEY` está configurada no `.env`
- [ ] `STRIPE_PUBLISHABLE_KEY` está configurada no `.env`
- [ ] `NEXT_PUBLIC_URL` está configurada no `.env` (http://localhost:3000)

---

## 🛠️ Próximos Passos

1. **Execute o checkout**
2. **Copie TODOS os logs** (Console + Terminal)
3. **Identifique qual mensagem específica de erro aparece**
4. **Me envie:**
   - Screenshot do Console (F12)
   - Logs completos do terminal
   - Mensagem exata de erro
   - Qual rota está sendo chamada (`/api/checkout/course` ou `/api/checkout/session`)

---

## 🚀 Informações de Resposta API

Ambas as APIs agora retornam:

```typescript
// Sucesso (status: 200)
{
  sessionId: "cs_...",
  url: "https://checkout.stripe.com/..."
}

// Erro (status: 500)
{
  error: "Mensagem específica de erro",
  debug: { // Apenas em development
    message: "...",
    stack: "..."
  }
}
```

---

## 📞 Informações Técnicas

- **Next.js**: 16.1.0 (Turbopack)
- **Node.js**: Recomendado v18+
- **Stripe**: Usando `stripe` npm package
- **Validação**: Zod schema em ambas as APIs
- **Auth**: NextAuth session middleware
