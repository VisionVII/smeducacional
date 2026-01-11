# 🚀 GUIA DE IMPLEMENTAÇÃO: Documentos & Categorias

**VisionVII Enterprise Governance 3.0**

## ✅ O que foi implementado

### 1. **Banco de Dados (Prisma)**

- ✅ Migration criada: `20260108000000_add_categories_and_documents`
- ✅ Model `CourseDocument` com soft delete
- ✅ Enum `DocumentStatus` (APPROVED, PENDING_SCAN, REJECTED)
- ✅ Relações bidirecionais: Course ↔ CourseDocument ↔ User

### 2. **DocumentService** (`src/lib/services/document.service.ts`)

- ✅ `uploadDocument()`: Upload seguro com validação de permissão
- ✅ `generateDownloadUrl()`: URLs assinadas com verificação de matrícula
- ✅ `listCourseDocuments()`: Listagem filtrada por módulo
- ✅ `deleteDocument()`: Soft delete com auditoria
- ✅ Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- ✅ Tamanho máximo: 50 MB
- ✅ Auditoria completa de uploads e downloads

### 3. **API Routes**

- ✅ `POST /api/documents/upload`: Upload de documentos (TEACHER/ADMIN)
- ✅ `POST /api/documents/[id]/download`: Gerar URL assinada (com validação de matrícula)
- ✅ `DELETE /api/documents/[id]`: Soft delete (apenas autor ou ADMIN)
- ✅ `GET /api/courses/[id]/documents?moduleId=xxx`: Listar documentos do curso

---

## 📋 PASSO A PASSO DE EXECUÇÃO

### **PASSO 1: Criar Bucket no Supabase**

Acesse o console do Supabase: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets

Ou use este script SQL no SQL Editor:

```sql
-- Criar bucket course-documents (público = false)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-documents',
  'course-documents',
  false, -- NÃO público (requer signed URLs)
  52428800, -- 50 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
);
 -- Criar políticas RLS (evita erro de uuid = text e restringe ao service_role)
 CREATE POLICY "Service role pode inserir"
 ON storage.objects FOR INSERT
 TO authenticated, service_role
 WITH CHECK (
   bucket_id = 'course-documents' AND auth.role() = 'service_role'
 );

 CREATE POLICY "Service role pode ler"
 ON storage.objects FOR SELECT
 TO authenticated, service_role
 USING (
   bucket_id = 'course-documents' AND auth.role() = 'service_role'
 );

 CREATE POLICY "Service role pode deletar"
 ON storage.objects FOR DELETE
 TO authenticated, service_role
 USING (
   bucket_id = 'course-documents' AND auth.role() = 'service_role'
 );
```

**OU crie manualmente:**

1. Vá em **Storage** → **New Bucket**
2. Nome: `course-documents`
3. **Público: NÃO** (deixe desmarcado)
4. File size limit: `52428800` (50 MB)
5. Allowed MIME types: Cole os 7 tipos acima

---

### **PASSO 2: Executar Migration**

```powershell
# Execute a migration
npx prisma migrate dev --name add_course_documents

# Gere o Prisma Client atualizado
npx prisma generate
```

**Verificar se deu certo:**

```powershell
# Abra o Prisma Studio
npx prisma studio
```

Você deve ver a tabela `CourseDocument` com 0 registros.

---

### **PASSO 3: Verificar Variáveis de Ambiente**

Certifique-se de ter no `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres.xxx:PASSWORD@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# NextAuth
NEXTAUTH_SECRET=sua-chave-secreta-aqui
NEXTAUTH_URL=http://localhost:3000
```

---

### **PASSO 4: Reiniciar Servidor de Desenvolvimento**

```powershell
# Limpar cache do Next.js
Remove-Item -Recurse -Force .next

# Reiniciar servidor
npm run dev
```

---

## 🧪 TESTES

### **Teste 1: Upload de Documento (Professor)**

```powershell
# 1. Fazer login como professor
# Browser: http://localhost:3000/login
# Email: professor@smeducacional.com
# Senha: teacher123

# 2. Pegar o token da sessão (DevTools → Application → Cookies → next-auth.session-token)

# 3. Testar upload via PowerShell
$token = "SEU_TOKEN_AQUI"
$headers = @{ "Cookie" = "next-auth.session-token=$token" }
$filePath = "C:\Users\hvvct\Desktop\teste.pdf"
$courseId = "ID_DO_CURSO_AQUI"

# Criar FormData
$form = @{
    file = Get-Item $filePath
    courseId = $courseId
}

Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/documents/upload -Form $form -Headers $headers
```

**Resposta esperada:**

```json
{
  "message": "Documento enviado com sucesso",
  "documentId": "clxxxxxxxxxxxxx"
}
```

---

### **Teste 2: Listar Documentos do Curso**

```powershell
$token = "SEU_TOKEN_AQUI"
$courseId = "ID_DO_CURSO"
$headers = @{ "Cookie" = "next-auth.session-token=$token" }

Invoke-RestMethod -Uri "http://localhost:3000/api/courses/$courseId/documents" -Headers $headers
```

**Resposta esperada:**

```json
{
  "documents": [
    {
      "id": "clxxxxx",
      "fileName": "teste.pdf",
      "fileSize": 123456,
      "mimeType": "application/pdf",
      "status": "APPROVED",
      "createdAt": "2026-01-08T12:00:00Z",
      "uploader": {
        "id": "user123",
        "name": "Professor",
        "email": "professor@smeducacional.com"
      }
    }
  ]
}
```

---

### **Teste 3: Download de Documento (Aluno Matriculado)**

