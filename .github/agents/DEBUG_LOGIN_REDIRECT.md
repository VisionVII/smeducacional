# 🔍 DEBUG: Login Redirect Loop — Análise dos Agentes

**Data:** 30 de dezembro de 2025  
**Prioridade:** 🔴 CRÍTICO  
**Status:** EM ANÁLISE

---

## 🚨 PROBLEMA REPORTADO

**Sintoma:** Após login bem-sucedido, usuário é redirecionado de volta para `/login` ao invés de ir para o dashboard.

**Comportamento esperado:**

```
Login (credentials válidos) → /student/dashboard (ou /teacher/dashboard ou /admin)
```

**Comportamento atual:**

```
Login (credentials válidos) → /login (LOOP)
```

---

## 📊 FLUXO DE AUTENTICAÇÃO ATUAL

### PASSO 1: Cliente submete form (login/page.tsx linha 78-84)

```typescript
const result = await signIn('credentials', {
  email: formData.email,
  password: formData.password,
  redirect: false, // ⚠️ Importante: redirect está FALSE
  twoFactorCode: require2FA ? twofaCode : undefined,
});

if (result?.ok) {
  toast.success('loginSuccess');
  window.location.href = '/student/dashboard'; // ⚠️ Hard redirect via JS
  return;
}
```

**Observação:** O redirect está setado como `false`, então NextAuth **NÃO** faz redirect automático. O código usa `window.location.href` para forçar navegação.

---

### PASSO 2: NextAuth processa credenciais (lib/auth.ts)

#### 2A. authorize() — Valida credenciais

```typescript
async authorize(credentials) {
  // 1. Valida email/password
  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

  // 2. Valida 2FA (se habilitado)
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const isValid = verifyTOTP(user.twoFactorSecret, twoFactorCode, 3);
  }

  // 3. Retorna user object
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    // ...
  };
}
```

#### 2B. jwt() — Popula token

```typescript
async jwt({ token, user, account }) {
  // Primeiro login (account existe)
  if (account?.provider === 'credentials' && user) {
    token.id = user.id;
    token.email = user.email;
    token.role = user.role;
    // ...
    return token;
  }

  // Requisições subsequentes (account é null)
  if (!account && token.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
    token.id = dbUser.id;
    token.role = dbUser.role;
    // ...
  }

  return token;
}
```

#### 2C. session() — Cria sessão

```typescript
async session({ session, token }) {
  if (session?.user) {
    session.user.id = token.id;
    session.user.role = token.role;
    session.user.avatar = token.avatar;
    // ...
  }
  return session;
}
```

#### 2D. redirect() — Customiza URLs (NÃO USADO se redirect: false)

```typescript
async redirect({ url, baseUrl }) {
  // Esta função NÃO é chamada quando signIn tem redirect: false
  // Apenas processa redirects automáticos do NextAuth

  if (url.includes('/api/')) {
    return url;  // Bloqueia API routes
  }

  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }

  return baseUrl;
}
```

---

### PASSO 3: Cookie é definido

**Nome do cookie:**

- Development: `next-auth.session-token`
- Production: `__Secure-next-auth.session-token`

**Configuração (lib/auth.ts linha 28-39):**

```typescript
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
},
```

**⚠️ POSSÍVEL PROBLEMA 1:** Cookie demora para ser definido no navegador antes do `window.location.href` ser executado.

---

### PASSO 4: Browser navega para /student/dashboard

Quando `window.location.href = '/student/dashboard'` executa:

1. Browser faz request GET para `/student/dashboard`
2. Next.js intercepta via middleware.ts
3. **AQUI ESTÁ O PONTO CRÍTICO**

---

### PASSO 5: Middleware valida (middleware.ts)

