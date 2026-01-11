# 🚀 SOLUÇÃO RÁPIDA: Login Não Funciona

## ⚡ Solução em 2 Minutos

```bash
# 1. Crie usuários de teste:
node scripts/create-test-users.mjs

# 2. Você verá na tela:
# ✅ aluno@teste.com / Aluno@123456
# ✅ professor@teste.com / Professor@123456
# ✅ admin@teste.com / Admin@123456

# 3. Vá para http://localhost:3000/login
# 4. Use uma das credenciais acima
```

---

## 🔧 Se Ainda Não Funcionar...

### Passo 1: Diagnóstico Completo

```bash
node scripts/diagnose-login.mjs
```

Isto mostrará o status de tudo (banco, usuários, variáveis)

### Passo 2: Resetar Senha de Um Usuário

```bash
node scripts/reset-user-password.mjs seu@email.com NovaSenha@123
```

### Passo 3: Limpar Cache

```bash
# Deletar cache do Next.js:
rm -rf .next

# Reiniciar servidor:
npm run dev

# Deletar cookies no navegador (F12 → Application → Cookies)
```

---

## 🎯 Problemas Mais Comuns

### Problema: "Usuário não encontrado"

→ Nenhum usuário existe. **Solução:** `node scripts/create-test-users.mjs`

### Problema: "Credenciais inválidas"

→ Senha errada. **Solução:** `node scripts/reset-user-password.mjs seu@email.com NovaSenha@123`

### Problema: "Não redireciona / fica carregando"

→ Cookie/Session problema. **Solução:**

```bash
# 1. Limpar cookies (F12)
# 2. Verificar NEXTAUTH_SECRET em .env.local
# 3. Reinstalar dependências:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problema: "Email não verificado"

→ emailVerified é NULL. **Solução:**

```bash
# No Supabase SQL Editor:
UPDATE "User" SET "emailVerified" = NOW();
```

---

## 📋 Arquivos Criados para Ajudar

| Arquivo                           | Função                 |
| --------------------------------- | ---------------------- |
| `scripts/diagnose-login.mjs`      | Diagnostica problemas  |
| `scripts/create-test-users.mjs`   | Cria usuários de teste |
| `scripts/reset-user-password.mjs` | Reseta senha           |
| `LOGIN_TROUBLESHOOTING_PT-BR.md`  | Guia completo          |

---

## ✅ Checklist Final

- [ ] Executei `node scripts/create-test-users.mjs`
- [ ] Recebi 3 credenciais de teste na tela
- [ ] Fiz login com uma delas em http://localhost:3000/login
- [ ] Fui redirecionado ao dashboard
- [ ] Tudo funcionando! ✨

---

**Se ainda tiver problemas, veja `LOGIN_TROUBLESHOOTING_PT-BR.md` para diagnóstico avançado.**