```powershell
# 1. Fazer login como aluno
# Email: aluno@smeducacional.com
# Senha: student123

# 2. Pegar token do aluno

# 3. Solicitar URL assinada
$token = "TOKEN_DO_ALUNO"
$documentId = "ID_DO_DOCUMENTO"
$headers = @{ "Cookie" = "next-auth.session-token=$token" }

$response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/documents/$documentId/download" -Headers $headers

# 4. Baixar o arquivo usando a URL assinada
$signedUrl = $response.signedUrl
Invoke-WebRequest -Uri $signedUrl -OutFile "C:\Users\hvvct\Desktop\downloaded.pdf"
```

---

### **Teste 4: Verificar Segurança (Aluno NÃO Matriculado)**

```powershell
# Login com aluno que NÃO está matriculado no curso
# Tentar baixar documento de curso que ele não está matriculado

$response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/documents/$documentId/download" -Headers $headers
```

**Resposta esperada:**

```json
{
  "error": "Você não tem acesso a este documento",
  "code": "UNAUTHORIZED"
}
```

✅ **Auditoria:** Verifique no banco de dados (`AuditLog`) se foi registrado `SECURITY_VIOLATION`.

---

## 🔐 VALIDAÇÕES DE SEGURANÇA IMPLEMENTADAS

### ✅ Upload

- Apenas TEACHER (do curso) ou ADMIN pode subir
- Tipos de arquivo validados (7 formatos Office + PDF)
- Tamanho máximo: 50 MB
- Verificação de permissão: instrutor do curso ou admin
- Módulo validado (se informado, precisa pertencer ao curso)
- UUID único no storagePath (evita colisão)
- Auditoria de todos os uploads

### ✅ Download

- Validação de matrícula: aluno precisa estar `ENROLLED` no curso
- Professor que subiu o documento tem acesso
- Professor do curso tem acesso
- Admin tem acesso total
- URLs assinadas com 1 hora de validade
- Documentos `REJECTED` ou `PENDING_SCAN` bloqueados
- Auditoria de todos os downloads

### ✅ Delete

- Apenas autor do documento ou ADMIN
- Soft delete (campo `deletedAt`)
- Auditoria de todas as remoções

---

## 📊 MONITORAMENTO

### **Ver Logs de Auditoria**

```sql
-- No Supabase SQL Editor
SELECT
  al.id,
  al.action,
  al."targetType",
  al.metadata,
  u.email AS user_email,
  al."createdAt"
FROM audit_logs al
JOIN users u ON al."userId" = u.id
WHERE al."targetType" IN ('DOCUMENT_UPLOAD', 'DOCUMENT_DOWNLOAD', 'DOCUMENT_DELETE')
ORDER BY al."createdAt" DESC
LIMIT 50;
```

### **Ver Documentos Rejeitados**

```sql
SELECT
  cd.id,
  cd.file_name,
  cd.status,
  cd.scan_result,
  c.title AS course_title,
  u.email AS uploader_email
FROM course_documents cd
JOIN courses c ON cd.course_id = c.id
JOIN users u ON cd.uploaded_by = u.id
WHERE cd.status = 'REJECTED'
  AND cd.deleted_at IS NULL;
```

---

## 🎯 PRÓXIMOS PASSOS (UI)

Agora que o backend está pronto, precisamos criar as interfaces:

### **Para Professores:**

1. Componente `DocumentUploader.tsx` no painel de criação/edição de curso
2. Lista de documentos com botão "Remover"
3. Upload por arrasto (drag & drop)
4. Barra de progresso

### **Para Alunos:**

1. Componente `DocumentList.tsx` na página do curso
2. Ícone de tipo de arquivo (PDF, Word, Excel, PowerPoint)
3. Botão "Baixar" que chama `/api/documents/[id]/download`
4. Tamanho do arquivo formatado (ex: "2.5 MB")

### **Para Admins:**

1. Visualização de todos os documentos do sistema
2. Painel de documentos `PENDING_SCAN`
3. Botão para aprovar/rejeitar manualmente
4. Estatísticas de armazenamento por curso

---

## 🐛 TROUBLESHOOTING

### **Erro: "Bucket 'course-documents' not found"**

➡️ Execute o PASSO 1 (criar bucket no Supabase)

### **Erro: "relation 'course_documents' does not exist"**

➡️ Execute o PASSO 2 (migration)

### **Erro: "You don't have permission to upload"**

➡️ Verifique se o usuário é TEACHER ou ADMIN
➡️ Se for teacher, confirme que `instructorId` do curso == `userId`

### **Erro: "Você não tem acesso a este documento"**

➡️ Para alunos: verifique se há registro na tabela `enrollments` com `status = 'ACTIVE'`
➡️ SQL para verificar:

```sql
SELECT * FROM enrollments
WHERE user_id = 'USER_ID'
  AND course_id = 'COURSE_ID'
  AND status = 'ACTIVE'
  AND deleted_at IS NULL;
```

### **Erro: "Signed URL generation failed"**

➡️ Verifique `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`
➡️ Confirme que o arquivo existe no bucket (Supabase Console → Storage)

---

## 📝 CHECKLIST FINAL

Antes de enviar para produção:

- [ ] Bucket `course-documents` criado no Supabase
- [ ] RLS policies configuradas corretamente
- [ ] Migration executada (`npx prisma migrate deploy`)
- [ ] Teste de upload funcionando (professor)
- [ ] Teste de download funcionando (aluno matriculado)
- [ ] Teste de segurança: aluno NÃO matriculado bloqueado
- [ ] Auditoria registrando uploads/downloads
- [ ] Soft delete funcionando (documentos não são hard deleted)
- [ ] `.env` de produção com `SUPABASE_SERVICE_ROLE_KEY` correto

---

**Developed by VisionVII — Innovation & Digital Transformation**
