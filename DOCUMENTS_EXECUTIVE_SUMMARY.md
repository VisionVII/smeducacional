# 📦 SISTEMA DE DOCUMENTOS — RESUMO EXECUTIVO

**VisionVII Enterprise Governance 3.0**  
**Data:** 08/01/2026  
**Status:** ✅ IMPLEMENTADO (Backend Completo)

---

## 🎯 OBJETIVO

Permitir que **professores** façam upload de documentos (PDF, Word, Excel, PowerPoint) em seus cursos, e **alunos matriculados** possam baixá-los de forma segura através de URLs assinadas.

---

## ✅ O QUE FOI IMPLEMENTADO

### **1. Banco de Dados (Prisma)**

```prisma
model CourseDocument {
  id          String         @id @default(cuid())
  courseId    String         // FK para Course
  moduleId    String?        // Opcional (documento geral do curso)
  uploadedBy  String         // FK para User (quem fez upload)
  fileName    String         // Nome original (sanitizado)
  storagePath String         // UUID no Supabase Storage
  fileSize    Int            // Em bytes
  mimeType    String         // Tipo do arquivo
  status      DocumentStatus @default(APPROVED)
  scanResult  Json?          // Resultado de antivírus (futuro)
  expiresAt   DateTime?      // Expiração automática (futuro)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  deletedAt   DateTime?      // Soft delete
}

enum DocumentStatus {
  APPROVED       // Liberado para download
  PENDING_SCAN   // Aguardando análise de segurança
  REJECTED       // Bloqueado (malware detectado)
}
```

**Índices criados:**

- `courseId` (buscar documentos de um curso)
- `moduleId` (filtrar por módulo)
- `uploadedBy` (documentos de um professor)
- `status` (filtrar aprovados/pendentes/rejeitados)
- `deletedAt` (excluir soft deleted)

---

### **2. Service Layer (`src/lib/services/document.service.ts`)**

#### **Função: `uploadDocument()`**

**Fluxo:**

1. Valida tipo MIME (apenas 7 formatos permitidos)
2. Valida tamanho (máximo 50 MB)
3. Verifica se o curso existe
4. **SEGURANÇA:** Verifica se usuário é instrutor do curso ou ADMIN
5. Valida módulo (se informado)
6. Gera UUID único para evitar colisão de nomes
7. Faz upload para Supabase Storage (`course-documents` bucket)
8. Salva registro no banco com status `APPROVED`
9. **Auditoria:** Loga ação com `AuditAction.CONTENT_ACCESS`

**Tipos permitidos:**

- `application/pdf` (PDF)
- `application/msword` (DOC)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- `application/vnd.ms-excel` (XLS)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (XLSX)
- `application/vnd.ms-powerpoint` (PPT)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)

**Retorno:**

```typescript
{
  success: true,
  documentId: "clxxxxxxxxxxxxx",
  message: "Documento enviado com sucesso"
}
```

---

#### **Função: `generateDownloadUrl()`**

**Fluxo:**

1. Busca documento no banco
2. Verifica se documento existe e não foi deletado
3. Bloqueia documentos `REJECTED` ou `PENDING_SCAN`
4. **SEGURANÇA:** Valida acesso:
   - ✅ ADMIN: Acesso total
   - ✅ TEACHER (autor): Acesso ao próprio documento
   - ✅ TEACHER (do curso): Acesso a documentos do curso
   - ✅ STUDENT (matriculado): Verifica se existe `enrollment` ACTIVE
   - ❌ STUDENT (NÃO matriculado): Bloqueado + log de `SECURITY_VIOLATION`
5. Gera URL assinada do Supabase (1 hora de validade)
6. **Auditoria:** Loga download com IP, userId, documentId

**Retorno:**

```typescript
{
  success: true,
  signedUrl: "https://xxx.supabase.co/storage/v1/object/sign/...",
  fileName: "Apostila_Modulo_1.pdf",
  message: "URL gerada com sucesso"
}
```

---

#### **Função: `listCourseDocuments()`**

Lista documentos de um curso com filtro opcional por módulo.

**Filtros automáticos:**

- Alunos veem apenas `status = 'APPROVED'`
- Professores/Admin veem todos os status
- Exclui documentos soft deleted (`deletedAt IS NULL`)

