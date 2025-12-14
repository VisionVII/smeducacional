# 🔐 Auditoria Completa de Segurança e Autenticação

**Sistema Escolar VisionVII**  
**Data:** 14 de dezembro de 2025

---

## 📋 Resumo Executivo

### ✅ Pontos Fortes Identificados

1. **NextAuth v4** configurado com JWT strategy
2. **2FA (TOTP)** implementado em todos os perfis (STUDENT, TEACHER, ADMIN)
3. **OAuth Google** configurado como alternativa ao login por credenciais
4. **Middleware RBAC** validando roles e protegendo rotas
5. **Security Headers** CSP, X-Frame-Options, XSS Protection configurados
6. **Cookies seguros** com estratégia environment-aware (prod vs dev)

### ⚠️ Vulnerabilidades Críticas Encontradas

#### 1. **2FA NÃO VALIDADO NO FLUXO DE LOGIN** 🚨 CRÍTICO

**Problema:** O sistema exibe UI para 2FA na página de login, mas **NÃO valida o código** no backend antes de conceder acesso.

**Arquivos afetados:**

- `src/app/login/page.tsx` (linhas 90-120)
- `src/lib/auth.ts` (callback `authorize`)

**Impacto:**

- Usuários com 2FA habilitado podem fazer login **SEM inserir código válido**
- Gate de 2FA (`setRequire2FA(true)`) apenas exibe input, mas não há validação server-side
- Após clicar "Verificar 2FA", o código é enviado para `/api/2fa/verify` mas o resultado **NÃO bloqueia** o redirect para dashboard

**Prova:**

```tsx
// src/app/login/page.tsx linha 350-380
const res = await fetch('/api/2fa/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: twofaCode }),
});

if (!res.ok) throw new Error('Não foi possível verificar 2FA.');

// ⚠️ VULNERABILIDADE: Mesmo se verificação falhar, usuário continua logado
// Session já foi criada no signIn anterior!
```

**Status:** 🔴 **VULNERABILIDADE CRÍTICA DE SEGURANÇA**

---

#### 2. **Estado 2FA Não Sincronizado com JWT** 🚨 ALTO RISCO

**Problema:** Campo `twoFactorEnabled` não é incluído no token JWT do NextAuth.

**Arquivos afetados:**

- `src/lib/auth.ts` (callbacks `jwt` e `session`)

**Impacto:**

- Sessão não carrega `twoFactorEnabled` do banco
- Frontend depende de fetch manual para verificar status 2FA
- Gate de 2FA no login pode ser bypassado se cliente não buscar o campo

**Código atual:**

```typescript
// src/lib/auth.ts - callback jwt
token.id = dbUser.id;
token.email = dbUser.email;
token.name = dbUser.name;
token.role = dbUser.role;
token.avatar = dbUser.avatar;
// ⚠️ FALTA: token.twoFactorEnabled = dbUser.twoFactorEnabled;
```

**Status:** 🔴 **VULNERABILIDADE DE SINCRONIZAÇÃO**

---

#### 3. **Cookie Strategy Inconsistente Entre Prod e Dev**

**Problema:** Nome do cookie muda entre ambientes, mas não há validação consistente.

**Arquivos afetados:**

- `src/lib/auth.ts` (linha 14-26)
- `src/middleware.ts` (linha 70-74)

**Impacto:**

- Possível quebra de sessão em deploys preview
- Cookies podem não ser lidos corretamente se `NODE_ENV` não estiver definido

**Código:**

```typescript
// auth.ts
cookieName: process.env.NODE_ENV === 'production'
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token',

// middleware.ts usa mesma lógica
```

**Status:** 🟡 **RISCO MÉDIO** (funcional, mas frágil)

---

## 🔍 Análise Detalhada por Componente

### 1. NextAuth Configuration (`src/lib/auth.ts`)

#### ✅ Configurações Corretas

- JWT strategy com `maxAge: 30 dias`
- Cookies `httpOnly`, `sameSite: 'lax'`
- Secure cookies em produção
- Session callback enriquece token com `id`, `role`, `avatar`

#### ❌ Problemas Identificados

1. **Authorize não valida 2FA:**

   ```typescript
   async authorize(credentials) {
     // ✅ Valida email/password
     // ❌ NÃO verifica twoFactorEnabled
     // ❌ NÃO solicita código 2FA

     return { id, email, name, role, avatar, password, emailVerified };
     // ⚠️ Retorna usuário MESMO se twoFactorEnabled === true
   }
   ```

