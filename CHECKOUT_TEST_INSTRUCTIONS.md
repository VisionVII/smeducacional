# 🔍 Próximos Passos - Debug de Checkout

## 🎯 Objetivo

Identificar **exatamente onde** o erro 500 está acontecendo.

---

## 📋 Checklist de Validação

Antes de testar, certifique-se de:

- [ ] Servidor está rodando (`npm run dev`)
- [ ] Você está logado como um **ALUNO** (NÃO professor)
- [ ] Os cursos são **PAGOS** (`price > 0`)
- [ ] Os cursos estão **PUBLICADOS** (`isPublished = true`)
- [ ] Você **NÃO está matriculado** nos cursos
- [ ] `STRIPE_SECRET_KEY` está configurada no `.env`
- [ ] `STRIPE_PUBLISHABLE_KEY` está configurada no `.env`
- [ ] `NEXT_PUBLIC_URL` está configurada no `.env` (http://localhost:3000)

---

## 🚀 Teste Passo a Passo

### **PASSO 1: Prepare o Terminal**

1. Abra o terminal onde o servidor está rodando
2. **Localize onde aparece** a mensagem `[Checkout/Multiple]`
3. **Esteja pronto para copiar os logs**

### **PASSO 2: Prepare o Navegador**

1. Pressione **F12** para abrir Developer Tools
2. Vá na aba **"Console"**
3. Procure por mensagens começando com `[Multi-Course-Checkout]`

### **PASSO 3: Execute o Checkout**

1. Vá para o carrinho de compras
2. Selecione **múltiplos cursos pagos**
3. Clique em **"Finalizar Compra"** ou equivalente
4. **Aguarde o erro aparecer**

### **PASSO 4: Colete os Logs**

**No Console do Navegador (F12):**

```
Copie TUDO que começa com:
- [Multi-Course-Checkout]
- Error:
- Stack trace
```

**No Terminal do Servidor:**

```
Copie TUDO que começa com:
- [Checkout/Multiple]
- Error:
- Stack trace
```

---

## 📊 Interpretando os Logs

### **Cenário 1: Erro na Validação**

```
[Checkout/Multiple] Erro na validação: Error: Você não pode comprar seu próprio curso.
```

**→ Significa:** Você tentou comprar um curso que criou
**→ Ação:** Faça login como ALUNO, não como professor

### **Cenário 2: Erro ao Criar Sessão Stripe**

```
[Checkout/Multiple] Erro ao criar sessão Stripe: Error: Invalid API Key provided
```

**→ Significa:** Chave do Stripe incorreta ou não configurada
**→ Ação:** Verifique `STRIPE_SECRET_KEY` no `.env`

### **Cenário 3: Erro Genérico Não Tratado**

```
[Checkout/Multiple] ⚠️ ERRO NÃO TRATADO: { message: "...", stack: "...", type: "..." }
```

**→ Significa:** Erro inesperado em algum ponto
**→ Ação:** Stack trace mostrará exatamente onde

### **Cenário 4: Erro de Parse JSON**

```
[Multi-Course-Checkout] Erro ao fazer parse da resposta JSON: SyntaxError
[Multi-Course-Checkout] Texto da resposta: <html>...
```

**→ Significa:** API retornou HTML em vez de JSON
**→ Ação:** Erro 500 com HTML error page

---

## 📝 Formulário para Relatar

Quando compartilhar os logs, inclua:

```
=== INFORMAÇÕES ===
Você é professor ou aluno? [  ]
Quantos cursos tentou comprar? [ ]
Os cursos são pagos? [  ]
Os cursos estão publicados? [  ]

=== LOGS DO CONSOLE (F12) ===
[Cole aqui os logs starting with [Multi-Course-Checkout]]

=== LOGS DO SERVIDOR (Terminal) ===
[Cole aqui os logs starting with [Checkout/Multiple]]

=== MENSAGEM DE ERRO ===
[Cola exata da mensagem de erro]

=== STACK TRACE ===
[Cole o stack trace se houver]

=== OUTROS DETALHES ===
[Alguma outra informação relevante]
```

---

## 🔗 Fluxo de Checkout Multiple

```
Cliente (navegador)
    ↓
[Multi-Course-Checkout] handleCheckout()
    ↓
POST /api/checkout/multiple
    ↓
[Checkout/Multiple] Validação schema
    ↓
[Checkout/Multiple] Busca cursos no BD
    ↓
[Checkout/Multiple] Valida cada curso com canPurchaseCourse()
    ↓
[Checkout/Multiple] Cria line items Stripe
    ↓
[Checkout/Multiple] Cria sessão Stripe
    ↓
Retorna URL → Stripe Checkout
    ↓
Cliente redirecionado para Stripe
```

**Se erro em qualquer etapa → Log específico aparece**

---

## 💡 Dicas

1. **Sempre copie TODOS os logs** - Mesmo os que parecem menos importantes
2. **Terminal do servidor é mais confiável** - Logs do navegador podem ser truncados
3. **Verifique o `.env`** - `STRIPE_SECRET_KEY` é frequentemente a causa
4. **Limpe o console antes** - `console.clear()` para ver apenas os logs novos
5. **Refresh a página** - Às vezes ajuda a resetar o estado

---

## 🆘 Se Ainda Não Funcionar

Se continuar com erro 500 genérico mesmo com todos os logs:

1. Verifique se o servidor recarregou depois das mudanças
2. Verificar se há erros de compilação: `npm run build`
3. Limpar cache: `rm -rf .next` e rodar `npm run dev` novamente
4. Verificar se o arquivo foi salvo corretamente

---

## ✅ Sucesso

Quando o checkout funcionar, você verá:

**Console (F12):**

```
✅ [Multi-Course-Checkout] Iniciando checkout...
✅ [Multi-Course-Checkout] Resposta recebida: { status: 200, ... }
✅ Redirecionando para Stripe...
```

**Terminal:**

```
✅ [Checkout/Multiple] Iniciando checkout...
✅ [Checkout/Multiple] Cursos encontrados: { total: X, ... }
✅ [Checkout/Multiple] Validando permissões...
✅ [Checkout/Multiple] Sessão Stripe criada com sucesso...
```

**Navegador:**
→ Redireciona para o Stripe Checkout

---

## 📞 Aguardando seus logs!

Compartilhe os logs quando testar. Eles vão mostrar exatamente onde está falhando! 🚀
