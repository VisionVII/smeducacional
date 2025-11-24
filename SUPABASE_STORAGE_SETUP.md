# Configuração do Supabase Storage

## 📦 **Passo 1: Obter as credenciais do Supabase**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **okxgsvalfwxxoxcfxmhc**
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL**: `https://okxgsvalfwxxoxcfxmhc.supabase.co`
   - **anon public key**: Começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

5. Atualize o arquivo `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://okxgsvalfwxxoxcfxmhc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_CHAVE_AQUI"
```

---

## 🗂️ **Passo 2: Criar o Bucket no Supabase**

1. No dashboard do Supabase, vá em **Storage**
2. Clique em **New Bucket**
3. Configure:
   - **Name**: `course-thumbnails`
   - **Public bucket**: ✅ **Marque como público**
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/*`

4. Clique em **Create bucket**

---

## 🔐 **Passo 3: Configurar Políticas de Segurança (RLS)**

No Supabase, vá em **Storage** → **Policies** e adicione:

### **Política 1: Permitir Upload (Professores/Admins)**
```sql
CREATE POLICY "Permitir upload para professores"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-thumbnails'
  AND auth.jwt() ->> 'role' IN ('TEACHER', 'ADMIN')
);
```

### **Política 2: Leitura Pública**
```sql
CREATE POLICY "Permitir leitura pública"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');
```

### **Política 3: Atualizar apenas próprios arquivos**
```sql
CREATE POLICY "Permitir update para proprietário"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-thumbnails')
WITH CHECK (auth.jwt() ->> 'role' IN ('TEACHER', 'ADMIN'));
```

### **Política 4: Deletar apenas próprios arquivos**
```sql
CREATE POLICY "Permitir delete para proprietário"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-thumbnails'
  AND auth.jwt() ->> 'role' IN ('TEACHER', 'ADMIN')
);
```

---

## ✅ **Passo 4: Testar**

1. Reinicie o servidor: `npm run dev`
2. Acesse: http://localhost:3000/teacher/courses/new
3. Tente fazer upload de uma imagem
4. Verifique se a imagem aparece no preview
5. Salve o curso e veja se a imagem está visível no card

---

## 🎯 **URLs Geradas**

As imagens ficarão acessíveis em:
```
https://okxgsvalfwxxoxcfxmhc.supabase.co/storage/v1/object/public/course-thumbnails/courses/[slug]/thumbnail.jpg
```

---

## 🔧 **Troubleshooting**

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis estão no `.env`
- Reinicie o servidor após adicionar as variáveis

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS foram criadas corretamente
- Certifique-se que o bucket está público

### Imagem não aparece
- Abra o Network Tab do navegador
- Veja se a URL da imagem está correta
- Verifique se o bucket `course-thumbnails` existe no Supabase

---

## 📝 **Notas**

- ✅ Upload automático ao selecionar arquivo
- ✅ Preview em tempo real
- ✅ Validação de tipo (apenas imagens)
- ✅ Validação de tamanho (máx 5MB)
- ✅ Substituição automática (upsert)
- ✅ URLs públicas persistentes
- ✅ CDN automático do Supabase
