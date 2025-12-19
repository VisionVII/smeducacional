# 🖼️ Diagnóstico e Solução: Upload de Imagens no Sistema

**Data**: 17 de Dezembro de 2025  
**Sistema**: VisionVII Educational Platform  
**Problema Reportado**: "Não consigo salvar as imagens no sistema"

---

## 🔍 Problema Identificado

O sistema está configurado para fazer upload de imagens (logos, favicons, backgrounds) para o **Supabase Storage**, mas o processo pode falhar por 3 motivos principais:

### 1. **Bucket 'images' não existe**

- O código espera um bucket chamado `images`
- Arquivo: `/api/admin/upload-branding/route.ts` (linha 92)
- Código: `supabase.storage.from('images')`

### 2. **RLS (Row Level Security) Policies não configuradas**

- Mesmo que o bucket exista, pode não ter permissões corretas
- Upload requer policy que permita INSERT
- Leitura pública requer policy que permita SELECT

### 3. **Variáveis de ambiente ausentes**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ Solução: Passo a Passo

### **Passo 1: Criar Bucket 'images' no Supabase**

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral
4. Clique em **"New bucket"**
5. Configure:
   ```
   Name: images
   Public: ✅ Yes (para URLs públicas)
   File size limit: 50MB
   Allowed MIME types: image/*
   ```
6. Clique em **"Create bucket"**

### **Passo 2: Configurar RLS Policies**

No **SQL Editor** do Supabase, execute este script:

```sql
-- =====================================================
-- RLS POLICIES PARA BUCKET 'IMAGES'
-- Permite upload de admins e leitura pública
-- =====================================================

-- 1. Habilitar RLS no bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Permitir leitura pública de imagens
CREATE POLICY "Public Access to Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 3. Policy: Permitir upload de imagens (authenticated users)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- 4. Policy: Permitir update de imagens (authenticated users)
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 5. Policy: Permitir delete de imagens (authenticated users)
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- =====================================================
-- VERIFICAR SE AS POLICIES FORAM CRIADAS
-- =====================================================
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### **Passo 3: Verificar Variáveis de Ambiente**

No arquivo `.env.local` (ou nas configurações do Vercel), confirme:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Como obter as chaves:**

1. Supabase Dashboard > **Settings** > **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Passo 4: Testar Upload**

1. Reinicie o servidor dev:

   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:3001/admin/settings`

3. Vá na aba **"Marca"**

4. Tente fazer upload de uma logo

5. **Resultado esperado**:
   - Loading state aparece
   - Toast de sucesso: "Upload realizado"
   - Preview da imagem aparece
   - URL pública gerada

---

## 🧪 Testes de Diagnóstico

### **Teste 1: Verificar se o bucket existe**

Execute no SQL Editor do Supabase:

```sql
SELECT * FROM storage.buckets WHERE name = 'images';
```

**Esperado**: Retornar 1 linha com o bucket 'images'

### **Teste 2: Verificar policies do bucket**

```sql
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND (qual::text LIKE '%images%' OR with_check::text LIKE '%images%');
```

**Esperado**: Retornar 4 policies (SELECT, INSERT, UPDATE, DELETE)

### **Teste 3: Testar upload via Console do Navegador**

No DevTools (F12) > Console, execute:

```javascript
// Teste de conectividade Supabase
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Teste de upload de arquivo
const testFile = new File(['test'], 'test.png', { type: 'image/png' });
const formData = new FormData();
formData.append('file', testFile);
formData.append('type', 'logo');

fetch('/api/admin/upload-branding', {
  method: 'POST',
  body: formData,
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

**Esperado**: JSON com `{ success: true, data: { url: '...' } }`

---

## 🐛 Erros Comuns e Soluções

### **Erro: "Erro ao fazer upload. Tente novamente."**

**Causa**: Bucket não existe ou RLS bloqueou

**Solução**:

1. Verifique se o bucket 'images' foi criado
2. Execute as policies RLS (Passo 2)
3. Verifique logs do Supabase Dashboard > **Logs** > **Storage**

### **Erro: "new row violates row-level security policy"**

**Causa**: Usuário não está autenticado ou policy está incorreta

**Solução**:

```sql
-- Adicionar policy mais permissiva (desenvolvimento):
CREATE POLICY "Allow all uploads for development"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');
```

⚠️ **ATENÇÃO**: Use esta policy apenas em desenvolvimento!

### **Erro: "Missing Supabase environment variables"**

**Causa**: Variáveis de ambiente não configuradas

**Solução**:

1. Copie `.env.example` para `.env.local`
2. Preencha as variáveis (Passo 3)
3. Reinicie o servidor: `npm run dev`

### **Erro: "File size exceeds limit"**

**Causa**: Arquivo maior que o limite do bucket

**Solução**:

- Logo: Máximo 5MB (configurado no código)
- Favicon: Máximo 1MB
- Login Background: Máximo 10MB
- Otimize as imagens antes de fazer upload (use TinyPNG ou similar)

---

## 📊 Estrutura de Armazenamento

```
Supabase Storage
└── images (bucket)
    └── system/
        ├── logo-1734393600000.png        # Logo principal
        ├── favicon-1734393620000.ico     # Favicon
        └── loginBg-1734393650000.jpg     # Background de login
