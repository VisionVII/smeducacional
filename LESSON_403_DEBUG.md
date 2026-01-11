# 🔐 Debug: Erro 403 ao Salvar Texto do Módulo/Lição

## ❌ Erro Relatado

```
Failed to load resource: the server responded with a status of 403 (Forbidden)
Contexto: ao salvar texto do módulo do curso
```

## 🎯 Causa do Erro 403

Erro **403 Forbidden** significa que você **NÃO tem permissão** para editar essa lição. Isso acontece quando:

1. ❌ Você não é o **instrutor do curso** que contém essa lição
2. ❌ Você não é **ADMIN**
3. ❌ Você está logado com um usuário diferente do criador do curso

---

## 📊 Logs Implementados

Adicionei logs detalhados em `/api/lessons/[id]` (PUT) para identificar o problema exato:

### **Logs do Servidor:**

```typescript
✅ [Lessons/Update] Iniciando atualização de lição: { userId, userRole }
✅ [Lessons/Update] Buscando lição: { lessonId }
✅ [Lessons/Update] Lição encontrada: {
  lessonId,
  instructorId,        // ID do dono do curso
  currentUserId,       // SEU ID
  userRole
}
✅ [Lessons/Update] Verificação de permissões: {
  isInstructor,        // true se você é o dono
  isAdmin,             // true se você é admin
  hasPermission        // true se tem permissão
}

❌ [Lessons/Update] ACESSO NEGADO - Sem permissão: {
  courseInstructorId,    // Quem criou o curso
  attemptingUserId,      // Quem está tentando editar (VOCÊ)
  attemptingUserEmail,   // Seu email
  attemptingUserRole     // Seu role
}
```

---

## 🔍 Como Debugar

### **PASSO 1: Abra o Terminal do Servidor**

```
Onde você rodou: npm run dev
```

### **PASSO 2: Tente Salvar o Texto**

1. Vá para a página de edição da lição
2. Digite algum texto no editor
3. Clique em "Salvar"
4. **Aguarde o erro 403 aparecer**

### **PASSO 3: Analise os Logs**

Procure por `[Lessons/Update]` no terminal. Você verá algo como:

```
[Lessons/Update] Iniciando atualização de lição: {
  userId: 'user_abc123',
  userRole: 'TEACHER'
}

[Lessons/Update] Lição encontrada: {
  lessonId: 'lesson_xyz',
  instructorId: 'user_DIFFERENT',    // ← DIFERENTE!
  currentUserId: 'user_abc123',
  userRole: 'TEACHER'
}

[Lessons/Update] Verificação de permissões: {
  isInstructor: false,    // ← FALSO!
  isAdmin: false,
  hasPermission: false    // ← SEM PERMISSÃO!
}

❌ [Lessons/Update] ACESSO NEGADO - Sem permissão: {
  courseInstructorId: 'user_DIFFERENT',
  attemptingUserId: 'user_abc123',
  attemptingUserEmail: 'seu@email.com',
  attemptingUserRole: 'TEACHER'
}
```

---

## 🛠️ Soluções Possíveis

### **SOLUÇÃO 1: Login com o Usuário Correto** ✅

Se você criou o curso com um email/usuário e está tentando editar com outro:

1. Faça **logout**
2. Faça **login com o email do instrutor do curso**
3. Tente salvar novamente

**Como descobrir qual email criou o curso?**

```sql
-- Execute no banco de dados
SELECT
  c.id as course_id,
  c.title as course_title,
  u.email as instructor_email,
  u.name as instructor_name
FROM courses c
JOIN users u ON c.instructorId = u.id
WHERE c.id = 'SEU_COURSE_ID';
```

### **SOLUÇÃO 2: Tornar-se Admin** ✅

Se você é o dono do sistema e quer acessar tudo:

```sql
-- Execute no banco de dados
UPDATE users
SET role = 'ADMIN'
WHERE email = 'seu@email.com';
```

Depois faça **logout e login novamente** para a sessão atualizar.

### **SOLUÇÃO 3: Transferir Ownership do Curso** ✅

Se você quer transferir o curso para outro instrutor:

```sql
-- Execute no banco de dados
UPDATE courses
SET instructorId = 'SEU_USER_ID'
WHERE id = 'COURSE_ID';
```

---

## 📋 Checklist de Diagnóstico

Copie os logs do terminal e responda:

```
=== INFORMAÇÕES DO USUÁRIO ===
Seu email atual: [ ]
Seu role atual: [ ] (TEACHER / ADMIN / STUDENT)
Seu userId: [ ]

=== INFORMAÇÕES DO CURSO ===
ID do curso: [ ]
Título do curso: [ ]
instructorId do curso: [ ]
Email do instrutor: [ ]

=== LOGS DO TERMINAL ===
[Cole aqui os logs [Lessons/Update]]

=== COMPARAÇÃO ===
attemptingUserId === courseInstructorId? [ ] (true / false)
```

---

## 🎯 Fluxo de Verificação de Permissão

```
Cliente tenta salvar lição
    ↓
Auth() → Pega session.user
    ↓
Busca Lesson → Module → Course
    ↓
Compara: course.instructorId === session.user.id?
    ↓
  SIM                NÃO
    ↓                 ↓
✅ Permitido      É ADMIN?
                      ↓
                   SIM    NÃO
                    ↓      ↓
                ✅      ❌ 403
                Permitido  NEGADO
```

---

## 🔐 Regras de Permissão

Para editar uma lição, você precisa ser:

1. **O instrutor do curso** que contém a lição, **OU**
2. **ADMIN** do sistema

**NÃO é suficiente:**

- ❌ Ser apenas TEACHER (se não for o dono do curso)
- ❌ Estar matriculado no curso como aluno
- ❌ Ter acesso a outros cursos

---

## 💡 Dica de Desenvolvimento

Se você está desenvolvendo e testando com múltiplos usuários:

1. **Crie um usuário ADMIN** para testes
2. **Use esse usuário para criar cursos**
3. **Ou faça seu usuário atual virar ADMIN**

```sql
-- Tornar seu usuário admin
UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';

-- Verificar
SELECT id, name, email, role FROM users WHERE email = 'seu@email.com';
```

---

## 🚀 Próximos Passos

1. **Abra o terminal do servidor**
2. **Tente salvar o texto da lição**
3. **Copie TODOS os logs `[Lessons/Update]`**
4. **Compartilhe os logs**

Os logs vão mostrar **exatamente**:

- Qual é o SEU userId
- Qual é o instructorId do curso
- Se eles são iguais (permissão)
- Se você é ADMIN

Com essas informações consigo identificar a causa raiz! 🔍
