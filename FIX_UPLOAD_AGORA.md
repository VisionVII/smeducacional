# 🚨 CORREÇÃO FINAL DO UPLOAD - PASSO A PASSO

## ❌ Problema Atual

**Erro no console:**

```
Erro ao fazer upload. Tente novamente.
at handleUpload (file://C:/Users/hvvct/Desktop/SM Educa/.next/static/chunks/src_ed93fda4._.js:886:19)
```

**Causa raiz:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` com formato JWT inválido  
**Erro no servidor:** `JWS Protected Header is invalid`

---

## ✅ SOLUÇÃO (5 minutos)

### PASSO 1: Pegar a Chave Correta

1. **Abra o Supabase Dashboard:**

   ```
   https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/settings/api
   ```

2. **Localize "Project API keys"** (no meio da página)

3. **Encontre o card "anon" "public":**

   ```
   ┌─────────────────────────────────────────┐
   │ anon                            public  │
   │ This key is safe to use in a browser.  │
   │                                         │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC... │
   │                            [📋 Copy]   │
   └─────────────────────────────────────────┘
   ```

4. **Clique em "Copy"** ao lado da chave (NÃO copie a service_role!)

5. **Confirme que copiou:** A chave deve começar com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`

---

### PASSO 2: Atualizar o .env.local

1. **Abra o arquivo:**

   ```bash
   code .env.local
   ```

2. **Encontre a linha:**

   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   ```

3. **Substitua TODA a chave** pela que você copiou:

   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGdzdmFsZnd4eG94Y2Z4bWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc0NjQwMDAsImV4cCI6MjAwMzA0MDAwMH0..."
   ```

4. **Salve o arquivo:** `Ctrl+S`

---

### PASSO 3: Reiniciar o Servidor

1. **Pare o servidor atual:**

   - Pressione `Ctrl+C` no terminal onde está rodando `npm run dev`

2. **Aguarde 2 segundos** (para garantir que parou completamente)

3. **Inicie novamente:**

   ```bash
   npm run dev
   ```

4. **Aguarde a mensagem:** `✓ Ready in XXXms`

---

### PASSO 4: Testar o Upload

1. **Recarregue a página no browser:** `Ctrl+Shift+R` (hard reload)

2. **Navegue até:**

   ```
   Admin → Settings → Branding
   ```

3. **Teste cada upload:**

   - ✅ Logo (PNG/JPG/SVG/WEBP, max 5MB)
   - ✅ Favicon (ICO/PNG/SVG, max 1MB)
   - ✅ Background de Login (PNG/JPG/WEBP, max 10MB)

4. **Verifique:**
   - Preview da imagem deve aparecer
   - URL deve ser gerada
   - Console não deve mostrar erros

---

## 🔍 Validação

Execute para confirmar que está tudo OK:

```bash
node scripts/test-upload-direct.js
```

**Resultado esperado:**

```
✅ Conexão com Supabase Storage OK
✅ UPLOAD COM SUCESSO! 🎉
🎯 URL do arquivo: https://okxgsvalfwxxoxcfxmhc.supabase.co/storage/v1/object/public/images/test-...
✅✅✅ TUDO FUNCIONANDO!
```

---

## ⚠️ Observações Importantes

### Formato da Chave

✅ **CORRETO:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9r...
```

- 3 partes separadas por pontos (.)
- Começa com `eyJ`
- Tamanho: ~250-400 caracteres

❌ **INCORRETO:**

```
sua-chave-anon-aqui
sk_test_xxxxx
Bearer xxxxx
```

### Não Copie a service_role!

A `service_role` key tem poderes de admin e NUNCA deve ser usada no frontend.  
Use apenas a chave **anon** **public**.

### Cache do Browser

Se mesmo após reiniciar ainda der erro:

1. Limpe o cache: `Ctrl+Shift+Del`
2. Recarregue: `Ctrl+Shift+R`
3. Ou use aba anônima

---

## 📊 Progresso Atual

| Item                     | Status                      |
| ------------------------ | --------------------------- |
| Bucket 'images' criado   | ✅                          |
| RLS Policies corretas    | ✅                          |
| Teste direto funcionando | ✅ (Exit Code: 0)           |
| Environment variables    | ⏳ Aguardando chave correta |
| Upload no browser        | ⏳ Aguardando correção      |

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique os logs do servidor:**

   ```
   Procure por: "Erro no Supabase" ou "StorageApiError"
   ```

2. **Teste a chave manualmente:**

   ```bash
   node scripts/fix-anon-key.js
   ```

3. **Verifique se as variáveis estão carregadas:**

   ```bash
   npm run db:diagnose:upload
   ```

4. **Reinicie TUDO:**
   ```bash
   # Feche VS Code completamente
   # Reabra e execute
   npm run dev
   ```

---

## 📝 Checklist Final

- [ ] Copiei a chave anon do Supabase Dashboard
- [ ] Atualizei o .env.local
- [ ] Salvei o arquivo (Ctrl+S)
- [ ] Parei o servidor (Ctrl+C)
- [ ] Reiniciei o servidor (npm run dev)
- [ ] Aguardei o "Ready"
- [ ] Recarreguei o browser (Ctrl+Shift+R)
- [ ] Testei o upload
- [ ] Funcionou! 🎉

---

**Tempo estimado:** 5 minutos  
**Dificuldade:** Baixa  
**Resultado:** Upload funcionando 100%