```

### **Padrão de nomeação:**

```typescript
const timestamp = Date.now();
const extension = file.name.split('.').pop();
const fileName = `${type}-${timestamp}.${extension}`;
// Exemplo: logo-1734393600000.png
```

### **URL pública gerada:**

```
https://seu-projeto.supabase.co/storage/v1/object/public/images/system/logo-1734393600000.png
```

---

## 🔐 Segurança

### **Upload restrito a ADMINs**

A API valida a role do usuário:

```typescript
const session = await auth();
if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json(
    { error: 'Não autorizado. Apenas administradores podem fazer upload.' },
    { status: 401 }
  );
}
```

### **Validações de arquivo:**

1. **Tipo de arquivo**:

   - Logo: `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`
   - Favicon: `image/x-icon`, `image/png`, `image/svg+xml`
   - Login BG: `image/png`, `image/jpeg`, `image/webp`

2. **Tamanho máximo**:

   - Logo: 5MB
   - Favicon: 1MB
   - Login Background: 10MB

3. **Pasta isolada**:
   - Todos os uploads vão para `system/` dentro do bucket
   - Evita conflitos com outros tipos de mídia

---

## 🚀 Melhorias Futuras

### **1. Compressão automática de imagens**

```typescript
import sharp from 'sharp';

// Comprimir imagem antes do upload
const compressedBuffer = await sharp(buffer)
  .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85 })
  .toBuffer();
```

### **2. Deletar imagem anterior ao fazer novo upload**

```typescript
// Extrair nome do arquivo da URL antiga
if (oldUrl) {
  const oldPath = new URL(oldUrl).pathname.split('/').slice(-1)[0];
  await supabase.storage.from('images').remove([`system/${oldPath}`]);
}
```

### **3. Validação de dimensões de imagem**

```typescript
const image = await sharp(buffer).metadata();
if (image.width < 200 || image.height < 200) {
  return { error: 'Imagem muito pequena. Mínimo: 200x200px' };
}
```

### **4. CDN para otimização**

Configurar Cloudflare ou Vercel Image Optimization na frente das URLs do Supabase.

---

## 📝 Checklist de Verificação

- [ ] Bucket 'images' criado no Supabase
- [ ] Bucket configurado como **público**
- [ ] RLS policies criadas (4 policies)
- [ ] Variáveis de ambiente configuradas
- [ ] Servidor dev reiniciado
- [ ] Teste de upload realizado com sucesso
- [ ] Preview da imagem aparece após upload
- [ ] URL pública gerada e acessível
- [ ] Toast de sucesso exibido

---

## 🛠️ Comandos Úteis

### **Verificar status do Supabase Storage**

```bash
# Listar todos os buckets
npx supabase storage list

# Listar arquivos do bucket 'images'
npx supabase storage list images
```

### **Testar API localmente**

```bash
# Upload de teste
curl -X POST http://localhost:3001/api/admin/upload-branding \
  -H "Cookie: next-auth.session-token=SEU-TOKEN" \
  -F "file=@/path/to/image.png" \
  -F "type=logo"
```

---

## 📚 Referências

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [RLS Policies for Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

---

## 💡 Resumo Executivo

**Problema**: Upload de imagens falha na página de configurações

**Causa Raiz**: Bucket 'images' não existe ou RLS policies não configuradas

**Solução**:

1. Criar bucket 'images' (público)
2. Executar SQL com 4 RLS policies
3. Verificar variáveis de ambiente
4. Testar upload

**Tempo Estimado**: 10-15 minutos

**Impacto**: ✅ Alta - Sistema de branding totalmente funcional após correção

---

**Desenvolvido com excelência pela VisionVII** — Soluções educacionais que transformam.