```typescript
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
  });

  const isAuthRoute = pathname.startsWith('/api/auth');
  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || isAuthRoute;

  // ⚠️ VERIFICAÇÃO 1: Se pathname === '/' e tem token, redireciona para dashboard
  if (pathname === '/' && token) {
    // ... redirect baseado em role
  }

  // ⚠️ VERIFICAÇÃO 2: Se NÃO tem token e NÃO é rota pública → /login
  if (!token && !isPublicRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return addSecurityHeaders(response);
  }

  // ⚠️ VERIFICAÇÃO 3: Valida role
  if (token) {
    const userRole = token.role as string;

    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
      const response = NextResponse.redirect(new URL('/', request.url));
      return addSecurityHeaders(response);
    }

    // ... outras validações de role
  }

  // ⚠️ VERIFICAÇÃO 4: Se logado e tenta /login ou /register, redireciona
  if (token && (pathname === '/login' || pathname === '/register')) {
    // ... redirect para dashboard baseado em role
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}
```

---

## 🔴 HIPÓTESES DO PROBLEMA

### HIPÓTESE 1: Race Condition (Cookie ainda não está disponível)

**Descrição:** O cookie `next-auth.session-token` ainda não foi definido no browser quando `window.location.href` executa.

**Fluxo:**

```
1. signIn() retorna ok=true ✅
2. window.location.href = '/student/dashboard' executa IMEDIATAMENTE
3. Browser faz GET /student/dashboard
4. Middleware chama getToken() → ❌ Cookie ainda não existe
5. Middleware redireciona para /login (linha 104)
```

**Validação:**

- Verificar console de rede (Network tab) se cookie aparece no request para `/student/dashboard`
- Verificar timing entre signIn response e window.location

**Solução Proposta:**

```typescript
if (result?.ok) {
  toast.success('loginSuccess');

  // Esperar cookie ser definido
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Ou forçar reload da session antes de navegar
  const session = await fetch('/api/auth/session').then((r) => r.json());

  if (session?.user) {
    window.location.href = '/student/dashboard';
  }
}
```

---

### HIPÓTESE 2: NEXTAUTH_SECRET Mismatch

**Descrição:** O secret usado no middleware é diferente do secret usado no authOptions.

**Validação:**

```bash
# Verificar se NEXTAUTH_SECRET está definido em .env
echo $NEXTAUTH_SECRET

# Confirmar que middleware.ts e lib/auth.ts usam a mesma variável
```

**Solução:** Garantir que `process.env.NEXTAUTH_SECRET` é o mesmo em ambos os arquivos.

---

### HIPÓTESE 3: Cookie Name Mismatch

**Descrição:** O nome do cookie no middleware não bate com o nome do cookie definido no authOptions.

**Atual:**

- authOptions (lib/auth.ts): `next-auth.session-token` (dev) | `__Secure-next-auth.session-token` (prod)
- middleware (middleware.ts): `next-auth.session-token` (dev) | `__Secure-next-auth.session-token` (prod)

**Status:** ✅ Os nomes batem.

---

### HIPÓTESE 4: Middleware executa antes do callback jwt()

**Descrição:** O middleware intercepta o request antes que NextAuth finalize o callback `jwt()` e popule o token.

**Validação:**

- Adicionar logs em lib/auth.ts callback jwt(): `console.log('[auth][jwt] Token populado:', token)`
- Adicionar logs em middleware.ts: `console.log('[middleware] Token recebido:', token)`

**Timeline esperada:**

```
1. authorize() retorna user ✅
2. jwt() popula token ✅
3. session() cria session ✅
4. Cookie é definido no response ✅
5. Browser recebe response com Set-Cookie header ✅
6. window.location.href executa novo request
7. Browser envia request COM cookie ✅
8. Middleware lê cookie via getToken() ✅
```

**Se cookie não aparece no passo 7, é race condition.**

---

### HIPÓTESE 5: PUBLIC_ROUTES include '/student/dashboard' erroneamente

**Descrição:** Se `/student/dashboard` estiver nas PUBLIC_ROUTES, o middleware não valida token.

**Validação:**

```typescript
const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  // ... outras rotas públicas
]);

// ✅ '/student/dashboard' NÃO está aqui
```

**Status:** ✅ Não está nas PUBLIC_ROUTES.

---

## 🎯 PLANO DE DEBUG (PRÓXIMOS PASSOS)

