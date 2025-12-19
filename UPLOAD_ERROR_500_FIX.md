# 🚨 Solução Rápida: Erro 500 no Upload de Imagens

## ❌ Erro Reportado

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
[FileUpload] Erro ao fazer upload: Error: Erro ao fazer upload. Tente novamente.
```

## 🔍 Causa Raiz

O erro 500 ocorre na API route `/api/admin/upload-branding/route.ts` linha 96:

```typescript
const { data, error } = await supabase.storage
  .from('images') // ❌ Bucket não existe ou RLS não configurado
  .upload(`system/${fileName}`, buffer, {
    contentType: file.type,
    upsert: false,
  });

if (error) {
  console.error('[upload-branding] Erro no Supabase:', error);
  return NextResponse.json(
    { error: 'Erro ao fazer upload. Tente novamente.' }, // ← ESTE ERRO
    { status: 500 }
  );
}
```

## ✅ Solução em 3 Passos

### **PASSO 1: Diagnosticar o Problema**

Execute o script de diagnóstico:

```bash
npm run db:diagnose:upload
```

O script irá verificar:

- ✅ Variáveis de ambiente
- ✅ Conexão com Supabase
- ✅ Existência do bucket 'images'
- ✅ RLS policies configuradas
- ✅ Teste de upload real

### **PASSO 2: Criar Bucket 'images' (se não existir)**

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Storage** → **Buckets**
3. Clique em **SQL Editor** (ícone `</>` no topo)
4. Execute este SQL:

```sql
-- Criar bucket 'images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);
```

**OU** crie via interface:

- Storage → "New bucket"
- Nome: `images`
- Public: ✅ Marcar como público

### **PASSO 3: Configurar RLS Policies**

**🎯 MÉTODO 1: Executar arquivo SQL completo (Recomendado)**

1. Abra o arquivo [supabase-images-setup.sql](supabase-images-setup.sql)
2. Copie TODO o conteúdo
3. Cole no **SQL Editor** do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter`

Este arquivo cria o bucket E todas as policies de uma vez!

---

**🎯 MÉTODO 2: Executar policies manualmente**

No **SQL Editor** do Supabase, execute:

```sql
-- Policy 1: SELECT (Leitura pública)
CREATE POLICY IF NOT EXISTS "Public read access on images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy 2: INSERT (Upload por usuários autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- Policy 3: UPDATE (Atualização por usuários autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Policy 4: DELETE (Exclusão por usuários autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

**⚠️ Se der erro de sintaxe, execute as policies UMA DE CADA VEZ:**

```sql
-- Execute primeiro esta:
CREATE POLICY IF NOT EXISTS "Public read access on images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
```

```sql
-- Depois esta:
CREATE POLICY IF NOT EXISTS "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
```

```sql
-- Depois esta:
CREATE POLICY IF NOT EXISTS "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

```sql
-- Por último esta:
CREATE POLICY IF NOT EXISTS "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

## 🧪 Teste o Upload

Após executar os passos acima:

1. **Via Script (Recomendado):**

   ```bash
   npm run db:diagnose:upload
   ```

   ✅ Deve mostrar "Tudo configurado corretamente!"

2. **Via Interface:**
   - Login como ADMIN em `/login`
   - Vá em **Admin → Settings → Branding**
   - Tente fazer upload de um logo (PNG, JPG, SVG, WEBP)
   - ✅ Deve funcionar sem erro 500

## 🔐 Verificar Variáveis de Ambiente

Certifique-se de que `.env.local` tem:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

**Onde encontrar:**

- Supabase Dashboard → Settings → API
- URL: `Project URL`
- Key: `anon` `public` key (não confunda com `service_role`)

## 📊 Erros Comuns e Soluções

### ❌ "Bucket 'images' not found"

**Solução:** Execute PASSO 2 (criar bucket)

### ❌ "new row violates row-level security policy"

**Solução:** Execute PASSO 3 (configurar RLS policies)

### ❌ "Missing Supabase environment variables"

**Solução:** Verifique `.env.local` e reinicie `npm run dev`

### ❌ "Failed to fetch" ou erro de rede

**Solução:**

- Verifique se o projeto Supabase está ativo (não pausado)
- Teste conexão em Storage → Upload manual

## 🎯 Estrutura Final Esperada

Após configuração completa:

```
Supabase Storage
└── images (bucket público)
    └── system/
        ├── logo-1702345678901.png
        ├── favicon-1702345678902.ico
        └── loginBg-1702345678903.jpg
```

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **IMAGE_UPLOAD_DIAGNOSTIC.md** - Diagnóstico completo com troubleshooting
- **SUPABASE_STORAGE_SETUP.md** - Guia de configuração do Storage
- **ADMIN_DASHBOARD_IMPROVEMENTS.md** - Melhorias implementadas

## 🛠️ Scripts Disponíveis

```bash
# Diagnóstico completo de upload
npm run db:diagnose:upload

# Diagnóstico de conexão com banco
npm run db:diagnose

# Abrir Prisma Studio (ver dados)
npm run db:studio

# Dev server
npm run dev
```

## 📞 Próximos Passos

1. ✅ Execute `npm run db:diagnose:upload`
2. ✅ Siga as instruções do script (criar bucket + RLS)
3. ✅ Teste upload em Admin → Settings → Branding
4. ✅ Verifique URL pública da imagem
5. ✅ Confirme que logo/favicon aparecem no sistema

## ⚡ Quick Fix (Copy-Paste)

Se preferir resolver tudo de uma vez, execute este SQL no Supabase:

```sql
-- 1. Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar todas as RLS policies (execute UMA DE CADA VEZ se der erro)
CREATE POLICY IF NOT EXISTS "Public read access on images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

**Se aparecer erro "policy already exists"**: Isso é normal! Significa que a policy já foi criada. Continue para a próxima.

Depois execute:

```bash
npm run db:diagnose:upload
```

---

**Desenvolvido com excelência pela VisionVII**  
🚀 Sistema de diagnóstico automatizado para upload de imagens
