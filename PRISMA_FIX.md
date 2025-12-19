# 🚨 ERRO PRISMA: Arquivo Bloqueado

## Problema

```
EPERM: operation not permitted, rename
'query_engine-windows.dll.node.tmp' -> 'query_engine-windows.dll.node'
```

**Causa**: O dev server Next.js está usando o Prisma Client e bloqueando o arquivo `.dll.node`.

## ✅ Solução Passo a Passo

### 1️⃣ PARAR O DEV SERVER

No terminal onde está rodando `npm run dev`, pressione:

```
Ctrl + C
```

Aguarde até aparecer a confirmação de que o servidor parou.

### 2️⃣ REGENERAR PRISMA CLIENT

No PowerShell, execute:

```powershell
npx prisma generate
```

**Resultado esperado**:

```
✔ Generated Prisma Client (v5.x.x) to .\node_modules\@prisma\client
```

### 3️⃣ CRIAR TABELA NO BANCO

```powershell
npx prisma db push --accept-data-loss
```

**Resultado esperado**:

```
🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

### 4️⃣ REINICIAR DEV SERVER

```powershell
npm run dev
```

### 5️⃣ VERIFICAR SE FUNCIONOU

Abra nova janela PowerShell e execute:

```powershell
node test-admin-theme.js
```

**Deve mostrar**:

```
✅ Modelo AdminTheme está disponível no Prisma Client!
📋 Tabela admin_themes existe
```

## 🎯 Depois de Funcionar

1. Navegue para: `http://localhost:3000/admin/theme`
2. Abra DevTools (F12) → Console
3. Clique em um tema (Ocean, Sunset, etc.)
4. Copie TODOS os logs `[AdminTheme]` e cole aqui

---

**IMPORTANTE**: O dev server DEVE estar parado para regenerar o Prisma Client no Windows!
