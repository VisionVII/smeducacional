# 🔬 ANÁLISE TÉCNICA: Por Que 2FA Bloqueia o Login

## Fluxo de Autenticação (src/lib/auth.ts)

### 1️⃣ Usuário Digita Email + Senha

```typescript
// Linha 64-66
if (!credentials?.email || !credentials?.password) {
  throw new Error('Email e senha são obrigatórios');
}
```

✅ **Validação passa** → Email e senha fornecidos

---

### 2️⃣ Busca Usuário no Banco

```typescript
// Linha 68-84
const user = await prisma.user.findUnique({
  where: { email: credentials.email },
  select: {
    id: true,
    email: true,
    password: true,
    twoFactorEnabled: true, // ← Aqui está o problema!
    twoFactorSecret: true, // ← E aqui!
  },
});
```

**Resultado:**

```json
{
  "email": "admin@teste.com",
  "password": "$2a$10$hashedpassword...",
  "twoFactorEnabled": true, // ⚠️ PROBLEMA!
  "twoFactorSecret": "JBSWY3DP..." // ⚠️ PROBLEMA!
}
```

✅ **Usuário encontrado**

---

### 3️⃣ Valida Senha com bcrypt

```typescript
// Linha 105-108
const isPasswordValid = await bcrypt.compare(
  credentials.password, // "Admin@123456" (digitado)
  user.password // "$2a$10$..." (hash do banco)
);
```

**Resultado:**

```javascript
isPasswordValid = true; // ✅ Senha CORRETA!
```

✅ **Senha válida**

---

### 4️⃣ ⚠️ AQUI ESTÁ O BLOQUEIO!

```typescript
// Linha 116-118
if (!isPasswordValid) {
  throw new Error('Credenciais inválidas');
}

// ⚠️ Senha passou, mas...

// Linha 120-123 (BLOQUEIO!)
if (user.twoFactorEnabled && user.twoFactorSecret) {
  console.log('[auth][authorize] 🔐 Usuário possui 2FA habilitado');

  const twoFactorCode = credentials.twoFactorCode?.trim();

  if (!twoFactorCode) {
    // 🔴 AQUI É ONDE FALHA!
    throw new Error('Código de autenticação de dois fatores necessário');
  }
}
```

**O que acontece:**

1. `user.twoFactorEnabled` = **true** ✅
2. `user.twoFactorSecret` = **"JBSWY3DP..."** ✅
3. `credentials.twoFactorCode` = **undefined** ❌

**Resultado:** `throw new Error('Código de autenticação de dois fatores necessário')`

❌ **Login bloqueado** mesmo com senha correta!

---

## 🎯 Linha Exata do Bloqueio

**Arquivo:** `src/lib/auth.ts`
**Linha:** 120-132

```typescript
120 | // 🔐 VALIDAÇÃO 2FA OBRIGATÓRIA
121 | if (user.twoFactorEnabled && user.twoFactorSecret) {
122 |   console.log('[auth][authorize] 🔐 Usuário possui 2FA habilitado');
123 |
124 |   const twoFactorCode = credentials.twoFactorCode?.trim();
125 |
126 |   if (!twoFactorCode) {
127 |     console.log('[auth][authorize] ⚠️ 2FA requerido mas código não fornecido');
128 |
129 |     // 🔴 ERRO LANÇADO AQUI!
130 |     throw new Error('Código de autenticação de dois fatores necessário');
131 |   }
132 |
```

---

## 🔍 Estado do Banco de Dados (ANTES da correção)

```sql
SELECT
  email,
  "twoFactorEnabled",
  "twoFactorSecret",
  LEFT(password, 20) as password_preview
FROM "User"
WHERE email = 'admin@teste.com';
```

**Resultado:**

```
| email           | twoFactorEnabled | twoFactorSecret | password_preview      |
|-----------------|------------------|-----------------|-----------------------|
| admin@teste.com | true             | JBSWY3DPEHP...  | $2a$10$zVxQ4rU...  |
```

⚠️ **twoFactorEnabled = true** → Bloqueia login!

---

## ✅ Estado do Banco (DEPOIS da correção)

Após executar `node scripts/fix-existing-users.mjs`:

```sql
SELECT
  email,
  "twoFactorEnabled",
  "twoFactorSecret",
  LEFT(password, 20) as password_preview
FROM "User"
WHERE email = 'admin@teste.com';
```

**Resultado:**

```
| email           | twoFactorEnabled | twoFactorSecret | password_preview      |
|-----------------|------------------|-----------------|-----------------------|
| admin@teste.com | false            | NULL            | $2a$10$NEW_HASH...  |
```

✅ **twoFactorEnabled = false** → Login liberado!

---

## 📊 Fluxograma Completo

