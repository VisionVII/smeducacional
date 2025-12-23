## ✅ Guia Completo: Upload de Imagens para Páginas Públicas

### 📋 O que foi Feito

1. **Componente ImageUpload** (`src/components/ui/ImageUpload.tsx`)

   - Upload drag-and-drop de imagens
   - Validação de tamanho (máx 5-10MB)
   - Preview em tempo real
   - Remover imagem com botão X
   - Loader durante upload

2. **API de Upload** (`src/app/api/upload/route.ts`)

   - Recebe FormData com arquivo
   - Faz upload para Supabase Storage
   - Retorna URL pública da imagem
   - Autenticação obrigatória (ADMIN)

3. **Dashboard Atualizado** (`src/components/admin/PublicPagesDashboard.tsx`)

   - Substituiu campos de URL por `ImageUpload` component
   - Suporta drag-and-drop
   - Preview das imagens no formulário
   - Salva URLs no banco de dados automaticamente

4. **API de Páginas Atualizada**
   - Removeu validação obrigatória de URL
   - Aceita strings vazias para bannerUrl e iconUrl
   - Permite upload via POST /api/upload

### 🚀 Passo 1: Criar Bucket no Supabase

**Opção A: Via Dashboard Supabase (Recomendado)**

1. Acesse [console.supabase.io](https://console.supabase.io)
2. Selecione seu projeto
3. Vá em **Storage** → **Buckets** → **New bucket**
4. Nome: `public-pages`
5. Deixar como **Public** ✅
6. Clique em **Create**

**Opção B: Via SQL (copiar e colar no SQL Editor)**

```sql
-- Criar bucket 'public-pages' para armazenar imagens de páginas públicas
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-pages', 'public-pages', true)
ON CONFLICT (id) DO NOTHING;
```

### 🔐 Passo 2: Configurar Políticas RLS (Row Level Security)

No dashboard Supabase → **Storage** → **Policies** → Selecionar bucket `public-pages`:

**Policy 1: SELECT (Leitura Pública)**

```sql
CREATE POLICY "Public page images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-pages');
```

**Policy 2: INSERT (Upload Autenticado)**

```sql
CREATE POLICY "Authenticated users can upload public page images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public-pages' AND auth.role() = 'authenticated');
```

**Policy 3: UPDATE (Atualização Autenticada)**

```sql
CREATE POLICY "Authenticated users can update public page images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public-pages' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'public-pages' AND auth.role() = 'authenticated');
```

**Policy 4: DELETE (Deleção Autenticada)**

```sql
CREATE POLICY "Authenticated users can delete public page images"
ON storage.objects FOR DELETE
USING (bucket_id = 'public-pages' AND auth.role() = 'authenticated');
```

**Arquivo pronto:**

```bash
# Abrir arquivo e copiar conteúdo para SQL Editor do Supabase
cat setup-public-pages-bucket.sql
```

### ✨ Passo 3: Testar o Upload

1. Acesse http://localhost:3000/admin/public-pages
2. Clique em **Nova Página**
3. Preencha:
   - **Slug**: `teste`
   - **Título**: `Página de Teste`
4. Na seção **Mídia**:
   - Clique em **Banner** → selecione ou arraste uma imagem
   - Aguarde upload completar (verá preview)
   - Repita para **Ícone**
5. Clique em **Salvar**

✅ Se você vir a imagem no preview, está funcionando!

### 🐛 Troubleshooting

#### Erro: "Bucket 'public-pages' not found"

- Verifique se o bucket foi criado em Storage → Buckets
- Confirme nome exato: `public-pages`

#### Erro: "Forbidden (403)"

- Verifique se as políticas RLS foram criadas
- Confirme que usuário está autenticado (ADMIN role)

#### Erro: "File too large"

- Aumentar limite em `ImageUpload.tsx`: `maxSize = 10` (10MB)

#### Erro: "Invalid image type"

- Certifique-se que está enviando um arquivo de imagem (jpg, png, gif, etc)

#### Imagem não aparece no preview

- Aguarde alguns segundos após upload
- Verifique console do navegador (F12) para erros

### 📁 Estrutura de Arquivos

```
src/
├── components/
│   └── ui/
│       └── ImageUpload.tsx          ✨ Novo
├── app/
│   └── api/
│       ├── upload/
│       │   └── route.ts             ✨ Novo
│       └── admin/
│           └── public-pages/
│               ├── route.ts         📝 Atualizado
│               └── [id]/
│                   └── route.ts     📝 Atualizado
└── components/
    └── admin/
        └── PublicPagesDashboard.tsx  📝 Atualizado
```

### 🔧 Como Usar em Outro Lugar

Para adicionar upload de imagem em outro componente:

```tsx
import { ImageUpload } from '@/components/ui/ImageUpload';

// Dentro do componente
<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  label="Sua Imagem"
  bucket="public-pages"
  maxSize={5}
/>;
```

### 📊 API da ImageUpload Component

```tsx
interface ImageUploadProps {
  value?: string; // URL da imagem atual
  onChange: (url: string) => void; // Callback quando imagem é carregada
  label?: string; // Label do campo (padrão: "Imagem")
  placeholder?: string; // Texto do upload area
  bucket?: string; // Bucket Supabase (padrão: "public-pages")
  maxSize?: number; // Tamanho máx em MB (padrão: 5)
  accept?: string; // MIME types (padrão: "image/*")
}
```

### 🎯 Próximos Passos

- ✅ Testar upload de imagens
- ✅ Testar salvar página com imagens
- ✅ Testar visualizar página publicada
- ⏳ Implementar delete automático de imagem anterior (opcional)
- ⏳ Adicionar compressão de imagem (opcional)

---

**Status:** ✅ Pronto para uso | Bucket criado | Políticas configuradas
