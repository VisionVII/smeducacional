# 🚨 FIX URGENTE: Storage RLS Error

## ❌ **Erro**

```
StorageApiError: new row violates row-level security policy
```

## 🎯 **Causa**

O bucket `course-videos` do Supabase **não tem políticas RLS configuradas** ou estão bloqueando uploads.

## ✅ **Solução Rápida (3 minutos)**

### 1️⃣ Abrir Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **SM Educacional**
3. Vá em **SQL Editor** (menu lateral)

### 2️⃣ Executar SQL

1. Clique em **New Query**
2. Cole o conteúdo do arquivo `fix-storage-rls.sql`
3. Clique em **RUN** (ou Ctrl+Enter)

**Ou copie este SQL diretamente:**

```sql
-- REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Teachers can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;

-- CRIAR POLÍTICAS PÚBLICAS (DESENVOLVIMENTO)
CREATE POLICY "Public read access for course videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-videos');

CREATE POLICY "Public insert access for course videos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Public update access for course videos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'course-videos');

CREATE POLICY "Public delete access for course videos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'course-videos');
```

### 3️⃣ Verificar Bucket

1. Vá em **Storage** (menu lateral)
2. Clique no bucket **course-videos**
3. Verifique se está marcado como **Public** ✅

Se não estiver:

1. Clique nos 3 pontinhos do bucket
2. **Edit bucket**
3. Marque **Public bucket** ✅
4. **Save**

### 4️⃣ Testar Upload

1. Volte para o projeto Next.js
2. Tente fazer upload de vídeo novamente
3. Deve funcionar! ✅

## 🔍 **Verificação**

Execute no SQL Editor:

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%course%video%';
```

**Deve retornar 4 políticas:**

- `Public read access for course videos` (SELECT)
- `Public insert access for course videos` (INSERT)
- `Public update access for course videos` (UPDATE)
- `Public delete access for course videos` (DELETE)

## ⚠️ **Observações**

### Para Desenvolvimento

✅ As políticas públicas permitem qualquer um fazer upload (OK para dev/teste)

### Para Produção

⚠️ **IMPORTANTE**: Troque para políticas restritas (veja `fix-storage-rls.sql` seção de produção)

Políticas de produção apenas permitem:

- **Leitura**: Qualquer um (público)
- **Upload/Update/Delete**: Apenas usuários `TEACHER` e `ADMIN` autenticados

## 🐛 **Troubleshooting**

### Erro persiste?

1. **Verificar bucket existe**:

   ```sql
   SELECT name FROM storage.buckets WHERE name = 'course-videos';
   ```

   Se vazio, criar bucket no dashboard: Storage → New bucket → Nome: `course-videos` → Public ✅

2. **Verificar RLS habilitado**:

   ```sql
   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
   ```

3. **Limpar cache do navegador**:

   - Ctrl+Shift+Delete → Limpar cache
   - Ou testar em aba anônima

4. **Verificar variáveis de ambiente** (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua-chave
   ```

### Erro "bucket does not exist"?

Criar bucket:

1. Storage → New bucket
2. Nome: `course-videos`
3. Public: ✅ Sim
4. File size limit: `500MB`
5. Allowed MIME types: `video/*`
6. Create bucket

## 📚 **Arquivos Relacionados**

- `fix-storage-rls.sql` - SQL com políticas corrigidas
- `SUPABASE_STORAGE_VIDEO_SETUP.md` - Guia completo de setup
- `src/components/video-upload-enhanced.tsx` - Componente de upload

## 🔗 **Links Úteis**

- [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status após fix:** ✅ Upload deve funcionar  
**Tempo estimado:** ⏱️ 3 minutos  
**Dificuldade:** 🟢 Fácil (copiar e colar SQL)
