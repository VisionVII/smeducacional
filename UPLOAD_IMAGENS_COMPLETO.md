## 📸 Upload de Imagens para Páginas Públicas - IMPLEMENTAÇÃO COMPLETA

### ✅ Problema Inicial

**Você relatou:** "Não consigo salvar e editar as páginas, troque os campos de imagem de link para uploads e guardar em banco de dados"

### 🎯 Solução Implementada

#### 1. **Novo Componente de Upload**

📄 [src/components/ui/ImageUpload.tsx](src/components/ui/ImageUpload.tsx)

```tsx
<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  label="Banner"
  bucket="public-pages"
  maxSize={10}
/>
```

**Recursos:**

- ✅ Drag-and-drop de imagens
- ✅ Validação de tamanho (máx 5-10MB)
- ✅ Preview em tempo real
- ✅ Remover imagem com botão X
- ✅ Spinner de carregamento
- ✅ Tratamento de erros com toast
- ✅ Suporta jpg, png, gif, webp, etc

#### 2. **Nova API de Upload**

📄 [src/app/api/upload/route.ts](src/app/api/upload/route.ts)

```typescript
// Endpoint: POST /api/upload
// Body: FormData com { file, bucket }
// Response: { url, fileName }
```

**Funcionalidades:**

- ✅ Autenticação obrigatória
- ✅ Validação de arquivo
- ✅ Upload para Supabase Storage
- ✅ Retorna URL pública da imagem
- ✅ Geração de nomes únicos com timestamp

#### 3. **Dashboard Atualizado**

📄 [src/components/admin/PublicPagesDashboard.tsx](src/components/admin/PublicPagesDashboard.tsx)

**Alterações:**

- ❌ Removidos: campos de URL de texto (bannerUrl, iconUrl)
- ✅ Adicionado: componentes ImageUpload com drag-and-drop
- ✅ Agora suporta: carregar imagens diretamente
- ✅ Salva: URLs das imagens automaticamente no banco

#### 4. **API Validation Simplificada**

- ✅ `bannerUrl` e `iconUrl`: Removida validação `.url()` obrigatória
- ✅ Aceita: strings vazias `""` (sem imagem)
- ✅ Persiste: URLs no banco de dados (PublicPage model)

---

### 🚀 PASSO 1: Preparar Supabase

#### Opção A: Dashboard Supabase (Recomendado)

1. Acesse [console.supabase.io](https://console.supabase.io)
2. Selecione seu projeto
3. Vá em **Storage** → **Buckets** → **New bucket**
4. Configure:
   - **Name:** `public-pages`
   - **Public:** ✅ (permitir acesso público)
5. Clique em **Create**

#### Opção B: SQL (copiar no Editor SQL do Supabase)

```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-pages', 'public-pages', true)
ON CONFLICT (id) DO NOTHING;
```

---

### 🔐 PASSO 2: Configurar Políticas RLS

No dashboard Supabase → **Storage** → **Bucket: public-pages** → **Policies**

**Policy 1: SELECT (Leitura Pública)**

```sql
CREATE POLICY "Public images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-pages');
```

**Policy 2: INSERT (Upload Autenticado)**

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public-pages' AND auth.role() = 'authenticated');
```

**Policy 3: UPDATE (Atualização Autenticada)**

```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public-pages' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'public-pages' AND auth.role() = 'authenticated');
```

**Policy 4: DELETE (Deleção Autenticada)**

```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'public-pages' AND auth.role() = 'authenticated');
```

**✅ Arquivo pronto:** `setup-public-pages-bucket.sql` (copiar e colar no SQL Editor)

---

### ✨ PASSO 3: Testar o Sistema

1. **Acessar Admin Dashboard:**

   - URL: http://localhost:3000/admin/public-pages
   - ✅ Deve estar autenticado como ADMIN

2. **Criar Nova Página:**

   - Clique em **Nova Página**
   - Preencha:
     - Slug: `teste`
     - Título: `Página de Teste`

3. **Upload de Imagens:**

   - Seção **Mídia** → **Banner**
   - Arraste ou clique para selecionar imagem
   - Aguarde upload completar (verá preview)
   - Repita para **Ícone**

4. **Salvar Página:**

   - Clique em **Salvar**
   - ✅ Se vir mensagem "Página criada com sucesso", está funcionando!

5. **Verificar Preview:**
   - À esquerda, verá iframe com preview da página
   - Imagens devem estar visíveis

---

### 🔧 Arquivos Modificados/Criados

| Arquivo                                         | Status        | Alterações                            |
| ----------------------------------------------- | ------------- | ------------------------------------- |
| `src/components/ui/ImageUpload.tsx`             | ✨ Novo       | Componente upload completo            |
| `src/components/ui/MarkdownEditor.tsx`          | ✨ Novo       | Wrapper Client Component              |
| `src/app/api/upload/route.ts`                   | ✨ Novo       | API de upload para Supabase           |
| `src/components/admin/PublicPagesDashboard.tsx` | 📝 Atualizado | Substituiu URL fields por ImageUpload |
| `src/app/api/admin/public-pages/route.ts`       | 📝 Atualizado | Removeu validação `.url()`            |
| `src/app/api/admin/public-pages/[id]/route.ts`  | 📝 Atualizado | Removeu validação `.url()`            |
| `src/app/public/[slug]/page.tsx`                | 📝 Atualizado | Usa novo MarkdownEditor               |
| `setup-public-pages-bucket.sql`                 | 📄 Documento  | Script SQL para setup                 |

---

### 📊 Como Funciona (Fluxo)

```
User Interface (Admin Dashboard)
    ↓
