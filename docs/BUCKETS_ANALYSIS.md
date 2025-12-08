# 📦 Análise Completa dos Buckets de Storage

## 📊 Resumo Executivo

O projeto **SM Educacional** utiliza **3 buckets** diferentes no Supabase Storage, cada um com uma função específica:

| Bucket | Função | Tamanho Máx | Uso | Componente |
|--------|--------|------------|-----|-----------|
| **`course-videos`** | Vídeos de conteúdo do curso | 500MB | Aulas e conteúdo educacional | `video-upload-enhanced.tsx` |
| **`course-materials`** | Materiais complementares (PDFs, docs, etc) | 50MB | Materiais de apoio | `material-upload.tsx` |
| **`lesson-videos`** | Vídeos de aulas (alternativa) | 500MB | Aulas e lições | `video-upload.tsx` |

---

## 🎯 Detalhamento de Cada Bucket

### 1️⃣ **`course-videos`** - Vídeos Principais

**Localização:** `src/components/video-upload-enhanced.tsx`

**Função:**
- Armazena vídeos de conteúdo de cursos
- Usado para aulas e lições principais
- Componente mais moderno e completo

**Estrutura de Pastas:**
```
course-videos/
└── videos/
    └── {lessonId}-{random}.{ext}
```

**Exemplo de caminho:**
```
videos/lesson-123-a1b2c3.mp4
```

**Recursos:**
- ✅ Validação de tipo (apenas vídeos)
- ✅ Limite: 500MB
- ✅ Progresso de upload
- ✅ Preview de vídeo
- ✅ Opção de URL externa
- ✅ Barra de progresso com porcentagem

**Código:**
```tsx
const { data, error } = await supabase.storage
  .from('course-videos')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
```

---

### 2️⃣ **`course-materials`** - Materiais Complementares

**Localização:** `src/components/material-upload.tsx`

**Função:**
- Armazena materiais de apoio
- PDFs, documentos, apresentações, etc
- Arquivos adicionais para lições

**Estrutura de Pastas:**
```
course-materials/
└── materials/
    └── {lessonId}-{timestamp}-{filename}
```

**Exemplo de caminho:**
```
materials/lesson-456-1702050000000-apostila.pdf
```

**Recursos:**
- ✅ Suporta qualquer tipo de arquivo
- ✅ Limite: 50MB
- ✅ Lista de múltiplos materiais
- ✅ Ícones por tipo de arquivo (PDF, DOC, etc)
- ✅ Dowload direto
- ✅ Remoção individual

**Código:**
```tsx
const { data, error } = await supabase.storage
  .from('course-materials')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
```

---

### 3️⃣ **`lesson-videos`** - Vídeos de Aulas (Alternativo)

**Localização:** `src/components/video-upload.tsx`

**Função:**
- Alternativa ao `course-videos`
- Vídeos de lições específicas
- Componente legado/original

**Estrutura de Pastas:**
```
lesson-videos/
├── lessons/
│   └── {lessonId}/
│       └── {timestamp}.{ext}
└── temp/
    └── {timestamp}.{ext}
```

**Exemplo de caminho:**
```
lessons/lesson-789/1702050000000.mp4
temp/1702050000000.mp4
```

**Recursos:**
- ✅ Validação de tipo (apenas vídeos)
- ✅ Limite: 500MB
- ✅ Progresso simulado
- ✅ Preview de vídeo
- ✅ Função `uploadFile()` reutilizável

**Código:**
```tsx
const { url, error: uploadError } = await uploadFile(
  file,
  'lesson-videos',
  fileName
);
```

---

## 🔄 Diferenças Entre `course-videos` vs `lesson-videos`

| Aspecto | `course-videos` | `lesson-videos` |
|--------|-----------------|-----------------|
| **Componente** | `video-upload-enhanced.tsx` | `video-upload.tsx` |
| **Tamanho máx** | 500MB | 500MB |
| **Estrutura** | `videos/{name}` | `lessons/{id}/{name}` |
| **Tipo de Upload** | Direto no Supabase | Via função `uploadFile()` |
| **Features** | Mais recursos | Mais simples |
| **URL Externa** | ✅ Sim | ❌ Não |
| **Progresso** | Real | Simulado |
| **Status** | Atual | Legado |

