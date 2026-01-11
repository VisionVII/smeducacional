# 🔐 GUIA DE RESOLUÇÃO: Problemas de Login

## ⚠️ Problema: "Não consigo logar mesmo com credenciais certas"

---

## 🔍 Diagnóstico Rápido

### Passo 1: Verificar se há usuários no banco

```bash
# Execute o script de diagnóstico:
node scripts/diagnose-login.mjs
```

**O que esperar:**

- ✅ Se houver usuários listados → Vá para Passo 2
- ❌ Se não houver usuários → Vá para "Solução A"

---

## 💡 Soluções Mais Comuns

### ✅ Solução A: Usuário Não Existe no Banco

**Sintoma:** "Usuário não encontrado" ao fazer login

**Causa:** Nenhum usuário foi criado ainda no banco de dados

**Resolução:**

1. **Opção 1: Via Script (Recomendado)**

   ```bash
   # O script diagnose-login.mjs cria automaticamente um usuário de teste
   node scripts/diagnose-login.mjs

   # Uso as credenciais exibidas para logar
   ```

2. **Opção 2: Via SQL Direto (Supabase)**

   ```sql
   -- Acesse: https://supabase.com → seu projeto → SQL Editor

   INSERT INTO "User" (id, email, name, password, role, "emailVerified", "createdAt", "updatedAt")
   VALUES (
     'test-user-001',
     'teste@smeducacional.com',
     'Usuário Teste',
     '$2a$10$HASHEDPASSWORD_AQUI', -- Hash da senha "Teste@123456"
     'STUDENT',
     NOW(),
     NOW(),
     NOW()
   );
   ```

3. **Opção 3: Via Prisma Studio**

   ```bash
   npx prisma studio

   # UI abrirá em http://localhost:5555
   # Vá para a tabela User e crie um novo registro
   ```

---

### ✅ Solução B: Senha Não Corresponde (Hash Inválido)

**Sintoma:** "Credenciais inválidas" mesmo com senha certa

**Causa:** Senha em hash inválido ou não foi feito hash

**Resolução:**

1. **Verificar se senha está em hash:**

   ```bash
   # No Supabase SQL:
   SELECT id, email, password FROM "User"
   WHERE email = 'seu@email.com';

   -- Se password começa com $2a$ ou $2b$ → está em hash ✅
   -- Se é texto plano → INSEGURO ❌
   ```

2. **Re-fazer hash da senha:**

   ```bash
   # Criar um script node para gerar hash
   # Arquivo: scripts/hash-password.mjs

   import bcrypt from 'bcryptjs';

   const password = 'SuaSenha@123';
   const salt = 10;
   const hash = await bcrypt.hash(password, salt);
   console.log('Hash:', hash);
   ```

3. **Atualizar senha no banco:**
   ```sql
   UPDATE "User"
   SET password = '$2a$10$NOVO_HASH_AQUI'
   WHERE email = 'seu@email.com';
   ```

---

### ✅ Solução C: Cookie/Session Não É Salvo

**Sintoma:** Faz login, mas não redireciona / página fica carregando

**Causa:** NEXTAUTH_SECRET mismatch ou cookie não está sendo persistido

**Resolução:**

1. **Verificar NEXTAUTH_SECRET:**

   ```bash
   # No .env.local:
   # Deve estar assim (SEM aspas):
   NEXTAUTH_SECRET=+fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM=

   # NÃO assim:
   NEXTAUTH_SECRET="+fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM="
   ```

2. **Regenerar NEXTAUTH_SECRET:**

   ```bash
   # Execute no terminal:
   openssl rand -base64 32

   # Copie o resultado e atualize .env.local
   ```

3. **Limpar cookies e cache:**

   - Abra DevTools (F12)
   - Vá para Application → Cookies
   - Delete todos os cookies de localhost
   - Recarregue a página
   - Tente fazer login novamente

4. **Verificar database URL:**

   ```bash
   # No .env.local, certifique-se que:
   DATABASE_URL= # ✅ Contém a URL com pooler (pgbouncer)
   DIRECT_URL=   # ✅ Contém a URL sem pooler

   # Não inverta! DATABASE_URL DEVE ter pooler para App Router
   ```

---

### ✅ Solução D: 2FA Está Ativado e Bloqueando

**Sintoma:** Faz login com email/senha, mas pede código 2FA que não tem

**Causa:** Usuário foi criado com 2FA ativado

**Resolução:**

1. **Desativar 2FA para o usuário:**

   ```sql
   UPDATE "User"
   SET "twoFactorEnabled" = false
   WHERE email = 'seu@email.com';
   ```