ImageUpload Component (drag-drop)
    ↓
POST /api/upload (FormData)
    ↓
Supabase Storage Upload
    ↓
Retorna URL pública
    ↓
Salva URL em PublicPage.bannerUrl / iconUrl
    ↓
Persistido no Banco de Dados
    ↓
Exibido na página pública
```

---

### 🎨 Usando em Outro Lugar

Para adicionar upload de imagem em qualquer componente:

```tsx
import { ImageUpload } from '@/components/ui/ImageUpload';

// No seu componente
<ImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  label="Foto do Perfil"
  bucket="public-pages"
  maxSize={5} // 5MB
  accept="image/*"
/>;
```

---

### 🐛 Troubleshooting

| Erro                              | Solução                                                                |
| --------------------------------- | ---------------------------------------------------------------------- |
| "Bucket 'public-pages' not found" | Verifique se bucket foi criado em Storage → Buckets                    |
| "Forbidden (403)"                 | Confirme que as políticas RLS foram criadas                            |
| "File too large"                  | Aumentar `maxSize` no componente ou em `setup-public-pages-bucket.sql` |
| "Invalid image type"              | Certifique-se que está enviando arquivo de imagem                      |
| "Página não salva"                | Verifique se slug e título estão preenchidos                           |
| "Imagem não aparece"              | Aguarde alguns segundos, F12 para ver erros no console                 |

---

### 🔐 Segurança

✅ **O que está protegido:**

- ✅ Upload requer autenticação (ADMIN)
- ✅ Arquivo validado (tipo, tamanho)
- ✅ URL gerada com timestamp único
- ✅ Armazenado em Supabase (não filesystem local)
- ✅ Políticas RLS garantem acesso controlado

⚠️ **Boas práticas aplicadas:**

- ✅ Nunca usar filesystem local (ephemeral no Vercel)
- ✅ Sempre validar arquivo antes de upload
- ✅ Usar Supabase Storage (bucket público ou privado)
- ✅ Gerar nomes únicos para evitar conflitos

---

### 📋 Checklist de Setup

- [ ] 1. Criar bucket `public-pages` em Supabase
- [ ] 2. Copiar e executar script SQL (4 políticas)
- [ ] 3. Acessar /admin/public-pages
- [ ] 4. Criar página de teste
- [ ] 5. Upload de imagem no banner
- [ ] 6. Salvar página
- [ ] 7. Verificar preview com imagem
- [ ] 8. Publicar página (`isPublished` = true)
- [ ] 9. Acessar `/teste` para ver página pública
- [ ] 10. ✅ Sucesso!

---

### 💡 Próximas Melhorias (Opcional)

- [ ] Compressão automática de imagem
- [ ] Crop de imagem antes de upload
- [ ] Delete automático de imagem anterior
- [ ] Suportar múltiplas imagens
- [ ] Galeria de imagens
- [ ] CDN com cache (Cloudflare, CloudFront)

---

**Status:** ✅ **PRONTO PARA USO**

Desenvolvido com excelência pela **VisionVII** — Inovação em Desenvolvimento de Software.
