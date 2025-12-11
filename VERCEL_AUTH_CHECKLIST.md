# ✅ Checklist: Corrigir Login em Produção (Vercel)

## 🔴 Problema

Login funciona **localmente** mas **não funciona em https://smeducacional.vercel.app**

## 🎯 Causa Raiz

Variáveis de ambiente incorretas ou ausentes na Vercel

---

## 📋 Passos para Corrigir (Execute na Ordem)

### **1️⃣ Acessar Configurações da Vercel**

1. Vá para: https://vercel.com/visionvii/smeducacional
2. Clique em **"Settings"** → **"Environment Variables"**

### **2️⃣ Verificar/Configurar Variáveis Críticas**

#### ✅ **NEXTAUTH_SECRET** (CRÍTICO!)

```bash
# Valor atual (local):
+fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM=

# DEVE SER IGUAL em Production, Preview e Development
```

**Ação:**

- [ ] Verificar se existe na Vercel
- [ ] Confirmar que o valor é **exatamente** o mesmo do `.env.local`
- [ ] Aplicar para: **Production**, **Preview**, **Development**

#### ✅ **NEXTAUTH_URL** (CRÍTICO!)

```bash
# Production:
https://smeducacional.vercel.app

# Preview (opcional - Vercel preenche automaticamente):
$VERCEL_URL
```

**Ação:**

- [ ] Adicionar `NEXTAUTH_URL` = `https://smeducacional.vercel.app`
- [ ] Aplicar para: **Production** apenas
- [ ] Para **Preview**, usar: `$VERCEL_URL` ou deixar vazio

#### ✅ **DATABASE_URL** e **DIRECT_URL**

```bash
# Devem apontar para o mesmo banco Supabase
```

**Ação:**

- [ ] Confirmar que ambas estão corretas
- [ ] Testar conexão se possível

---

### **3️⃣ Após Configurar as Variáveis**

1. **Triggerar Redeploy:**

   - Vá em **"Deployments"**
   - Clique nos **"..."** do último deploy
   - Clique em **"Redeploy"**
   - **NÃO use cache** (unchecked "Use existing Build Cache")

2. **Aguardar Deploy Finalizar** (~2-3 minutos)

3. **Limpar Cookies do Navegador:**

   ```
   Chrome: F12 → Application → Cookies → https://smeducacional.vercel.app
   Delete All
   ```

4. **Testar Login:**
   - Acesse: https://smeducacional.vercel.app/login
   - Email: `aluno@smeducacional.com`
   - Senha: `123456`

---

## 🐛 Se Ainda Não Funcionar

### **Verificar Logs em Tempo Real:**

1. Na Vercel, vá em **"Deployments"** → **Clique no deploy ativo**
2. Clique em **"Functions"** → **Veja os logs**
3. Procure por:
   - `[auth][authorize]` → Deve mostrar login bem-sucedido
   - `[auth][jwt]` → Deve mostrar role sendo salvo
   - Erros relacionados a cookies ou NEXTAUTH_SECRET

### **Verificar Console do Navegador:**

1. Abra DevTools (F12)
2. Console → Procure por erros
3. Network → Filtrar por `/api/auth/` → Ver responses

### **Problema Comum: Cookie Secure Flag**

NextAuth automaticamente usa cookies seguros (`__Secure-`) em HTTPS.

**Verificar no middleware:**

```typescript
cookieName: process.env.NODE_ENV === 'production'
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';
```

✅ **Código já correto em `src/middleware.ts`**

---

## 📝 Variáveis de Ambiente Completas (Copiar/Colar)

```bash
# NextAuth
NEXTAUTH_URL=https://smeducacional.vercel.app
NEXTAUTH_SECRET=+fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM=

# Database (Supabase)
DATABASE_URL=[SUA_CONNECTION_STRING_AQUI]
DIRECT_URL=[SUA_DIRECT_URL_AQUI]

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=[SUA_URL_AQUI]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_KEY_AQUI]
SUPABASE_SERVICE_ROLE_KEY=[SUA_KEY_AQUI]

# Stripe (se configurado)
STRIPE_SECRET_KEY=[SUA_KEY_AQUI]
STRIPE_WEBHOOK_SECRET=[SUA_KEY_AQUI]

# Resend (se configurado)
RESEND_API_KEY=[SUA_KEY_AQUI]
```

---

## ✅ Checklist Final

- [ ] `NEXTAUTH_SECRET` configurado e **idêntico** ao local
- [ ] `NEXTAUTH_URL` = `https://smeducacional.vercel.app`
- [ ] Redeploy feito **sem cache**
- [ ] Cookies do navegador limpos
- [ ] Login testado em produção

---

## 🆘 Se Nada Funcionar

1. **Comparar `.env.local` com Vercel:**

   ```bash
   cat .env.local
   ```

   Confirmar que todas as variáveis críticas estão na Vercel

2. **Testar com Usuário Diferente:**

   - Criar novo usuário via `/register`
   - Tentar login com novo usuário

3. **Verificar se Banco Está Acessível:**
   ```bash
   npm run db:studio
   ```
   Confirmar que usuário `aluno@smeducacional.com` existe

---

**Depois de seguir este guia, o login DEVE funcionar em produção! 🚀**
