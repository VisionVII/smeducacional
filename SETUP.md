# Guia de Configuração - SM Educacional

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar PostgreSQL

Você tem duas opções:

#### Opção A: PostgreSQL Local
1. Instale o PostgreSQL: https://www.postgresql.org/download/
2. Crie um banco de dados:
```sql
CREATE DATABASE smeducacional;
```

#### Opção B: PostgreSQL Cloud (Supabase/Neon)
1. Crie uma conta gratuita em [Supabase](https://supabase.com) ou [Neon](https://neon.tech)
2. Copie a connection string

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
# Database - Substitua com suas credenciais
DATABASE_URL="postgresql://usuario:senha@localhost:5432/smeducacional?schema=public"

# NextAuth - Gere uma secret key segura
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cole-aqui-uma-string-aleatoria-segura"
```

Para gerar uma `NEXTAUTH_SECRET` segura:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Inicializar Banco de Dados

```bash
# Criar tabelas
npm run db:push

# Popular dados iniciais (opcional)
npx prisma db seed
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 👤 Usuários de Teste

Após executar o seed, você terá:

| Perfil | Email | Senha |
|--------|-------|-------|
| **Admin** | admin@smeducacional.com | admin123 |
| **Professor** | professor@smeducacional.com | teacher123 |
| **Aluno** | aluno@smeducacional.com | student123 |

## 📁 Estrutura de Rotas

```
/                          → Página inicial (pública)
/login                     → Login
/register                  → Cadastro
/courses                   → Catálogo de cursos (em desenvolvimento)

/student/dashboard         → Dashboard do aluno
/student/courses           → Meus cursos (em desenvolvimento)
/student/certificates      → Certificados (em desenvolvimento)

/teacher/dashboard         → Dashboard do professor
/teacher/courses           → Gerenciar cursos (em desenvolvimento)
/teacher/students          → Alunos (em desenvolvimento)

/admin/dashboard           → Dashboard administrativo
/admin/users               → Gerenciar usuários (em desenvolvimento)
/admin/courses             → Gerenciar cursos (em desenvolvimento)
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linter
npm run db:generate  # Gera Prisma Client
npm run db:push      # Sincroniza schema com DB
npm run db:studio    # Abre Prisma Studio (GUI do DB)
npm run db:migrate   # Cria nova migration
```

## 🐛 Troubleshooting

### Erro: "Can't reach database server"
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `npx prisma db pull`

### Erro: "Invalid `prisma.user.findUnique()`"
- Execute: `npm run db:generate`
- Reinicie o servidor

### Página em branco após login
- Limpe o cache do navegador
- Verifique o console do navegador
- Confirme que o NEXTAUTH_SECRET está configurado

### Build falha com erros TypeScript
- Execute: `npm install`
- Delete a pasta `.next` e tente novamente

## 📚 Próximos Passos

1. **Explorar o código**
   - Veja `src/app` para as rotas
   - Veja `prisma/schema.prisma` para o modelo de dados
   - Veja `src/components` para componentes reutilizáveis

2. **Implementar funcionalidades**
   - Player de vídeo
   - Upload de arquivos
   - Sistema de atividades
   - Geração de certificados

3. **Deploy**
   - Vercel (recomendado para Next.js)
   - Railway
   - AWS/Azure/GCP

## 🤝 Contribuindo

Este é um projeto base. Sinta-se livre para:
- Adicionar novas funcionalidades
- Melhorar a UI/UX
- Otimizar performance
- Corrigir bugs

## 📄 Licença

MIT License - use como quiser!

---

**Precisa de ajuda?** Abra uma issue ou consulte a documentação:
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