### 📌 Qual Usar?

- ✅ **`course-videos`** → Use este (mais novo e completo)
- ⚠️ **`lesson-videos`** → Use apenas se necessário compatibilidade

---

## 🚀 Caso de Uso Prático

### Cenário: Professor criando um novo curso

1. **Professor clica em "Novo Curso"**
2. **Edita detalhes do curso:**
   - Nome, descrição, etc
3. **Adiciona conteúdo (múltiplas aulas):**
   - Para cada aula → Upload vídeo em **`course-videos`**
   - Para cada aula → Upload materiais em **`course-materials`**
4. **Resultado:**

```
course-videos/
└── videos/
    ├── aula-123-abc123.mp4  ← Vídeo aula 1
    ├── aula-124-def456.mp4  ← Vídeo aula 2
    └── aula-125-ghi789.mp4  ← Vídeo aula 3

course-materials/
└── materials/
    ├── aula-123-apostila.pdf  ← Material aula 1
    ├── aula-123-exercicios.docx
    ├── aula-124-slides.pptx  ← Material aula 2
    └── aula-125-referencias.pdf ← Material aula 3
```

---

## 📋 Configuração RLS Necessária

Cada bucket precisa de 4 políticas RLS (SELECT, INSERT, UPDATE, DELETE):

### Para `course-videos` e `lesson-videos`:

```sql
-- SELECT - Qualquer pessoa pode visualizar
CREATE POLICY "Public read" ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

-- INSERT - Apenas autenticados
CREATE POLICY "Teachers upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);

-- UPDATE - Apenas autenticados
CREATE POLICY "Teachers update" ON storage.objects FOR UPDATE
USING (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);

-- DELETE - Apenas autenticados
CREATE POLICY "Teachers delete" ON storage.objects FOR DELETE
USING (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);
```

### Para `course-materials`:

```sql
-- SELECT - Qualquer pessoa
CREATE POLICY "Public read" ON storage.objects FOR SELECT
USING (bucket_id = 'course-materials');

-- INSERT - Apenas autenticados
CREATE POLICY "Teachers upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-materials' AND auth.uid() IS NOT NULL);

-- UPDATE - Apenas autenticados
CREATE POLICY "Teachers update" ON storage.objects FOR UPDATE
USING (bucket_id = 'course-materials' AND auth.uid() IS NOT NULL);

-- DELETE - Apenas autenticados
CREATE POLICY "Teachers delete" ON storage.objects FOR DELETE
USING (bucket_id = 'course-materials' AND auth.uid() IS NOT NULL);
```

---

## ✅ Checklist de Configuração

- [ ] Bucket `course-videos` criado e marcado **Public**
- [ ] Bucket `course-materials` criado e marcado **Public**
- [ ] Bucket `lesson-videos` criado e marcado **Public** (opcional)
- [ ] 4 políticas RLS criadas para cada bucket
- [ ] Variáveis de ambiente configuradas:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  ```
- [ ] Permissões de upload testadas como TEACHER
- [ ] Upload de vídeo funcionando
- [ ] Upload de materiais funcionando

---

## 🔍 Como Verificar

### 1. Buckets existem?
```sql
SELECT name, public FROM storage.buckets;
```

Deve retornar:
```
course-videos    | true
course-materials | true
lesson-videos    | true
```

### 2. Políticas configuradas?
```sql
SELECT policyname, cmd, roles FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY tablename, policyname;
```

### 3. Testar upload?
```bash
node diagnose-storage.js
```

---

## 📞 Troubleshooting

| Problema | Solução |
|----------|---------|
| "bucket does not exist" | Criar bucket em Storage → New bucket |
| "violates row-level security" | Criar 4 políticas RLS por bucket |
| Bucket não está público | Storage → bucket → Settings → ✅ Public |
| Upload lento | Verificar tamanho do arquivo (máx 500MB) |
| Tipo de arquivo inválido | Verificar MIME type (apenas video/* para vídeos) |

---

**Última atualização:** 8 de dezembro de 2025  
**Versão do projeto:** 0.1.0
