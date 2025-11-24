# Sistema Escolar Moderno

Sistema completo de gerenciamento escolar com áreas distintas para Alunos, Professores e Administradores.

## 🚀 Tecnologias

- **Next.js 14+** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **NextAuth.js** - Autenticação
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **TanStack Query** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado cliente
- **React Hook Form + Zod** - Formulários e validação

## 📋 Funcionalidades

### Autenticação
- ✅ Login/Logout
- ✅ Recuperação de senha
- ✅ Sessões seguras
- ✅ Middleware de autorização por perfil

### Área do Aluno
- 📚 Dashboard com cursos matriculados
- 📊 Progresso em tempo real
- 🎥 Player de vídeo com controle de progresso
- 📄 Download de materiais
- 🎓 Certificados automáticos
- 💬 Sistema de suporte

### Área do Professor
- 📈 Dashboard de engajamento
- ✏️ CRUD completo de cursos, módulos e aulas
- 📤 Upload de vídeos e materiais
- 📝 Criação e correção de atividades
- 💬 Comunicação com alunos
- 📊 Relatórios de aprendizagem

### Área do Administrador
- 👥 Gerenciamento completo de usuários
- 📚 Gerenciamento de cursos e categorias
- 💳 Controle de matrículas e pagamentos
- 📊 Dashboard com KPIs
- ⚙️ Configurações do sistema
- 📋 Logs e auditoria

### Extras
- 🔔 Sistema de notificações
- 📝 Atividades e provas
- ⭐ Sistema de notas e feedback
- 📅 Calendário acadêmico
- ❓ FAQ e Central de Ajuda
- 📱 Totalmente responsivo
- 🌓 Dark/Light mode
- 🔒 GDPR compliance

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd smeducacional
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o banco de dados PostgreSQL e atualize a `DATABASE_URL` no `.env`

5. Execute as migrations do Prisma:
```bash
npm run db:push
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

7. Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
/src
  /app              # Rotas Next.js App Router
    /(auth)         # Rotas de autenticação
    /(dashboard)    # Dashboards protegidos
    /api            # API Routes
  /components       # Componentes reutilizáveis
    /ui             # Componentes Shadcn/ui
    /forms          # Componentes de formulários
  /lib              # Utilitários e configurações
    /auth           # Configuração NextAuth
    /db             # Prisma client
    /validations    # Schemas Zod
  /hooks            # Custom hooks
  /types            # TypeScript types
  /stores           # Zustand stores
/prisma
  schema.prisma     # Schema do banco de dados
```

## 🗃️ Schema do Banco de Dados

O sistema possui as seguintes entidades principais:
- **User** - Usuários do sistema (alunos, professores, admins)
- **Course** - Cursos disponíveis
- **Module** - Módulos dentro dos cursos
- **Lesson** - Aulas dentro dos módulos
- **Enrollment** - Matrículas dos alunos
- **Progress** - Progresso dos alunos
- **Certificate** - Certificados emitidos
- **Activity** - Atividades e provas
- **Grade** - Notas e feedback
- **Notification** - Notificações do sistema

## 🔐 Perfis de Usuário

- **STUDENT** - Acesso à área do aluno
- **TEACHER** - Acesso à área do professor
- **ADMIN** - Acesso total ao sistema

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento com Turbopack
- `npm run build` - Build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa ESLint
- `npm run db:generate` - Gera Prisma Client
- `npm run db:push` - Sincroniza schema com DB
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:migrate` - Cria nova migration

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.