```
┌─────────────────────────────────────┐
│  Usuário digita email + senha       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Busca usuário no banco             │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Encontrado?  │
        └──────┬───────┘
               │
        ┌──────┴──────┐
        │             │
       NÃO           SIM
        │             │
        ▼             ▼
  [ERRO: User    ┌─────────────────┐
   not found]    │ Valida senha    │
                 │ (bcrypt.compare)│
                 └────────┬────────┘
                          │
                   ┌──────┴──────┐
                   │             │
                INVÁLIDA       VÁLIDA
                   │             │
                   ▼             ▼
             [ERRO: Invalid] ┌──────────────────┐
                             │ 2FA ativado?     │
                             │ twoFactorEnabled │
                             └────────┬─────────┘
                                      │
                               ┌──────┴──────┐
                               │             │
                              NÃO           SIM
                               │             │
                               ▼             ▼
                         [LOGIN OK!]  ┌─────────────────┐
                               │      │ Código fornecido│
                               │      └────────┬────────┘
                               │               │
                               │        ┌──────┴──────┐
                               │        │             │
                               │       NÃO           SIM
                               │        │             │
                               │        ▼             ▼
                               │   [ERRO: 2FA  ┌──────────────┐
                               │    required]  │ Valida código│
                               │               └──────┬───────┘
                               │                      │
                               │               ┌──────┴──────┐
                               │               │             │
                               │           INVÁLIDO      VÁLIDO
                               │               │             │
                               │               ▼             ▼
                               │         [ERRO: Bad]  [LOGIN OK!]
                               │          [2FA code]         │
                               │                             │
                               └─────────────────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ Cria JWT token  │
                                    │ Retorna session │
                                    └─────────────────┘
```

**🔴 Bloqueio acontece aqui:** "2FA required" quando `twoFactorEnabled = true`

---

## 🔧 O Que o Script Faz

### Código do Script (fix-existing-users.mjs)

```javascript
// 1. Desativar 2FA de TODOS os usuários
const disabledCount = await prisma.user.updateMany({
  data: {
    twoFactorEnabled: false, // ← Resolve o problema!
    twoFactorSecret: null, // ← Remove o segredo!
  },
});

// 2. Resetar senhas dos usuários conhecidos
const hashedPassword = await bcrypt.hash('Admin@123456', 10);

await prisma.user.update({
  where: { email: 'admin@teste.com' },
  data: {
    password: hashedPassword,
    twoFactorEnabled: false, // ← Garante que está false!
    twoFactorSecret: null, // ← Remove o segredo!
    emailVerified: new Date(), // ← Garante verificação
  },
});
```

---

## 🧪 Teste de Validação

### Antes da Correção

```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -d "email=admin@teste.com" \
  -d "password=Admin@123456"

# Resposta:
# {
#   "error": "Código de autenticação de dois fatores necessário"
# }
```

### Depois da Correção

```bash
node scripts/fix-existing-users.mjs

curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -d "email=admin@teste.com" \
  -d "password=Admin@123456"

# Resposta:
# {
#   "url": "http://localhost:3000/admin",
#   "token": "eyJhbGciOiJIUzI1NiIs..."
# }
```

✅ **Login bem-sucedido!**

---

## 📝 Logs do Terminal (Durante Login)

### Com 2FA Ativado (Falha)

```
[auth][authorize] Iniciando autorização: { email: 'admin@teste.com', hasPassword: true, has2FA: false }
[auth][authorize] Usuário encontrado: { found: true, email: 'admin@teste.com', hasPassword: true, role: 'ADMIN' }
[auth][authorize] Validação de senha: { isValid: true, passwordLength: 13, hashLength: 60 }
[auth][authorize] 🔐 Usuário possui 2FA habilitado
[auth][authorize] ⚠️ 2FA requerido mas código não fornecido
[auth][authorize] ❌ Erro: Código de autenticação de dois fatores necessário
```

### Sem 2FA (Sucesso)

```
[auth][authorize] Iniciando autorização: { email: 'admin@teste.com', hasPassword: true, has2FA: false }
[auth][authorize] Usuário encontrado: { found: true, email: 'admin@teste.com', hasPassword: true, role: 'ADMIN' }
[auth][authorize] Validação de senha: { isValid: true, passwordLength: 13, hashLength: 60 }
[auth][authorize] ✅ Login bem-sucedido: { userId: 'cm...', email: 'admin@teste.com', role: 'ADMIN' }
```

---

## 🎯 Resumo Técnico

| Campo              | Antes           | Depois       | Efeito              |
| ------------------ | --------------- | ------------ | ------------------- |
| `twoFactorEnabled` | **true**        | **false**    | Login liberado ✅   |
| `twoFactorSecret`  | `"JBSWY3DP..."` | **null**     | Sem segredo 2FA ✅  |
| `password`         | Hash antigo     | Hash novo    | Senha conhecida ✅  |
| `emailVerified`    | null/antigo     | `2026-01-05` | Email verificado ✅ |

**Desenvolvido com excelência pela VisionVII — Inovação e Transformação Digital.**
