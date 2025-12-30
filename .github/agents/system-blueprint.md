# 📘 System Blueprint & Scalability Manifesto (E-Learning)

Este documento define a arquitetura técnica e as diretrizes de portabilidade para o enxame de agentes.

## 🏗️ 1. Arquitetura de Desacoplamento (Anti-Lock-in)

Para garantir que possamos migrar de Vercel/Supabase no futuro sem reescrever o sistema:

- **Service Pattern:** Toda lógica do Prisma e Supabase deve estar em arquivos `.service.ts`. As API Routes chamam serviços, elas não tocam no banco diretamente.
- **Provider Abstraction:** O Agente Fullstack deve criar interfaces para Upload de Arquivos. Se mudarmos de Supabase Storage para S3, mudamos apenas o Provider, não o componente.
- **Environment Agnostic:** Nenhuma URL ou Segredo deve ser "hardcoded". Use estritamente o `process.env`.

## 💻 2. Stack & Padrões de Código

- **Frontend:** Next.js 15+ (Turbopack), Shadcn/UI, TanStack Query.
- **Backend:** API Routes (REST). Proibido usar Server Actions para manter compatibilidade com possíveis backends separados (Go/Python) no futuro.
- **Validation:** Zod é obrigatório em 100% das entradas de API (Server-side).
- **ORM:** Prisma 5.22+ (Sempre rodar `db:generate` antes de sugerir código).

## 🗄️ 3. Regras de Banco de Dados (Prisma)

- **Naming:** `course` usa `isPublished` e `instructorId`.
- **Relacionamentos:** Sempre usar transações (`$transaction`) para operações que afetam múltiplas tabelas (ex: Compra de curso + Matrícula).
- **Performance:** Selecionar apenas campos necessários (`select: { id: true, name: true }`).

## 🛡️ 4. Segurança e Compliance

- **Auth:** NextAuth v4 (JWT/RBAC). Roles: `STUDENT`, `TEACHER`, `ADMIN`.
- **Secrets:** Nunca expor chaves sem o prefixo `NEXT_PUBLIC_`.
- **Payments:** Fluxos de Stripe devem ser idênticos em Dev e Prod, mudando apenas as Secret Keys.

## 🚀 5. Plano de Escalabilidade (Futuro)

Os agentes devem estar preparados para:

1. **Redis:** Substituir o rate limiting in-memory por Redis.
2. **Docker:** Todo código deve ser "Dockerizável" (sem dependências de SO local).
3. **Storage:** Suporte a múltiplos buckets via variáveis de ambiente.

## 📧 6. Módulo de Comunicação (Resend)

- **Service Pattern:** Todo envio de e-mail passa por `EmailService.ts`; controllers e rotas não chamam Resend diretamente.
- **Segurança:** Nunca incluir senhas em texto plano ou dados de pagamento nos templates; use apenas IDs de transação/recibos.
- **Templates:** Usar componentes React de e-mail responsivos alinhados ao Design System (ver frontend-design.md); prever rota interna de preview para validação visual.
- **Dev:** Redirecionar e-mails para caixa de teste (Mailtrap ou endereço único) para evitar disparos reais.
- **Prod:** Envio assíncrono (fila/trabalho em segundo plano) para não bloquear API; logs de entrega críticos em `NotificationLogs` (boas-vindas, reset, recibo).
- **Domínio e Chaves:** `from` deve usar domínio verificado; `RESEND_API_KEY` somente em ambiente seguro (Vercel/cofre).

## 🛠️ 7. Módulo Administrativo & Governança (RBAC Avançado)

- **Data Isolation:** Todas as API Routes de gerenciamento devem validar `instructorId` para impedir TEACHER de acessar dados de outro instrutor.
- **Audit Trail:** Alterações de status financeiro ou de acesso devem registrar log via `AuditService.ts` (userId, action, targetId, timestamp).
- **Safety First:** Painel Admin não deve expor hard delete; usar soft delete (`isDeleted` ou `deletedAt`).
- **Scalability:** Dashboards devem selecionar apenas campos necessários (\_sum, \_count ou selects específicos) para evitar sobrecarga de memória.