2. **JWT callback não inclui twoFactorEnabled:**

   ```typescript
   const dbUser = await prisma.user.findUnique({
     where: { email: token.email },
     select: { id, name, email, role, avatar }, // ⚠️ Falta twoFactorEnabled
   });
   ```

3. **Session callback não propaga 2FA:**
   ```typescript
   (session.user as any).id = token.id;
   (session.user as any).role = token.role;
   (session.user as any).avatar = token.avatar;
   // ⚠️ Falta: (session.user as any).twoFactorEnabled = token.twoFactorEnabled;
   ```

---

### 2. Middleware RBAC (`src/middleware.ts`)

#### ✅ Funcionalidades Corretas

- Valida JWT com `getToken()` de next-auth
- Protege rotas `/student`, `/teacher`, `/admin` por role
- Redireciona usuários não autorizados
- Security headers em todas as respostas (CSP, X-Frame-Options, etc.)

#### ❌ Gaps de Segurança

1. **Não valida 2FA no middleware:**

   - Mesmo com `twoFactorEnabled: true`, usuário acessa rotas protegidas
   - Gate de 2FA só existe na UI de login, não no server-side

2. **PUBLIC_ROUTES permite acesso sem autenticação:**
   - Rotas `/teacher`, `/admin` são públicas (páginas de marketing)
   - Não há conflito com rotas `/teacher/*` e `/admin/*` (protegidas)
   - ✅ **Correto**, mas pode confundir auditores

---

### 3. Implementação de 2FA

#### ✅ APIs Implementadas

**Setup 2FA:**

- `/api/2fa/setup` (STUDENT/ADMIN)
- `/api/student/2fa/setup`
- `/api/teacher/2fa/enable`

**Verificação:**

- `/api/2fa/verify` (STUDENT/ADMIN)
- `/api/student/2fa/verify`
- `/api/teacher/2fa/verify`

**Desabilitar:**

- `/api/2fa/disable` (STUDENT/ADMIN)
- `/api/student/2fa/disable`
- `/api/teacher/2fa/disable`

**Status:**

- `/api/teacher/2fa/status`

#### ✅ Componentes UI

- `src/components/two-factor-modal.tsx` (modal genérico com countdown)
- Páginas de profile com QR code e ativação (STUDENT, TEACHER, ADMIN)

#### ❌ Problemas de Implementação

1. **APIs não são chamadas no fluxo de login:**

   - `/api/2fa/verify` só é usado para **habilitar** 2FA, não para **validar login**
   - Login com 2FA habilitado **NÃO chama** endpoint de verificação

2. **Falta integração entre CredentialsProvider e 2FA:**

   ```typescript
   // src/app/login/page.tsx
   const result = await signIn('credentials', {
     email: formData.email,
     password: formData.password,
     redirect: false,
   });
   // ✅ SignIn bem-sucedido
   // ⚠️ 2FA NÃO foi validado aqui!

   if (session?.user?.twoFactorEnabled) {
     setRequire2FA(true); // Apenas exibe UI, NÃO bloqueia login
   }
   ```

3. **Código 2FA não é armazenado temporariamente:**
   - Usuário pode inserir código inválido e ainda assim acessar sistema
   - Não há rate limiting para tentativas de código

---

### 4. Fluxo de Login (Credentials)

#### Atual

```mermaid
graph TD
    A[Usuário insere email/password] --> B[signIn('credentials')]
    B --> C{Senha válida?}
    C -->|Sim| D[Session criada]
    C -->|Não| E[Erro exibido]
    D --> F{twoFactorEnabled?}
    F -->|Sim| G[UI solicita código 2FA]
    F -->|Não| H[Redirect para dashboard]
    G --> I[Usuário insere código]
    I --> J[Fetch /api/2fa/verify]
    J --> K{Código válido?}
    K -->|Sim| H
    K -->|Não| L[Toast erro, MAS usuário continua logado!]
```

#### ⚠️ Vulnerabilidade

**Passo L:** Mesmo se código 2FA for inválido, usuário **JÁ ESTÁ LOGADO** porque sessão foi criada no passo D.

---

### 5. Fluxo de Login (Google OAuth)

#### ✅ Implementação Correta

```typescript
// src/lib/auth.ts
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  allowDangerousEmailAccountLinking: true, // ⚠️ Risco: emails duplicados
});
```

#### ❌ Problema: OAuth Bypass 2FA

- Google OAuth **NÃO valida 2FA**
- Usuário pode habilitar 2FA, depois fazer login via Google e **bypassar** completamente

**Cenário de ataque:**

