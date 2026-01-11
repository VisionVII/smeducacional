# ⚠️ URGENTE: Senhas Antigas Não Funcionam

## Problema

Você tinha usuários **admin**, **professor** e **aluno** que funcionavam antes, mas agora não consegue mais fazer login mesmo digitando a senha certa.

---

## 🎯 CAUSA RAIZ

**O problema é o 2FA (Autenticação de Dois Fatores)!**

Quando 2FA está ativado, mesmo com a senha certa, você precisa fornecer um código de 6 dígitos do autenticador. Como você não tem esse código, o login falha.

---

## ✅ SOLUÇÃO DEFINITIVA (30 segundos)

Execute este comando:

```bash
node scripts/fix-existing-users.mjs
```

### O que este script faz?

1. **Desativa 2FA de TODOS os usuários** (principal correção)
2. Reseta as senhas para valores conhecidos
3. Garante que `emailVerified` está ativo
4. Remove `twoFactorSecret` do banco

### Saída Esperada

```
⚠️  AVISO: Este script vai modificar senhas de usuários!

Usuários afetados:
   - admin@teste.com
   - professor@teste.com
   - aluno@teste.com

Continuando em 3 segundos...

🔧 CORRIGINDO USUÁRIOS EXISTENTES

Este script vai:
  ✓ Desativar 2FA de todos os usuários
  ✓ Resetar senhas para valores conhecidos
  ✓ Garantir que emailVerified está ativo

🔓 Desativando 2FA de todos os usuários...
✅ 2FA desativado em 5 usuários

🔑 Resetando senhas dos usuários conhecidos:

✅ admin@teste.com
   Nome: Admin Teste
   Senha: Admin@123456
   Role: ADMIN
   2FA: Desativado

✅ professor@teste.com
   Nome: Maria Professor
   Senha: Professor@123456
   Role: TEACHER
   2FA: Desativado

✅ aluno@teste.com
   Nome: João Aluno
   Senha: Aluno@123456
   Role: STUDENT
   2FA: Desativado

✨ Usuários corrigidos com sucesso!

📋 CREDENCIAIS ATUALIZADAS:

   ADMIN:
   📧 Email: admin@teste.com
   🔑 Senha: Admin@123456
   🔓 2FA: Desativado

   TEACHER:
   📧 Email: professor@teste.com
   🔑 Senha: Professor@123456
   🔓 2FA: Desativado

   STUDENT:
   📧 Email: aluno@teste.com
   🔑 Senha: Aluno@123456
   🔓 2FA: Desativado

🎯 PRÓXIMOS PASSOS:

   1. Abra http://localhost:3000/login
   2. Use as credenciais acima
   3. Você será redirecionado automaticamente

💡 DICA: Se ainda não funcionar, execute:
   node scripts/diagnose-login.mjs
```

---

## 🧪 Testar o Login

1. Abra: `http://localhost:3000/login`

2. Use uma das credenciais acima:

   ```
   Email: admin@teste.com
   Senha: Admin@123456
   ```

3. Clique em **"Fazer Login"**

4. **Você será redirecionado para `/admin`** ✅

---

## 🔍 Por Que Isso Aconteceu?

O código de autenticação em `src/lib/auth.ts` tem esta verificação:

```typescript
// 🔐 VALIDAÇÃO 2FA OBRIGATÓRIA
if (user.twoFactorEnabled && user.twoFactorSecret) {
  const twoFactorCode = credentials.twoFactorCode?.trim();

  if (!twoFactorCode) {
    throw new Error('Código de autenticação de dois fatores necessário');
  }
  // ...
}
```

Se `twoFactorEnabled = true`, o sistema SEMPRE pede o código, mesmo que você digite a senha certa.

---

## 🛠️ Solução Manual (Via SQL)

Se preferir fazer manualmente no Supabase:

```sql
-- 1. Desativar 2FA de todos
UPDATE "User"
SET
  "twoFactorEnabled" = false,
  "twoFactorSecret" = null;

-- 2. Verificar
SELECT email, "twoFactorEnabled", role
FROM "User"
WHERE email IN ('admin@teste.com', 'professor@teste.com', 'aluno@teste.com');
```

**Depois disso**, você precisa resetar as senhas com o script:

```bash
node scripts/reset-user-password.mjs admin@teste.com Admin@123456
node scripts/reset-user-password.mjs professor@teste.com Professor@123456
node scripts/reset-user-password.mjs aluno@teste.com Aluno@123456
```

---

## 📊 Verificação Final

Após executar o script, verifique no Supabase:

```sql
SELECT
  email,
  name,
  role,
  "twoFactorEnabled",
  "emailVerified",
  LENGTH(password) as senha_hash_length
FROM "User"
WHERE email IN ('admin@teste.com', 'professor@teste.com', 'aluno@teste.com');
```

**Resultado esperado:**

```
| email                  | name            | role    | twoFactorEnabled | emailVerified       | senha_hash_length |
|------------------------|-----------------|---------|------------------|---------------------|-------------------|
| admin@teste.com        | Admin Teste     | ADMIN   | false            | 2026-01-05 10:30:00 | 60                |
| professor@teste.com    | Maria Professor | TEACHER | false            | 2026-01-05 10:30:00 | 60                |
| aluno@teste.com        | João Aluno      | STUDENT | false            | 2026-01-05 10:30:00 | 60                |
```

✅ `twoFactorEnabled` deve estar **false**
✅ `senha_hash_length` deve ser **60** (hash bcrypt válido)
✅ `emailVerified` deve ter uma data

---

## 🚨 Se Ainda Não Funcionar

1. **Limpar cache do browser:**

   - Pressione `Ctrl + Shift + Delete`
   - Marque "Cookies" e "Cache"
   - Clique em "Limpar dados"

2. **Reiniciar servidor Next.js:**

   ```bash
   # Parar (Ctrl+C) e depois:
   rm -rf .next
   npm run dev
   ```

3. **Verificar logs no terminal:**

   - Abra DevTools (F12) → Console
   - Tente fazer login
   - Procure por erros em vermelho

4. **Executar diagnóstico completo:**
   ```bash
   node scripts/diagnose-login.mjs
   ```

---

## 📝 Resumo

| Problema                | Causa            | Solução                               |
| ----------------------- | ---------------- | ------------------------------------- |
| Senha não funciona      | 2FA ativado      | `node scripts/fix-existing-users.mjs` |
| Usuário não existe      | Nunca foi criado | `node scripts/create-test-users.mjs`  |
| Erro "invalid password" | Hash incorreto   | `node scripts/fix-existing-users.mjs` |
| Redireciona para login  | Cookie não salva | Limpar cache + reiniciar server       |

---

**Desenvolvido com excelência pela VisionVII — Inovação e Transformação Digital.**
