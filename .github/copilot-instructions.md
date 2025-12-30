# 📘 VisionVII Enterprise Governance 3.0 — Swarm Intelligence

Este documento é a "Constituição" do projeto. Ele revoga instruções anteriores e estabelece o padrão de **Enxame de Agentes** com **Service Pattern** e **Segurança Máxima**.

---

## 🏗️ 1. Hierarquia de Comando (Orquestrador & Agentes)

O Copilot deve agir como o **Orquestrador Central**, delegando tarefas aos agentes especializados em `.github/agents/`:

- **ArchitectAI:** Define padrões de pasta e fluxos.
- **SecureOpsAI:** Audita auth(), roles, Zod e logs de auditoria.
- **DBMasterAI:** Gere schema.prisma, migrations e **Soft Deletes**.
- **DevOpsAI:** Gerencia Docker, Infra, Supabase e Stripe.
- **FullstackAI:** Implementa Services e API Routes (Proibido Server Actions).

---

## 🧱 2. Arquitetura Soberana: Service Pattern (OBRIGATÓRIO)

Diferente das versões anteriores, a lógica de negócio **NÃO** reside na API Route.

- **Camada de Serviço:** Localizada em `src/lib/services/`.
- **Fluxo de Dados:** Client -> API Route (Zod + Auth) -> Service (Lógica + DB) -> Response.
- **Services Mandatórios:** - `AuditService`: Logs de ações administrativas.
  - `PaymentService`: Abstração de Stripe.
  - `EmailService`: Abstração de Resend.
  - `CourseService`: Gestão de conteúdo educacional.

---

## 🛡️ 3. Protocolo de Segurança e "Red Lines" (Anti-Erro)

| Regra         | Padrão Obrigatório                        | Ação em caso de violação                  |
| :------------ | :---------------------------------------- | :---------------------------------------- |
| **Exclusão**  | **SOFT DELETE** (campo `deletedAt`)       | Bloquear `prisma.x.delete()`              |
| **Auditoria** | Chamar `AuditService.logAuditTrail()`     | Notificar falta de log em ações sensíveis |
| **Validação** | Zod `safeParse` em 100% das APIs          | Recusar implementação sem Schema          |
| **RBAC**      | Check de `session.user.role` + Middleware | Bloquear rotas sem proteção de role       |
| **Storage**   | Apenas Supabase Storage (Signed URLs)     | Proibir `fs.writeFile` ou `publicUrl`     |

---

## 🗄️ 4. Diretrizes de Banco de Dados (Prisma)

- **Soft Delete:** Modelos `User`, `Course`, `Module` e `Lesson` utilizam `deletedAt DateTime?`.
- **Queries:** Use `Promise.all` para concorrência e `select` para performance.
- **Naming:** `isPublished` (não published), `instructorId` (não teacher).

---

## 🧪 5. Workflow do Enxame (Modo de Operação)

Sempre que uma tarefa for solicitada:

1. **Análise:** O Orquestrador consulta o `.github/agents/system-blueprint.md`.
2. **Plano:** Lista os arquivos de Service, API e UI que serão afetados.
3. **Execução:** Gera o código seguindo o Service Pattern.
4. **Validação:** O Agente de Segurança verifica se há vulnerabilidades ou Hard Deletes.

---

## ⚡ 6. Regras de Ouro (Nunca Negociáveis)

- ❌ **SERVER ACTIONS:** Terminantemente proibidas. Use API Routes REST.
- ❌ **HARD DELETE:** Proibido deletar registros financeiros, de alunos ou cursos do banco.
- ❌ **LÓGICA NA UI:** Componentes React são apenas para exibição e estado de interface.
- ✅ **TRANSAÇÕES:** Use `prisma.$transaction` em qualquer escrita múltipla.
- ✅ **RESEND/STRIPE:** Use apenas através dos respectivos Services na `lib/services`.

---

Versão: VisionVII 3.0 Enterprise Governance | Dezembro 2025
"Desenvolvido com excelência pela VisionVII — Inovação e Transformação Digital."