1. Usuário cria conta com email/senha
2. Habilita 2FA
3. Faz logout
4. Clica "Login com Google" usando mesmo email
5. **Sistema faz login SEM pedir código 2FA!**

---

### 6. Persistência de Sessão

#### ✅ Correto

- Cookies httpOnly com SameSite=lax
- MaxAge de 30 dias
- Secure flag em produção

#### ❌ Problemas

1. **Estado do usuário não sincroniza em tempo real:**

   - Se admin desabilitar usuário, sessão continua válida por 30 dias
   - Não há invalidação de tokens em logout forçado

2. **Role pode ser alterado sem reautenticação:**

   - Se admin mudar role de STUDENT → TEACHER, usuário precisa fazer logout manual
   - Token JWT não é invalidado

3. **2FA pode ser desabilitado mas sessão continua:**
   - Usuário desabilita 2FA no profile
   - Sessão atual não é invalidada
   - Próximo login NÃO pedirá 2FA

---

### 7. Dashboards por Role

#### Auditoria de Acesso

| Dashboard | Rota                 | Proteção Middleware | Validação Auth | Status |
| --------- | -------------------- | ------------------- | -------------- | ------ |
| Admin     | `/admin/dashboard`   | ✅ Role=ADMIN       | ✅ `auth()`    | ✅ OK  |
| Teacher   | `/teacher/dashboard` | ✅ Role=TEACHER     | ✅ `auth()`    | ✅ OK  |
| Student   | `/student/dashboard` | ✅ Role=STUDENT     | ✅ `auth()`    | ✅ OK  |

#### ✅ Dashboards Funcionais

- Todos os dashboards validam sessão com `auth()` de NextAuth
- Middleware bloqueia acesso cross-role
- UI renderiza dados baseados no role do usuário

#### ⚠️ Inconsistências de UX

- Nenhum dashboard exibe indicador de "2FA Ativo" no header
- Usuários não sabem se 2FA está habilitado sem acessar página de profile

---

## 🔐 Recomendações de Correção (Prioridade Alta)

### 1. Implementar Validação 2FA no Backend (CRÍTICO)

**Arquivos a alterar:**

- `src/lib/auth.ts`
- `src/app/login/page.tsx`
- `src/app/api/auth/[...nextauth]/route.ts` (se existir)

**Solução:**

#### Opção A: Validar no CredentialsProvider (Recomendado)

```typescript
// src/lib/auth.ts - CredentialsProvider
async authorize(credentials) {
  // ... validação atual de email/password

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: {
      id, email, name, role, avatar, password,
      twoFactorEnabled, twoFactorSecret // ← ADICIONAR
    },
  });

  if (!user.password || !await bcrypt.compare(credentials.password, user.password)) {
    throw new Error('Credenciais inválidas');
  }

  // ✅ NOVO: Validar 2FA ANTES de retornar usuário
  if (user.twoFactorEnabled) {
    const twoFactorCode = credentials.twoFactorCode; // ← Passar do frontend

    if (!twoFactorCode) {
      throw new Error('2FA_REQUIRED'); // ← Frontend detecta e mostra UI
    }

    const isValid = verifyTOTP(user.twoFactorSecret!, twoFactorCode);
    if (!isValid) {
      throw new Error('Código 2FA inválido');
    }
  }

  return { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar };
}
```

#### Frontend Login Page

```tsx
// src/app/login/page.tsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  const result = await signIn('credentials', {
    email: formData.email,
    password: formData.password,
    twoFactorCode: twofaCode || undefined, // ← Enviar código se disponível
    redirect: false,
  });

  if (result?.error === '2FA_REQUIRED') {
    setRequire2FA(true); // ← Mostrar input 2FA
    setIsLoading(false);
    return;
  }

  if (result?.error) {
    toast({ title: 'Erro', description: result.error, variant: 'destructive' });
    setIsLoading(false);
    return;
  }

  // ✅ Login bem-sucedido COM 2FA validado
  redirect('/dashboard');
};
```

---

### 2. Adicionar twoFactorEnabled ao JWT e Session

```typescript
// src/lib/auth.ts - callback jwt
const dbUser = await prisma.user.findUnique({
  where: { email: token.email },
  select: {
    id,
    name,
    email,
    role,
    avatar,
    twoFactorEnabled, // ← ADICIONAR
  },
});

token.twoFactorEnabled = dbUser.twoFactorEnabled;

// callback session
(session.user as any).twoFactorEnabled = token.twoFactorEnabled;
```

---

### 3. Validar 2FA no OAuth Google