**Retorno:**

```typescript
{
  documents: [
    {
      id: 'clxxx',
      fileName: 'Apostila.pdf',
      fileSize: 1234567,
      mimeType: 'application/pdf',
      status: 'APPROVED',
      moduleId: 'mod_123',
      createdAt: '2026-01-08T12:00:00Z',
      uploader: {
        id: 'user_123',
        name: 'Professor Silva',
        email: 'professor@smeducacional.com',
      },
    },
  ];
}
```

---

#### **Função: `deleteDocument()`**

Soft delete de documento (apenas autor ou ADMIN).

**Validações:**

- Verifica se documento existe
- Verifica se usuário é autor OU é ADMIN
- Faz soft delete (seta `deletedAt`)
- **Auditoria:** Loga remoção

---

### **3. API Routes (REST)**

#### **POST `/api/documents/upload`**

Upload de documento (TEACHER do curso ou ADMIN).

**Request:**

```typescript
// FormData
{
  file: File,           // PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
  courseId: string,     // ID do curso
  moduleId?: string     // Opcional (se omitido, é documento geral do curso)
}
```

**Response (Sucesso):**

```json
{
  "message": "Documento enviado com sucesso",
  "documentId": "clxxxxxxxxxxxxx"
}
```

**Response (Erro - Não autorizado):**

```json
{
  "error": "Você não tem permissão para subir documentos neste curso",
  "code": "UNAUTHORIZED"
}
```

---

#### **POST `/api/documents/[id]/download`**

Gera URL assinada para download (valida matrícula do aluno).

**Request:**

```typescript
// Body vazio (documentId vem da URL)
```

**Response (Sucesso):**

```json
{
  "signedUrl": "https://xxx.supabase.co/storage/v1/object/sign/course-documents/documents/courses/...",
  "fileName": "Apostila_Modulo_1.pdf",
  "message": "URL gerada com sucesso"
}
```

**Response (Erro - Não matriculado):**

```json
{
  "error": "Você não tem acesso a este documento",
  "code": "UNAUTHORIZED"
}
```

➡️ **Auditoria:** Gera log de `SECURITY_VIOLATION` no `AuditLog`.

---

#### **DELETE `/api/documents/[id]`**

Soft delete de documento (apenas autor ou ADMIN).

**Response (Sucesso):**

```json
{
  "message": "Documento removido com sucesso"
}
```

---

#### **GET `/api/courses/[id]/documents?moduleId=xxx`**

Lista documentos de um curso (com filtro opcional por módulo).

**Query Parameters:**

- `moduleId` (opcional): Filtra documentos de um módulo específico

**Response:**

```json
{
  "documents": [
    {
      "id": "clxxx",
      "fileName": "Apostila.pdf",
      "fileSize": 1234567,
      "mimeType": "application/pdf",
      "status": "APPROVED",
      "moduleId": "mod_123",
      "createdAt": "2026-01-08T12:00:00Z",
      "uploader": {
        "id": "user_123",
        "name": "Professor Silva",
        "email": "professor@smeducacional.com"
      }
    }
  ]
}
```

---

## 🔐 CAMADAS DE SEGURANÇA

### **1. Upload**

- ✅ Validação de tipo MIME (whitelist de 7 formatos)
- ✅ Validação de tamanho (máximo 50 MB)
- ✅ Verificação de permissão: apenas instrutor do curso ou ADMIN
- ✅ UUID único no storagePath (evita sobrescrita)
- ✅ Auditoria de uploads com IP, userId, fileName, fileSize

### **2. Download**

- ✅ Validação de matrícula: aluno precisa estar `ENROLLED` no curso
- ✅ URLs assinadas com 1 hora de validade (não há URLs públicas)
- ✅ Documentos `REJECTED` ou `PENDING_SCAN` bloqueados
- ✅ Auditoria de downloads com IP, userId, documentId
- ✅ **Security Violation Log:** Tentativas de acesso não autorizado registradas

### **3. Delete**

- ✅ Apenas autor ou ADMIN podem deletar
- ✅ Soft delete (campo `deletedAt`)
- ✅ Auditoria de remoções

### **4. Storage (Supabase)**

