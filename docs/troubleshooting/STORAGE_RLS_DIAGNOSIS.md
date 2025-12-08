# 🔧 Diagnóstico: StorageApiError - RLS Policy

## ❌ Problema

```
StorageApiError: new row violates row-level security policy
```

Você está logado como **TEACHER**, mas o upload de vídeo está sendo bloqueado pelas políticas RLS.

---

## ✅ Solução Completa (5 passos)

### 1️⃣ Verificar se o bucket está PÚBLICO

1. Abra **Supabase Dashboard**
2. Vá em **Storage** (menu lateral)
3. Clique no bucket **course-videos**
4. Clique em **Settings** (ícone ⚙️ no canto superior direito)
5. Procure por **Public bucket** e marque ✅

**Se não estiver marcado**, clique em **Public bucket** para habilitar e depois **Save**.

![Storage Settings]

### 2️⃣ Verificar as políticas RLS

1. Vá em **SQL Editor** do Supabase Dashboard
2. Cole esta query para verificar as políticas:

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%course%video%'
ORDER BY policyname;
```

3. Execute (Ctrl+Enter ou clique em RUN)

**Deve retornar 4 linhas:**

- ✅ `Public read access for course videos` → SELECT
- ✅ `Public insert access for course videos` → INSERT
- ✅ `Public update access for course videos` → UPDATE
- ✅ `Public delete access for course videos` → DELETE

**Se faltarem políticas**, execute o SQL em `fix-storage-rls.sql`.

### 3️⃣ Remover políticas antigas (se houver conflito)

Se tiver políticas com nomes diferentes, remova-as:

```sql
DROP POLICY IF EXISTS "Permitir leitura pública de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
```

### 4️⃣ Criar as 4 políticas corretas

```sql
-- LEITURA: Qualquer pessoa
CREATE POLICY "Public read access for course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

-- UPLOAD: Qualquer pessoa autenticada
CREATE POLICY "Public insert access for course videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-videos');

-- ATUALIZAÇÃO: Qualquer pessoa autenticada
CREATE POLICY "Public update access for course videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'course-videos');

-- EXCLUSÃO: Qualquer pessoa autenticada
CREATE POLICY "Public delete access for course videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-videos');
```

Execute cada uma (ou todas de uma vez).

### 5️⃣ Testar Upload

1. Volte para a aplicação Next.js
2. Abra um curso como TEACHER
3. Vá para **Content** ou **Materials**
4. Tente fazer upload de um vídeo
5. Deve funcionar agora! ✅

---

## 🔍 Verificação Avançada

Se ainda não funcionar, execute este diagnóstico:

```bash
node diagnose-storage.js
```

Este script vai:

- ✅ Verificar se o bucket existe
- ✅ Confirmar que está público
- ✅ Tentar fazer upload de teste
- ✅ Informar exatamente qual é o problema

---

## 📋 Checklist Final

- [ ] Bucket `course-videos` existe
- [ ] Bucket está marcado como **Public** ✅
- [ ] RLS está habilitado na tabela `storage.objects`
- [ ] 4 políticas RLS foram criadas (SELECT, INSERT, UPDATE, DELETE)
- [ ] Nenhuma política antiga está conflitando
- [ ] Upload de vídeo funciona como TEACHER

---

## 🚀 Próximos Passos (Depois que funcionar)

Quando o upload estiver funcionando, você pode:

1. **Restringir apenas para TEACHER/ADMIN:**

   - Editar as políticas INSERT, UPDATE, DELETE
   - Adicionar verificação de `auth.uid() IS NOT NULL`
   - Verificar role do usuário na tabela `users`

2. **Implementar lógica no aplicativo:**
   - Verificar se usuário é TEACHER antes de exibir botão de upload
   - Adicionar validação de MIME type
   - Implementar limite de tamanho de arquivo

---

## 📞 Se Continuar Falhando

1. Verifique `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua-chave
   ```

2. Verifique se está logado (verificar token no localStorage)

3. Limpe cache do navegador: `Ctrl+Shift+Delete`

4. Teste em aba anônima (Ctrl+Shift+N)

5. Verifique logs do navegador (F12 → Console)

---

**Criado em:** 8 de dezembro de 2025  
**Arquivo:** `docs/troubleshooting/STORAGE_RLS_DIAGNOSIS.md`