2. **Ou forneça o código 2FA:**
   - Se tiver acesso ao TOTP original, use
   - Caso contrário, desative conforme acima

---

### ✅ Solução E: Email Não Está Verificado

**Sintoma:** Login faz mas não redireciona para dashboard

**Causa:** `emailVerified` está NULL

**Resolução:**

```sql
UPDATE "User"
SET "emailVerified" = NOW()
WHERE email = 'seu@email.com';
```

---

## 🛠️ Checklist Completo de Verificação

| Item               | Verificar                         | Status           |
| ------------------ | --------------------------------- | ---------------- |
| **Banco de Dados** | Conexão ativa                     | ⚠️               |
|                    | Usuários existem                  | ⚠️               |
|                    | Senhas em hash bcrypt             | ⚠️               |
|                    | emailVerified ≠ NULL              | ⚠️               |
| **NextAuth**       | NEXTAUTH_SECRET definido          | ⚠️               |
|                    | DATABASE_URL com pooler           | ⚠️               |
|                    | DIRECT_URL sem pooler             | ⚠️               |
| **Variáveis**      | NODE_ENV = development            | ⚠️               |
|                    | .env.local não está no .gitignore | ❌ (deve estar!) |
| **Cookies**        | HttpOnly ativado                  | ✅               |
|                    | SameSite = 'lax'                  | ✅               |
|                    | Secure = true (produção)          | ✅               |

---

## 🧪 Testes Rápidos

### Teste 1: Verificar endpoint de auth

```bash
# No terminal:
curl http://localhost:3000/api/auth/providers

# Deve retornar:
# {"credentials":{"id":"credentials","name":"Credentials"...},"google":{...}}
```

### Teste 2: Simular login via API

```bash
# Crie arquivo: test-login.mjs
import fetch from 'node-fetch';

const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'teste@smeducacional.com',
    password: 'Teste@123456',
  }),
  redirect: 'manual',
});

console.log('Status:', response.status);
console.log('Cookies:', response.headers.raw()['set-cookie']);
```

### Teste 3: Verificar session

```bash
# No navegador console:
fetch('/api/auth/session')
  .then(r => r.json())
  .then(s => console.log('Session:', s));

// Deve retornar: {user: {id, email, role, ...}}
// Se retornar null → Cookie não está sendo reconhecido
```

---

## 📋 Antes de Contatar Suporte

Coleta estas informações:

1. **Output do diagnóstico:**

   ```bash
   node scripts/diagnose-login.mjs > diagnostico.txt
   ```

2. **Logs do console (F12):**

   - Screenshot ou cópia dos erros

3. **Verificar **_auth[...]_** nos cookies:**

   - DevTools → Application → Cookies
   - Screenshot mostrando cookies presentes

4. **Versão do Node:**

   ```bash
   node --version  # Deve ser ≥16
   ```

5. **Status do banco:**
   ```sql
   SELECT COUNT(*) as "total_users" FROM "User";
   ```

---

## 🚀 Testes Pós-Correção

Após aplicar qualquer solução:

1. **Limpar Next.js cache:**

   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Limpar cookies do navegador:**

   - DevTools → Application → Cookies → Delete All

3. **Testar diferentes navegadores:**

   - Chrome, Firefox, Safari para descartar problemas de cookie

4. **Testar em modo incógnito:**
   - Para evitar cache do navegador

---

## 📞 Logs de Debug Úteis

Se ainda não conseguir, ative logs aumentados:

**No `.env.local`:**

```
NEXTAUTH_DEBUG=true
```

**No `src/lib/auth.ts`, descomente:**

```typescript
console.log('[auth][authorize]...'); // Já está lá
console.log('[auth][jwt]...');
console.log('[auth][session]...');
```

Então faça login e procure por:

- ✅ `[auth][authorize] Login autorizado com sucesso`
- ✅ `[auth][jwt] ✅ Token populado`
- ✅ `[auth][session] Criando sessão para`

Se não vir essas mensagens → Problema está na etapa anterior

---

## 🎯 Resumo das Ações

**Rápida (1 min):**

```bash
node scripts/diagnose-login.mjs
```

**Completa (5 min):**

1. node scripts/diagnose-login.mjs
2. Deletar cookies (DevTools)
3. Recarregar página
4. Fazer login com credenciais do script

**Avançada (15 min):**

1. Verificar DATABASE_URL vs DIRECT_URL
2. Regenerar NEXTAUTH_SECRET
3. Limpar .next
4. npm run dev
5. Testar

---

**Desenvolvido com excelência pela VisionVII — Inovação e Transformação Digital.**