- ✅ Bucket `course-documents` é **PRIVADO** (não há URLs públicas)
- ✅ RLS policies no Supabase (INSERT/SELECT/DELETE)
- ✅ Tamanho máximo do bucket: 50 MB por arquivo
- ✅ MIME types permitidos configurados no bucket

---

## 📊 AUDITORIA

Todas as ações sensíveis são registradas na tabela `audit_logs`:

**Upload:**

```json
{
  "userId": "user_123",
  "action": "CONTENT_ACCESS",
  "targetType": "DOCUMENT_UPLOAD",
  "targetId": "doc_123",
  "metadata": {
    "courseId": "course_123",
    "moduleId": "mod_123",
    "fileName": "Apostila.pdf",
    "fileSize": 1234567,
    "mimeType": "application/pdf",
    "storagePath": "documents/courses/xxx/uuid.pdf"
  },
  "ipAddress": "192.168.1.1"
}
```

**Download (Sucesso):**

```json
{
  "userId": "user_456",
  "action": "CONTENT_ACCESS",
  "targetType": "DOCUMENT_DOWNLOAD",
  "targetId": "doc_123",
  "metadata": {
    "courseId": "course_123",
    "moduleId": "mod_123",
    "fileName": "Apostila.pdf"
  },
  "ipAddress": "192.168.1.2"
}
```

**Download (Tentativa Bloqueada):**

```json
{
  "userId": "user_789",
  "action": "SECURITY_VIOLATION",
  "targetType": "DOCUMENT_DOWNLOAD",
  "targetId": "doc_123",
  "metadata": {
    "reason": "UNAUTHORIZED_DOWNLOAD",
    "courseId": "course_123"
  },
  "ipAddress": "192.168.1.3"
}
```

---

## 🚀 PRÓXIMOS PASSOS (UI)

### **Para Professores (Dashboard de Curso):**

1. Componente `DocumentUploader.tsx`:
   - Drag & drop de arquivos
   - Validação client-side (tipo e tamanho)
   - Barra de progresso
   - Preview de ícone por tipo (PDF, Word, Excel, PowerPoint)
   - Seletor de módulo (ou "Documento Geral")
2. Componente `DocumentList.tsx`:
   - Lista de documentos do curso
   - Filtro por módulo
   - Botão "Remover" (soft delete)
   - Indicador de tamanho formatado ("2.5 MB")
   - Data de upload

### **Para Alunos (Página do Curso):**

1. Seção "Materiais de Apoio":
   - Lista de documentos por módulo
   - Ícone por tipo de arquivo
   - Botão "Baixar" que chama `/api/documents/[id]/download`
   - Tooltip com tamanho do arquivo
   - Indicador de "Novo" (< 7 dias)

### **Para Admins (Painel Administrativo):**

1. Página "Documentos do Sistema":
   - Listagem geral de todos os documentos
   - Filtros: status, curso, professor, data
   - Estatísticas: total de armazenamento, documentos por curso
   - Painel de documentos `PENDING_SCAN`
   - Botões "Aprovar" / "Rejeitar" para moderação

---

## 📋 CHECKLIST DE DEPLOY

Antes de ir para produção:

- [ ] Bucket `course-documents` criado no Supabase
- [ ] RLS policies configuradas no Supabase Storage
- [ ] Migration executada: `npx prisma migrate deploy`
- [ ] Variáveis de ambiente de produção configuradas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Teste de upload funcionando (professor)
- [ ] Teste de download funcionando (aluno matriculado)
- [ ] Teste de segurança: aluno NÃO matriculado é bloqueado
- [ ] Auditoria registrando uploads/downloads
- [ ] Monitoramento de violações de segurança
- [ ] Documentação da API entregue

---

## 🐛 ERROS COMUNS

### **"Bucket 'course-documents' not found"**

➡️ Execute: `node scripts/create-documents-bucket.mjs`

### **"relation 'course_documents' does not exist"**

➡️ Execute: `npx prisma migrate dev`

### **"You don't have permission to upload"**

➡️ Verifique se o usuário é TEACHER (do curso) ou ADMIN

### **"Você não tem acesso a este documento"**

➡️ Para alunos: verifique se existe `enrollment` com `status = 'ACTIVE'`

### **"Signed URL generation failed"**

➡️ Verifique `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`

---

**Desenvolvido por VisionVII — Inovação e Transformação Digital**