### FASE 1: Logging Detalhado

**[@SecureOpsAI]** Adicionar logs em pontos críticos:

1. **login/page.tsx (após signIn):**

```typescript
if (result?.ok) {
  console.log('[LOGIN] ✅ signIn OK, aguardando 500ms...');
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('[LOGIN] Verificando session...');
  const session = await fetch('/api/auth/session').then((r) => r.json());
  console.log('[LOGIN] Session:', session);

  if (session?.user) {
    console.log('[LOGIN] Navegando para dashboard...');
    window.location.href = '/student/dashboard';
  } else {
    console.error('[LOGIN] ❌ Session não encontrada após signIn OK');
  }
}
```

2. **lib/auth.ts (callback jwt):**

```typescript
async jwt({ token, user, account }) {
  console.log('[AUTH][JWT] ========== JWT CALLBACK ==========');
  console.log('[AUTH][JWT] trigger:', { hasUser: !!user, hasAccount: !!account });
  console.log('[AUTH][JWT] token ANTES:', { id: token.id, role: token.role });

  // ... lógica existente ...

  console.log('[AUTH][JWT] token DEPOIS:', { id: token.id, role: token.role });
  return token;
}
```

3. **middleware.ts (getToken):**

```typescript
const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
  cookieName: '...',
});

console.log('[MIDDLEWARE] Pathname:', pathname);
console.log(
  '[MIDDLEWARE] Token:',
  token ? { id: token.id, role: token.role, email: token.email } : 'NULL'
);
console.log('[MIDDLEWARE] Cookies:', request.cookies.getAll());
```

---

### FASE 2: Implementar Fix de Race Condition

**[@FullstackAI]** Modificar login/page.tsx para aguardar session:

```typescript
if (result?.ok) {
  toast.success('loginSuccess');

  // Polling até session estar disponível
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const session = await fetch('/api/auth/session', {
      cache: 'no-store',
    }).then((r) => r.json());

    if (session?.user) {
      console.log('[LOGIN] Session disponível, redirecionando...');

      // Redirecionar baseado em role
      const dashboardUrl =
        session.user.role === 'ADMIN'
          ? '/admin'
          : session.user.role === 'TEACHER'
          ? '/teacher/dashboard'
          : '/student/dashboard';

      window.location.href = dashboardUrl;
      return;
    }

    console.log('[LOGIN] Aguardando session... (tentativa', attempts + 1, ')');
    await new Promise((resolve) => setTimeout(resolve, 200));
    attempts++;
  }

  console.error('[LOGIN] ❌ Timeout aguardando session');
  toast.error('sessionTimeout');
  setIsLoading(false);
}
```

---

### FASE 3: Validar Cookie Headers

**[@DevOpsAI]** Verificar no Network tab do browser:

1. Request para `/api/auth/callback/credentials`

   - Response deve ter header: `Set-Cookie: next-auth.session-token=...`

2. Request subsequente para `/student/dashboard`
   - Request deve ter header: `Cookie: next-auth.session-token=...`

Se faltarem cookies, verificar:

- SameSite policy (deve ser 'lax')
- Secure flag (deve estar false em dev, true em prod)
- Path (deve ser '/')

---

## 📌 DELEGAÇÃO IMEDIATA

| Agente             | Task                                                  |
| ------------------ | ----------------------------------------------------- |
| **[@FullstackAI]** | Implementar polling de session antes de redirect      |
| **[@SecureOpsAI]** | Adicionar logs detalhados nos 3 arquivos              |
| **[@DevOpsAI]**    | Validar cookies no Network tab e reportar headers     |
| **[@ArchitectAI]** | Revisar fluxo auth e propor alternativa se necessário |

---

**ATENÇÃO:** Este é um bug **BLOCKER** para o sistema. Nenhum usuário consegue fazer login.

Todos os agentes devem priorizar esta análise.

---

**Documento gerado por:** Orquestrador Central  
**Versão:** 1.0 — Debug Login Redirect  
**Classificação:** Internal Use — Agentes VisionVII
