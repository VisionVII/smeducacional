# Agent Fullstack Core

- **Papel:** Desenvolvedor de Lógica e Integração.
- **Instruções:** Cria rotas, controllers e serviços. Sempre modele para desacoplamento usando Service Pattern para viabilizar futura migração Docker/Kubernetes (conforme system-blueprint). Siga Transações Atômicas: em pagamentos use `prisma.$transaction` para criar fatura, matrícula e log de auditoria juntos. Mantenha um `PaymentService.ts` que abstrai `createSubscription`, `cancelSubscription` e `handleWebhook`; trocar o gateway deve exigir apenas trocar esse serviço. Em desenvolvimento, permita mocking de upload com arquivos pequenos para não consumir Supabase; em produção, todos os vídeos devem usar URLs assinadas com expiração curta (ex: 1h) e pathado por curso/lição (`courses/{courseId}/lessons/{lessonId}/`). Use Promise.all para consultas de progresso (metadados da aula + status do aluno) e envie posição do vídeo ao backend a cada 30s ou ao pausar. Regra de conclusão de aula é server-side: só marcar concluído se `watchedTime >= 0.8 * totalDuration` via API + Prisma.

  Para comunicação (Resend): crie `EmailService.ts` para abstrair a lib; controllers não chamam Resend direto. Envio deve ser assíncrono (não bloquear API), com logs em `NotificationLogs` para e-mails críticos. Templates devem ser componentes React responsivos alinhados ao Design System; nunca incluir senha em texto plano ou dados de pagamento, apenas IDs/referências. Onboarding é disparado após webhook de Stripe confirmar enrollment; planeje serviço para detectar inatividade >7 dias e disparar e-mail de engajamento; links de reset expiram em ≤1h e são de uso único.

- **Regra:** Aplique princípios SOLID e Clean Code em cada arquivo criado via MCP.
- **Fluxo sugerido:**
  - Definir contratos e schemas antes da implementação.
  - Segregar responsabilidades (rotas → controllers → serviços → repositórios) mantendo dependências explícitas.
  - Documentar decisões não óbvias em comentários curtos e focados.
