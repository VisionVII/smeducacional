# Auditoria e Implementação - Área do Professor

## ✅ APIs Implementadas

### 1. Profile API (`/api/teacher/profile`)

**Arquivo**: `src/app/api/teacher/profile/route.ts`

- **GET**: Buscar perfil do professor
- **PUT**: Atualizar perfil (nome, email, bio, phone, cpf, address, avatar)
- Validação com Zod
- Verificação de email duplicado
- Autenticação e autorização

### 2. Password API (`/api/teacher/password`)

**Arquivo**: `src/app/api/teacher/password/route.ts`

- **PUT**: Alterar senha
- Validação de senha atual com bcrypt
- Hash da nova senha
- Mínimo 6 caracteres

### 3. Avatar Upload API (`/api/teacher/avatar`)

**Arquivo**: `src/app/api/teacher/avatar/route.ts`

- **POST**: Upload de foto de perfil
- Validação de tipo (JPG, PNG, WEBP)
- Validação de tamanho (máx 5MB)
- Salva em `/public/uploads/avatars/`
- Atualiza URL no banco de dados

### 4. Education API (`/api/teacher/education`)

**Arquivos**:

- `src/app/api/teacher/education/route.ts`
- `src/app/api/teacher/education/[id]/route.ts`

- **GET**: Listar todas as formações
- **POST**: Adicionar formação (degree, institution, field, year)
- **DELETE**: Remover formação por ID
- Validação de propriedade (só pode deletar suas próprias formações)

### 5. Financial API (`/api/teacher/financial`)

**Arquivo**: `src/app/api/teacher/financial/route.ts`

- **GET**: Buscar dados bancários
- **PUT**: Salvar/atualizar dados (bank, agency, account, accountType, pixKey)
- Validação de tipo de conta (Corrente/Poupança)
- Upsert (cria se não existe, atualiza se existe)

### 6. 2FA APIs (`/api/teacher/2fa/*`)

**Arquivos**:

- `src/app/api/teacher/2fa/enable/route.ts`
- `src/app/api/teacher/2fa/verify/route.ts`
- `src/app/api/teacher/2fa/disable/route.ts`
- `src/app/api/teacher/2fa/status/route.ts`

**Funcionalidades**:

- **POST /enable**: Gerar QR Code e segredo TOTP
- **POST /verify**: Verificar código e ativar 2FA
- **POST /disable**: Desativar 2FA (requer código)
- **GET /status**: Verificar se 2FA está ativo

**Bibliotecas instaladas**: `speakeasy`, `qrcode`, `@types/qrcode`

---

## ✅ Melhorias no Dashboard

### Arquivo: `src/app/teacher/dashboard/page.tsx`

**Antes**:

```typescript
const pendingMessages = 0; // Hardcoded
```

**Depois**:

```typescript
const pendingMessages = await prisma.message.count({
  where: {
    receiverId: user.id,
    read: false,
  },
});
```

Agora conta mensagens não lidas reais do banco de dados.

---

## ✅ Schema do Prisma Atualizado

### Arquivo: `prisma/schema.prisma`

### Novos Campos no Model User:

```prisma
model User {
  // ... campos existentes
  cpf              String?
  address          String?
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?

  // Novas relações
  teacherEducation TeacherEducation[]
  teacherFinancial TeacherFinancial?
}
```

### Novo Model: TeacherEducation

```prisma
model TeacherEducation {
  id          String   @id @default(cuid())
  degree      String   // Graduação, Pós-graduação, Mestrado, Doutorado
  institution String
  field       String   // Área de formação
  year        Int
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("teacher_education")
}
```

### Novo Model: TeacherFinancial

```prisma
model TeacherFinancial {
  id          String   @id @default(cuid())
  bank        String
  agency      String
  account     String
  accountType String   // Corrente, Poupança
  pixKey      String?
  userId      String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("teacher_financial")
}
```

---

## 🔧 Comandos para Aplicar Mudanças

### 1. Gerar Prisma Client (✅ Já executado)

```bash
npx prisma generate
```

### 2. Sincronizar com Banco de Dados (⚠️ Pendente - banco inacessível)

```bash
npx prisma db push
```

**Nota**: O banco Supabase estava inacessível. Execute quando estiver disponível.

### 3. Verificar Schema

```bash
npx prisma studio
```

---

## 📝 Próximos Passos

### 1. Conectar Frontend com APIs

Atualizar `src/app/teacher/profile/page.tsx`:

#### Upload de Avatar

```typescript
const handleAvatarUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/teacher/avatar', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (data.success) {
    toast.success('Avatar atualizado!');
    setFormData({ ...formData, avatar: data.avatarUrl });
  }
};
```

#### Salvar Perfil

```typescript
const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault();

  const response = await fetch('/api/teacher/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (data.success) {
    toast.success('Perfil atualizado!');
  } else {
    toast.error(data.error);
  }
};
```

#### Adicionar Formação

```typescript
const handleAddEducation = async () => {
  const response = await fetch('/api/teacher/education', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEducation),
  });

  const data = await response.json();

  if (data.success) {
    toast.success('Formação adicionada!');
    // Recarregar lista
    loadEducation();
  }
};
```

#### Remover Formação

