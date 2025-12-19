# 🔑 AÇÃO URGENTE: Corrigir Chave Anon do Supabase

## ❌ Problema Atual

```
❌ Erro ao conectar com Supabase: signature verification failed
```

**Causa:** A chave `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local` está **incorreta**.

## ✅ Solução em 2 Passos

### **PASSO 1: Obter a Chave Correta**

1. **Clique aqui para abrir diretamente:**
   👉 https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/settings/api

2. **Procure pela seção "Project API keys"**

3. **Copie APENAS a chave `anon` `public`:**

   ```
   ┌─────────────────────────────────────────────┐
   │ anon                                        │
   │ public                                      │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   │ ← Copie ESTA
   │                               [Copy] 📋    │
   └─────────────────────────────────────────────┘
   ```

   **❌ NÃO COPIE ESTA:**

   ```
   ┌─────────────────────────────────────────────┐
   │ service_role                                │
   │ secret                                      │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   │ ← NÃO ESTA
   └─────────────────────────────────────────────┘
   ```

### **PASSO 2: Atualizar .env.local**

**Opção A: Via PowerShell (Rápido)**

No terminal, cole este comando (substitua `SUA_CHAVE_AQUI` pela chave que você copiou):

```powershell
(Get-Content .env.local) -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=".*"', 'NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_CHAVE_AQUI"' | Set-Content .env.local
```

**Opção B: Editar Manualmente**

1. Abra `.env.local`:

   ```powershell
   code .env.local
   ```

2. Encontre a linha:

   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
   ```

3. Substitua o valor pela chave que você copiou do dashboard:

   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS..."
   ```

4. **Salve** (Ctrl+S)

### **PASSO 3: Reiniciar Servidor e Testar**

```bash
# No terminal onde o Next.js está rodando, pressione Ctrl+C
# Depois reinicie:
npm run dev

# Em outro terminal, teste:
npm run db:diagnose:upload
```

**Resultado esperado:**

```
✅ NEXT_PUBLIC_SUPABASE_URL encontrada
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY encontrada
✅ Conexão com Supabase estabelecida
```

## 🎯 Quick Reference

**Suas credenciais Supabase:**

- **Project ID:** `okxgsvalfwxxoxcfxmhc`
- **URL:** `https://okxgsvalfwxxoxcfxmhc.supabase.co`
- **Dashboard API:** https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/settings/api

## 📋 Checklist

- [ ] Acessei o link do Supabase Dashboard
- [ ] Copiei a chave **anon public** (não service_role)
- [ ] Atualizei `.env.local` com a chave correta
- [ ] Salvei o arquivo
- [ ] Reiniciei o servidor Next.js (`npm run dev`)
- [ ] Executei `npm run db:diagnose:upload`
- [ ] Vi ✅ para "Conexão com Supabase estabelecida"

## 🚨 Próximo Erro Possível

Após corrigir a chave, você pode ver:

```
❌ Bucket "images" NÃO ENCONTRADO
```

**Solução:** Execute o arquivo [supabase-images-setup.sql](supabase-images-setup.sql) no SQL Editor do Supabase.

---

**🔥 AÇÃO IMEDIATA:**

1. Acesse o link: https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/settings/api
2. Copie a chave `anon public`
3. Atualize `.env.local`
4. Reinicie o servidor
