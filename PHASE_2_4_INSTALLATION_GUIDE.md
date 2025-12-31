# 📦 Phase 2.4 - Instalação e Configuração

## Dependências Necessárias

Execute os seguintes comandos para instalar as dependências:

```bash
# Dependências principais do Phase 2
npm install sharp @supabase/supabase-js

# Dependência do ImageUploadForm (drag-and-drop)
npm install react-dropzone

# Dependências de UI (caso ainda não estejam instaladas)
npm install sonner
```

## Migração do Banco de Dados

Execute a migração para criar as tabelas Image e ImageUsage:

```bash
npx prisma migrate dev --name add_image_models
npx prisma generate
```

## Verificação dos Buckets do Supabase

Acesse o dashboard do Supabase e verifique se os seguintes buckets existem:

1. **course-thumbnails** (10MB, JPEG/PNG/WebP)
2. **profile-pictures** (5MB, JPEG/PNG/WebP)
3. **videos** (100MB, MP4/WebM/QuickTime)
4. **public-pages** (10MB, JPEG/PNG/WebP/SVG)

### Como Criar um Bucket:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "Storage" no menu lateral
4. Clique em "New bucket"
5. Configure:
   - **Nome**: (ex: course-thumbnails)
   - **Public**: ✅ (permitir URLs públicas)
   - **File size limit**: 10485760 (10MB em bytes)
   - **Allowed MIME types**: image/jpeg, image/png, image/webp

## Variáveis de Ambiente

Verifique se as seguintes variáveis estão no `.env`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Componentes Criados

### 1. ImageUploadForm

Componente reutilizável para upload de imagens com drag-and-drop.

**Uso:**

```tsx
import { ImageUploadForm } from '@/components/forms/ImageUploadForm';

<ImageUploadForm
  bucket="course-thumbnails"
  resourceType="COURSE"
  resourceId={courseId}
  fieldName="thumbnail"
  currentImageUrl={course.thumbnailUrl}
  onUploadSuccess={(imageId, signedUrl) => {
    // Atualizar estado do componente
    console.log('Upload success:', imageId, signedUrl);
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
  }}
  maxSize={10}
  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
/>;
```

### 2. ImageGallery

Galeria de imagens para administradores com busca, filtros e gerenciamento.

**Uso:**

```tsx
import { ImageGallery } from '@/components/admin/ImageGallery';

<ImageGallery />;
```

## API Routes Criadas

| Endpoint                            | Método | Descrição                          |
| ----------------------------------- | ------ | ---------------------------------- |
| `/api/admin/images`                 | GET    | Lista todas as imagens com filtros |
| `/api/admin/images/upload`          | POST   | Upload de nova imagem              |
| `/api/admin/images/[id]`            | GET    | Detalhes de uma imagem             |
| `/api/admin/images/[id]`            | DELETE | Soft delete de uma imagem          |
| `/api/admin/images/[id]/signed-url` | GET    | Gera nova signed URL               |
| `/api/admin/images/orphaned`        | GET    | Lista imagens órfãs                |
| `/api/admin/images/orphaned`        | DELETE | Remove imagens órfãs               |

## Testes

### 1. Testar Upload

```bash
# Via curl (substitua os valores)
curl -X POST http://localhost:3000/api/admin/images/upload \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -F "file=@/path/to/image.jpg" \
  -F "bucket=course-thumbnails" \
  -F "resourceType=COURSE" \
  -F "resourceId=course_123" \
  -F "fieldName=thumbnail"
```

### 2. Testar Listagem

```bash
# Listar todas as imagens
curl http://localhost:3000/api/admin/images \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"

# Filtrar por bucket
curl "http://localhost:3000/api/admin/images?bucket=course-thumbnails" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"

# Buscar por nome
curl "http://localhost:3000/api/admin/images?search=logo" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"
```

### 3. Testar Delete

```bash
curl -X DELETE http://localhost:3000/api/admin/images/IMAGE_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"
```

## Próximos Passos (Phase 2.5)

Agora que a infraestrutura está pronta, o próximo passo é refatorar os uploads existentes:

1. **Course Thumbnail Upload** - Refatorar para usar ImageService
2. **User Avatar Upload** - Refatorar para usar ImageService
3. **PublicPage Banner/Icon** - Refatorar para usar ImageService
4. **Lesson Video Upload** - Refatorar para usar ImageService

## Verificação Final

Execute este checklist para garantir que tudo está funcionando:

- [ ] Dependências instaladas (`sharp`, `@supabase/supabase-js`, `react-dropzone`, `sonner`)
- [ ] Migração executada (`npx prisma migrate dev`)
- [ ] Buckets criados no Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] Servidor rodando (`npm run dev`)
- [ ] Upload funciona (testar com ImageUploadForm)
- [ ] Listagem funciona (testar com ImageGallery)
- [ ] Delete funciona (testar soft delete)
- [ ] Signed URLs funcionam (verificar expiração)

---

**Status Phase 2:**

- ✅ Phase 2.1: Database Setup (100%)
- ✅ Phase 2.2: ImageService Implementation (100%)
- ✅ Phase 2.3: API Routes (100%)
- ✅ Phase 2.4: Frontend Components (100%)
- 🔲 Phase 2.5: Integration Refactoring (0%)
- 🔲 Phase 2.6: Testing (0%)

**Próxima Entrega:** Phase 2.5 - Integration Refactoring (8-12 Janeiro)
