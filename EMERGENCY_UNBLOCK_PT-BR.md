# 🚨 PÁGINA TRAVADA? SIGA ESTES PASSOS PARA DESBLOQUEAR

Se você está vendo a página congelada e não consegue scroll ou clique, faça isso **AGORA**:

## ⚡ Solução Rápida (30 segundos)

### 1️⃣ Abra o DevTools

- **Windows/Linux:** Pressione `F12` ou `Ctrl + Shift + I`
- **Mac:** Pressione `Cmd + Option + I`

### 2️⃣ Vá para a aba **Console**

- Clique em `Console` no topo do DevTools

### 3️⃣ Cole este código:

```javascript
// Limpar localStorage/sessionStorage
localStorage.clear();
sessionStorage.clear();

// Fechar qualquer Modal/Sheet aberto
document.querySelectorAll('[data-state="open"]').forEach((el) => {
  el.style.display = 'none';
});

// Permitir scroll da página
document.body.style.overflow = 'auto';
document.body.style.pointerEvents = 'auto';

// Remover overlay bloqueador
document.querySelectorAll('.fixed.inset-0, [class*="z-50"]').forEach((el) => {
  if (el.offsetHeight > window.innerHeight) {
    el.style.display = 'none';
  }
});

// Recarregar
console.log('✅ Página desbloqueada! Recarregando...');
location.reload();
```

### 4️⃣ Pressione `Enter`

---

## ✅ Se ainda não funcionar:

### Opção A: Reset Admin User

```
GET http://localhost:3000/api/debug/check-admin
```

Se retornar 404, execute:

```
POST http://localhost:3000/api/debug/reset-admin
```

### Opção B: Reset Completo

1. Abra DevTools → Abaabas → **Storage**
2. Clique em **Cookies** → localhost:3000
3. Delete TODOS os cookies
4. Recarregue a página (Ctrl+Shift+R)

### Opção C: Usar Incógnito

- Abra uma janela **Incógnito/Privada** (Ctrl+Shift+N)
- Acesse `http://localhost:3000`
- Tente fazer login novamente

---

## 🔧 Se nada funcionar:

Execute no terminal:

```bash
# 1. Parar servidor
Ctrl+C

# 2. Limpar cache Next.js
rm -rf .next
npm run dev

# 3. Ou resetar banco de dados (⚠️ apaga tudo)
npx prisma db push --skip-generate
npx prisma db seed
```

---

## ✨ Agora está tudo funcionando?

Teste com as credenciais:

- **Email:** admin@smeducacional.com
- **Senha:** admin123

**Clique em "Quick Login (Admin)"** na página de login para auto-preenchimento.

---

**Se os problemas persistirem, abra DevTools (F12) → Console e copie a mensagem de erro que aparece. Envie para análise.**

Versão: Correção Fase 3.1 | 2 Jan 2025
