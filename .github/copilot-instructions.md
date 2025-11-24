# Sistema Escolar - Instruções de Desenvolvimento

## Tecnologias Principais
- Next.js 14+ (App Router)
- TypeScript
- Prisma ORM + PostgreSQL
- NextAuth.js
- Tailwind CSS + Shadcn/ui
- React Hook Form + Zod
- TanStack Query
- Zustand

## Padrões de Código
- Usar TypeScript rigoroso
- Componentização reutilizável
- Clean Architecture
- Nomenclatura em inglês para código
- Comentários em português quando necessário
- Validações com Zod em todos os formulários
- Tratamento de erros consistente

## Estrutura de Pastas
```
/src
  /app - Rotas Next.js App Router
  /components - Componentes reutilizáveis
  /lib - Utilitários e configurações
  /hooks - Custom hooks
  /types - TypeScript types
  /prisma - Schema e migrations
```

## Checklist de Desenvolvimento

- [x] Criar arquivo copilot-instructions.md
- [x] Scaffoldar projeto Next.js
- [x] Configurar banco de dados e Prisma
- [x] Implementar autenticação com NextAuth
- [x] Criar estrutura de componentes UI
- [x] Implementar área do aluno
- [x] Implementar área do professor
- [x] Implementar área do administrador
- [x] Compilar e testar projeto

## Status do Projeto

✅ **Projeto criado com sucesso!**

### Estrutura Implementada

#### Autenticação
- ✅ Login com NextAuth.js
- ✅ Registro de usuários
- ✅ Middleware de proteção de rotas
- ✅ Três perfis: STUDENT, TEACHER, ADMIN

#### Banco de Dados
- ✅ Schema Prisma completo
- ✅ Modelos: User, Course, Module, Lesson, Enrollment, Progress, Certificate, etc.
- ✅ Seed script para popular dados iniciais

#### Áreas Implementadas

**Área do Aluno** (`/student`)
- Dashboard com estatísticas
- Lista de cursos matriculados
- Progresso de aprendizagem
- Sistema de certificados

**Área do Professor** (`/teacher`)
- Dashboard com métricas
- Gerenciamento de cursos
- Lista de alunos
- Sistema de mensagens

**Área do Administrador** (`/admin`)
- Dashboard geral do sistema
- Gestão de usuários
- Gestão de cursos
- Relatórios e analytics

### Próximos Passos

Para continuar o desenvolvimento:

1. **Configurar banco de dados PostgreSQL**
2. **Executar migrations**: `npm run db:push`
3. **Popular dados iniciais**: `npx prisma db seed`
4. **Iniciar servidor**: `npm run dev`

### Funcionalidades a Implementar

- [ ] Player de vídeo com controle de progresso
- [ ] Upload de arquivos (vídeos, materiais)
- [ ] Sistema de atividades e provas
- [ ] Geração de certificados em PDF
- [ ] Sistema de notificações em tempo real
- [ ] Chat/mensagens entre usuários
- [ ] Relatórios e analytics avançados
- [ ] Sistema de pagamentos
- [ ] Calendário acadêmico
- [ ] FAQ e Central de Ajuda
- [ ] Página pública de catálogo de cursos