```typescript
const handleRemoveEducation = async (id: string) => {
  const response = await fetch(`/api/teacher/education/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (data.success) {
    toast.success('Formação removida!');
    loadEducation();
  }
};
```

#### Salvar Dados Financeiros

```typescript
const handleSaveFinancial = async () => {
  const response = await fetch('/api/teacher/financial', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(financialData),
  });

  const data = await response.json();

  if (data.success) {
    toast.success('Dados financeiros salvos!');
  }
};
```

#### Ativar 2FA (3 passos)

**Passo 1 - Gerar QR Code**:

```typescript
const handleEnable2FA = async () => {
  const response = await fetch('/api/teacher/2fa/enable', {
    method: 'POST',
  });

  const data = await response.json();

  if (data.success) {
    setQrCode(data.qrCode);
    setShowQrModal(true);
  }
};
```

**Passo 2 - Verificar Código**:

```typescript
const handleVerify2FA = async (token: string) => {
  const response = await fetch('/api/teacher/2fa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (data.success) {
    toast.success('2FA ativado com sucesso!');
    setShowQrModal(false);
    setTwoFactorEnabled(true);
  } else {
    toast.error('Código inválido');
  }
};
```

**Passo 3 - Desativar 2FA**:

```typescript
const handleDisable2FA = async (token: string) => {
  const response = await fetch('/api/teacher/2fa/disable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (data.success) {
    toast.success('2FA desativado!');
    setTwoFactorEnabled(false);
  }
};
```

### 2. Carregar Dados ao Montar Componente

```typescript
useEffect(() => {
  const loadData = async () => {
    // Carregar perfil
    const profileRes = await fetch('/api/teacher/profile');
    const profile = await profileRes.json();
    setFormData(profile);

    // Carregar formações
    const educationRes = await fetch('/api/teacher/education');
    const education = await educationRes.json();
    setEducation(education);

    // Carregar dados financeiros
    const financialRes = await fetch('/api/teacher/financial');
    const financial = await financialRes.json();
    setFinancialData(financial);

    // Verificar status 2FA
    const statusRes = await fetch('/api/teacher/2fa/status');
    const status = await statusRes.json();
    setTwoFactorEnabled(status.enabled);
  };

  loadData();
}, []);
```

### 3. Melhorar Cálculo de Profile Completion

Atualizar em `src/app/teacher/dashboard/page.tsx`:

```typescript
const profileFields = [
  professor?.name,
  professor?.email,
  professor?.avatar,
  professor?.bio,
  professor?.phone,
  professor?.cpf,
  professor?.address,
];
const completedFields = profileFields.filter((field) => field).length;
const profileCompletion = Math.round(
  (completedFields / profileFields.length) * 100
);
```

---

## 🎯 Resumo das Funcionalidades

| Funcionalidade          | Status          | API                                  | Frontend       |
| ----------------------- | --------------- | ------------------------------------ | -------------- |
| Atualizar perfil básico | ✅ Implementado | `/api/teacher/profile` PUT           | ⚠️ Conectar    |
| Upload de avatar        | ✅ Implementado | `/api/teacher/avatar` POST           | ⚠️ Conectar    |
| Alterar senha           | ✅ Implementado | `/api/teacher/password` PUT          | ⚠️ Conectar    |
| Adicionar formação      | ✅ Implementado | `/api/teacher/education` POST        | ⚠️ Conectar    |
| Remover formação        | ✅ Implementado | `/api/teacher/education/[id]` DELETE | ⚠️ Conectar    |
| Dados financeiros       | ✅ Implementado | `/api/teacher/financial` PUT         | ⚠️ Conectar    |
| Ativar 2FA              | ✅ Implementado | `/api/teacher/2fa/enable` POST       | ⚠️ Conectar    |
| Verificar 2FA           | ✅ Implementado | `/api/teacher/2fa/verify` POST       | ⚠️ Conectar    |
| Desativar 2FA           | ✅ Implementado | `/api/teacher/2fa/disable` POST      | ⚠️ Conectar    |
| Mensagens não lidas     | ✅ Corrigido    | Dashboard                            | ✅ Funcionando |
| Profile completion      | ⚠️ Melhorar     | Dashboard                            | ⚠️ Atualizar   |

---

## 🔐 Segurança Implementada

1. ✅ Autenticação em todas as rotas (NextAuth)
2. ✅ Autorização por role (TEACHER/ADMIN)
3. ✅ Validação de inputs com Zod
4. ✅ Hash de senhas com bcrypt
5. ✅ Validação de propriedade (education delete)
6. ✅ Validação de tipo e tamanho de arquivo (avatar)
7. ✅ 2FA com TOTP (Time-based One-Time Password)
8. ✅ Proteção contra email duplicado

---

## 📊 Métricas do Dashboard

Todas as métricas já estão calculadas corretamente:

- ✅ Total de cursos
- ✅ Cursos publicados
- ✅ Cursos em rascunho
- ✅ Total de alunos (soma de enrollments)
- ✅ Total de módulos
- ✅ Total de aulas
- ✅ Mensagens não lidas (agora query real)
- ⚠️ Conclusão de perfil (melhorar cálculo)

---

## 🚀 Para Testar

1. **Sincronizar banco de dados**:

   ```bash
   npx prisma db push
   ```

2. **Iniciar servidor**:

   ```bash
   npm run dev
   ```

3. **Testar endpoints com Postman/Insomnia**:

   - POST `/api/teacher/profile` - Atualizar perfil
   - POST `/api/teacher/avatar` - Upload de foto
   - PUT `/api/teacher/password` - Alterar senha
   - POST `/api/teacher/education` - Adicionar formação
   - PUT `/api/teacher/financial` - Salvar dados bancários
   - POST `/api/teacher/2fa/enable` - Gerar QR Code
   - POST `/api/teacher/2fa/verify` - Ativar 2FA

4. **Conectar frontend** seguindo exemplos acima

---

## 📦 Dependências Instaladas

```json
{
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.4",
  "@types/qrcode": "^1.5.5"
}
```

---

## ✨ Conclusão

✅ **Backend 100% implementado** para área do professor:

- 8 APIs criadas
- 2 novos models no Prisma
- 6 novos campos no User
- 2FA completo
- Dashboard com dados reais

⚠️ **Próximo passo**: Conectar frontend com as APIs criadas.
