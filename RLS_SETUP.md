# Row Level Security (RLS) - Configuração

## 📋 Sobre

Este documento explica a configuração de Row Level Security (RLS) no Supabase para proteger os dados da plataforma educacional.

## ⚠️ Problema Identificado

O Supabase detectou que 16 tabelas estavam públicas sem RLS habilitado:
- `users`
- `courses`
- `categories`
- `modules`
- `lessons`
- `enrollments`
- `progress`
- `certificates`
- `activities`
- `messages`
- `notifications`
- `activity_logs`

## 🔒 Solução Implementada

### 1. RLS Habilitado em Todas as Tabelas

Todas as tabelas agora têm Row Level Security ativo, garantindo que apenas usuários autorizados possam acessar dados específicos.

### 2. Políticas de Segurança por Tipo de Usuário

#### **STUDENT (Aluno)**
- ✅ Ver próprio perfil
- ✅ Ver cursos publicados
- ✅ Matricular-se em cursos
- ✅ Ver aulas de cursos matriculados
- ✅ Ver e atualizar próprio progresso
- ✅ Ver próprios certificados
- ✅ Enviar e receber mensagens
- ✅ Ver próprias notificações

#### **TEACHER (Professor)**
- ✅ Ver próprio perfil
- ✅ Criar e gerenciar próprios cursos
- ✅ Criar módulos e aulas
- ✅ Ver matrículas em seus cursos
- ✅ Ver progresso de alunos em seus cursos
- ✅ Criar atividades em seus cursos
- ✅ Enviar e receber mensagens

#### **ADMIN (Administrador)**
- ✅ Acesso completo a todas as tabelas
- ✅ Gerenciar categorias
- ✅ Gerenciar todos os cursos
- ✅ Ver todos os logs de atividade
- ✅ Matricular alunos manualmente
- ✅ Acesso total ao sistema

### 3. Políticas Públicas Específicas

Algumas operações são públicas por necessidade:
- Ver cursos publicados (catálogo público)
- Ver perfis de professores (para exibir informações do instrutor)
- Ver categorias (navegação pública)
- Ver aulas gratuitas (preview de conteúdo)
- Verificar certificados por código (validação pública)

## 🚀 Como Aplicar

### Passo 1: Acessar Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Entre no projeto **SM Educacional**
3. Vá em **SQL Editor** no menu lateral

### Passo 2: Executar Script
1. Clique em **New Query**
2. Copie todo o conteúdo do arquivo `enable-rls-policies.sql`
3. Cole no editor SQL
4. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 3: Verificar
1. Vá em **Authentication** > **Policies**
2. Verifique se todas as políticas foram criadas
3. Acesse **Table Editor** e confirme que RLS está habilitado (ícone de cadeado verde)

## 📝 Notas Importantes

### Autenticação com Supabase
As políticas usam `auth.uid()` que retorna o ID do usuário autenticado no Supabase. 

**Importante:** Atualmente o projeto usa NextAuth.js, então você tem duas opções:

#### Opção A: Manter NextAuth + Adicionar Bypass Service Role
Para usar NextAuth e acessar dados do Supabase, você precisa usar a **Service Role Key** nas chamadas do servidor:

```typescript
// lib/db.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypassa RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

#### Opção B: Migrar para Supabase Auth (Recomendado)
Para aproveitar totalmente o RLS, considere migrar de NextAuth para Supabase Auth:

```typescript
// Exemplo de migração
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Login
await supabase.auth.signInWithPassword({
  email,
  password,
})

// As políticas RLS funcionarão automaticamente
const { data } = await supabase
  .from('courses')
  .select('*')
  .eq('instructorId', user.id)
```

### Para Este Projeto Específico

Como estamos usando NextAuth, vamos manter e adicionar suporte à Service Role Key:

1. No Supabase Dashboard, vá em **Settings** > **API**
2. Copie a **service_role key** (secret)
3. Adicione no `.env`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

4. Use `supabaseAdmin` em vez de `prisma` nas rotas de API que precisam bypasuar RLS

## ✅ Benefícios

- **Segurança**: Dados protegidos no nível do banco
- **Performance**: Filtros executados no banco, não na aplicação
- **Auditoria**: Controle fino sobre quem acessa o quê
- **Compliance**: Atende requisitos de privacidade (LGPD)

## 🔄 Próximos Passos

Após aplicar o RLS, você pode:
1. ✅ Testar acesso com diferentes usuários
2. ✅ Verificar logs de erro no Supabase
3. ✅ Ajustar políticas se necessário
4. ✅ Considerar migração para Supabase Auth no futuro

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