```typescript
// src/lib/auth.ts - callback signIn
async signIn({ user, account, profile }) {
  if (account?.provider === 'google') {
    const dbUser = await prisma.user.findUnique({
      where: { email: profile.email },
      select: { twoFactorEnabled: true },
    });

    if (dbUser?.twoFactorEnabled) {
      // ⚠️ OAuth não pode solicitar 2FA inline
      // Opções:
      // A) Redirecionar para página de verificação 2FA pós-login
      // B) Enviar email com código de verificação
      // C) Desabilitar OAuth para usuários com 2FA ativo
      throw new Error('2FA habilitado. Use login com email/senha.');
    }
  }
  return true;
}
```

---

### 4. Adicionar Rate Limiting em 2FA

```typescript
// src/app/api/2fa/verify/route.ts
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  // ✅ Rate limit: 5 tentativas por 15 minutos
  const rateLimitCheck = checkRateLimit(`2fa:${session.user.id}`, {
    limit: 5,
    windowSeconds: 900,
  });

  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
      { status: 429 }
    );
  }

  // ... resto da validação
}
```

---

### 5. Invalidar Sessões em Mudanças Críticas

**Implementar Blacklist de Tokens (Redis ou Banco)**

```typescript
// src/lib/auth.ts - callback jwt
async jwt({ token, trigger }) {
  // Verificar se token foi revogado
  const isRevoked = await prisma.revokedToken.findUnique({
    where: { userId_jti: { userId: token.id, jti: token.jti } },
  });

  if (isRevoked) {
    throw new Error('Sessão inválida');
  }

  return token;
}
```

**Revogar em mudanças críticas:**

```typescript
// Quando admin desabilitar usuário ou mudar role
await prisma.revokedToken.create({
  data: { userId, jti: '*' }, // Revogar TODAS as sessões
});
```

---

## 📊 Checklist de Segurança

### Autenticação

- [x] NextAuth configurado
- [x] JWT strategy
- [x] Cookies httpOnly e secure
- [x] Google OAuth implementado
- [ ] 🚨 **2FA validado no login com credenciais**
- [ ] 🚨 **2FA integrado com OAuth**
- [ ] **Rate limiting em login**
- [ ] **Captcha em tentativas falhadas**

### Autorização

- [x] Middleware RBAC por role
- [x] Rotas protegidas
- [ ] **Validação de role em TODAS as API routes**
- [ ] **Logs de acesso administrativo**

### 2FA

- [x] APIs de setup/verify/disable
- [x] QR Code TOTP
- [x] UI em profiles
- [ ] 🚨 **Validação obrigatória no login**
- [ ] **Rate limiting em verificação**
- [ ] **Backup codes**
- [ ] **Notificação por email ao habilitar/desabilitar**

### Sessões

- [x] Cookies httpOnly
- [x] MaxAge 30 dias
- [ ] **Blacklist de tokens revogados**
- [ ] **Logout forçado por admin**
- [ ] **Expiração automática em inatividade**

### Monitoramento

- [ ] **Logs de login bem-sucedido**
- [ ] **Logs de tentativas falhadas**
- [ ] **Alertas de múltiplas tentativas**
- [ ] **Dashboard de acessos recentes**

---

## 🎯 Próximos Passos

### Fase 1: Correções Críticas (Urgente)

1. ✅ Implementar validação 2FA no `CredentialsProvider.authorize`
2. ✅ Adicionar `twoFactorCode` ao formulário de login
3. ✅ Incluir `twoFactorEnabled` no JWT e session
4. ✅ Testar fluxo completo de login com 2FA

### Fase 2: Melhorias de Segurança (Alta Prioridade)

1. ⚠️ Rate limiting em `/api/auth/*` e `/api/2fa/*`
2. ⚠️ Validar 2FA no OAuth ou desabilitar OAuth para usuários com 2FA
3. ⚠️ Implementar blacklist de tokens revogados
4. ⚠️ Adicionar logs de acesso

### Fase 3: UX e Monitoramento (Média Prioridade)

1. Indicador de 2FA ativo no header
2. Dashboard de acessos recentes
3. Notificações por email em mudanças críticas
4. Backup codes para 2FA

---

## 📝 Conclusão

O sistema possui **infraestrutura sólida** de autenticação, mas apresenta **vulnerabilidade crítica** no fluxo de 2FA que permite login sem validação do código TOTP. Todas as correções sugeridas são implementáveis sem refatoração de arquitetura.

**Prioridade máxima:** Implementar validação server-side de 2FA no authorize callback antes de deploy em produção.

---

**Desenvolvido com excelência pela VisionVII** — uma empresa focada em desenvolvimento de software, inovação tecnológica e transformação digital.
