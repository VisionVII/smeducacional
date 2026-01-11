# ✅ NOTIFICATIONS IMPLEMENTATION CHECKLIST

## 📋 PRÉ-REQUISITOS

- [ ] Node.js 18+
- [ ] Prisma CLI instalado
- [ ] Banco de dados PostgreSQL
- [ ] RESEND_API_KEY configurada em .env

---

## 🚀 FASE 1: SETUP (2 minutos)

### 1.1 Executar Migration

```bash
npx prisma migrate dev --name add_notification_system
```

- [ ] Migration executada sem erros
- [ ] Tabelas criadas no BD
- [ ] Índices criados

### 1.2 Verificar Schema

- [ ] Model `Notification` existe
- [ ] Model `NotificationPreference` existe
- [ ] Model `NotificationLog` existe
- [ ] Enum `NotificationType` tem 12 tipos

### 1.3 Testar Conexão

```bash
npx prisma db execute --stdin < scripts/test.sql
```

- [ ] Conexão com BD OK
- [ ] Tabelas acessíveis

---

## 🔌 FASE 2: INTEGRAÇÃO NOS ENDPOINTS (2-3 horas)

### 2.1 Integração #1: Checkout Course

**Arquivo:** `src/app/api/checkout/course/route.ts`
**Tempo:** 15 min

- [ ] Import NotificationService adicionado
- [ ] createNotification para ALUNO (COURSE_PURCHASED)
- [ ] createNotification para PROFESSOR (NEW_ENROLLMENT)
- [ ] Ambos com sendEmail: true
- [ ] Testado: aluno vê notification + email

### 2.2 Integração #2: Update Lesson

**Arquivo:** `src/app/api/lessons/[id]/route.ts`
**Tempo:** 20 min

- [ ] Import NotificationService adicionado
- [ ] broadcastNotification para ALUNOS (LESSON_AVAILABLE)
- [ ] Filtro: apenas alunos inscritos
- [ ] sendEmail: true
- [ ] Testado: alunos recebem notificação + email

### 2.3 Integração #3: Webhook Stripe

**Arquivo:** `src/app/api/webhooks/stripe/route.ts`
**Tempo:** 15 min

- [ ] createNotification para PROFESSOR (PAYOUT_READY)
- [ ] createNotification para ADMIN se erro (PAYMENT_ISSUE)
- [ ] sendEmail: true
- [ ] Testado com stripe event simulado

### 2.4 Integração #4: Create Review

**Arquivo:** `src/app/api/reviews/route.ts`
**Tempo:** 10 min

- [ ] createNotification para PROFESSOR (COURSE_REVIEW)
- [ ] Include: nome do aluno, rating, texto review
- [ ] actionUrl aponta para reviews do curso
- [ ] Testado: professor recebe notification + email

### 2.5 Integração #5: Report User

**Arquivo:** `src/app/api/reports/route.ts` (ou similar)
**Tempo:** 10 min

- [ ] createNotification para ADMIN (USER_REPORTED)
- [ ] Include: quem reportou, por quê, contra quem
- [ ] actionUrl aponta para admin panel
- [ ] Testado: admin recebe notification + email

**Subtotal Fase 2:** ~70 min ✓

---

## 🎨 FASE 3: UI (30 minutos)

### 3.1 Integrar NotificationBell

**Arquivo:** `src/components/header.tsx` (ou navbar)
**Tempo:** 5 min

- [ ] Import `NotificationBell` adicionado
- [ ] Componente renderizado na navbar/header
- [ ] Posicionado corretamente
- [ ] Testado: bell icon aparece

### 3.2 Adicionar Link para /notifications

**Arquivo:** Seu menu/navbar
**Tempo:** 5 min

- [ ] Link para `/notifications` adicionado
- [ ] Navegação funciona
- [ ] Testado em mobile também

### 3.3 Verificar Página de Notificações

**Arquivo:** `src/app/notifications/page.tsx`
**Tempo:** 5 min

- [ ] Arquivo existe
- [ ] Página carrega sem erro
- [ ] URL `/notifications` acessível
- [ ] Dark mode funciona

### 3.4 Testar Dark Mode

**Tempo:** 5 min

- [ ] Bell icon legível em light mode
- [ ] Bell icon legível em dark mode
- [ ] Dropdown colorido em dark mode
- [ ] Página /notifications em dark mode

### 3.5 Testar Mobile

**Tempo:** 5 min

- [ ] Bell icon acessível em mobile
- [ ] Dropdown não transborda
- [ ] Página /notifications scrollável
- [ ] Botões com touch targets adequados

**Subtotal Fase 3:** 25 min ✓

---

## 🧪 FASE 4: TESTES (1 hora)

### 4.1 Teste 1: Comprar Curso (Aluno + Professor)

**Tempo:** 15 min

- [ ] Login como ALUNO
- [ ] Comprar um curso
- [ ] Bell icon mostra badge "1"
- [ ] Clique no bell → vê notificação COURSE_PURCHASED
- [ ] Marca como lida → badge desaparece
- [ ] Email recebido no inbox do aluno
- [ ] Login como PROFESSOR
- [ ] Vê notificação NEW_ENROLLMENT sobre o aluno
- [ ] Email recebido no inbox do professor

### 4.2 Teste 2: Atualizar Aula (Alunos)

**Tempo:** 10 min

- [ ] Login como PROFESSOR
- [ ] Vá em um curso que tem alunos inscritos
- [ ] Edite/atualize uma aula
- [ ] Salve
- [ ] Login como ALUNO inscrito
- [ ] Bell icon mostra notificação LESSON_AVAILABLE
- [ ] Email recebido

### 4.3 Teste 3: Preferências (Opt-in/Opt-out)

**Tempo:** 10 min

- [ ] Login como ALUNO
- [ ] Vá em preferências (ou crie modal)
- [ ] Desabilite emails para COURSE_UPDATE
- [ ] Compre outro curso (não deveria receber email)
- [ ] Mas notificação interna deveria aparecer
- [ ] Re-habilite preferência
- [ ] Teste novamente (email deve vir)

### 4.4 Teste 4: Quiet Hours

**Tempo:** 10 min

- [ ] Vá em preferências
- [ ] Ative quiet hours
- [ ] Configure para sua hora atual
- [ ] Faça ação que gera notificação
- [ ] Email NÃO deveria ser enviado
- [ ] Mas notificação interna SIM
- [ ] Desative quiet hours
- [ ] Faça novamente (email deveria vir)

### 4.5 Teste 5: Página /notifications

**Tempo:** 10 min

- [ ] Login como usuário com várias notificações
- [ ] Vá em `/notifications`
- [ ] Página carrega corretamente
- [ ] 4 abas funcionam (Todas, Não Lidas, Lidas, Arquivadas)
- [ ] Paginação funciona
- [ ] Botões (Mark Read, Archive, Delete) funcionam
- [ ] Dark mode funciona
- [ ] Mobile responsive

### 4.6 Teste 6: Contagem de Não Lidas

**Tempo:** 5 min

- [ ] Abra 2 abas do site em diferentes navegadores
- [ ] Receba notificação em uma aba
- [ ] Badge deve aparecer em ambas as abas dentro de 30s
- [ ] Marque como lida em uma aba
- [ ] Badge desaparece em ambas

**Subtotal Fase 4:** ~60 min ✓

---

## 🔍 FASE 5: VERIFICAÇÃO FINAL (15 min)

### 5.1 Verificar Banco de Dados

- [ ] Tabela `notifications` tem registros
- [ ] Tabela `notification_preferences` foi populada
- [ ] Tabela `notification_logs` tem auditoria

### 5.2 Verificar Logs

- [ ] Console não tem erros de TypeScript
- [ ] Network tab mostra chamadas para `/api/notifications/*`
- [ ] Emails foram realmente enviados (verificar inbox/spam)

### 5.3 Verificar Performance

- [ ] Página `/notifications` carrega em <1s
- [ ] Bell icon atualiza em ~30s (como esperado)
- [ ] Sem erros de memory leak

### 5.4 Verificar Segurança

- [ ] Deslogado: não consegue acessar `/api/notifications`
- [ ] Aluno não vê notificações de outro aluno
- [ ] Professor não vê notificações de aluno
- [ ] Admin vê suas próprias notificações apenas

**Subtotal Fase 5:** 15 min ✓

---

## 📊 RESUMO DE TEMPOS

| Fase           | Tempo   | Status |
| -------------- | ------- | ------ |
| 1. Setup       | 2 min   | ⏱️     |
| 2. Integração  | 70 min  | ⏱️     |
| 3. UI          | 25 min  | ⏱️     |
| 4. Testes      | 60 min  | ⏱️     |
| 5. Verificação | 15 min  | ⏱️     |
| **TOTAL**      | **~3h** | 🎯     |

---

## 🎯 CRITÉRIO DE SUCESSO

- [ ] ✅ Migration executada
- [ ] ✅ 5 endpoints integrados
- [ ] ✅ UI adicionada e funcionando
- [ ] ✅ Notificações aparecendo
- [ ] ✅ Emails sendo enviados
- [ ] ✅ Tudo testado end-to-end
- [ ] ✅ Sem erros no console
- [ ] ✅ Dark mode funcionando
- [ ] ✅ Mobile responsivo
- [ ] ✅ Segurança verificada

---

## 🚨 TROUBLESHOOTING RÁPIDO

| Problema                | Solução                               |
| ----------------------- | ------------------------------------- |
| Migration falha         | `npx prisma migrate reset`            |
| "Módulo não encontrado" | `npm install`                         |
| Notificação não aparece | Verificar auth, recarregar página     |
| Email não chega         | Verificar RESEND_API_KEY, spam folder |
| TypeScript error        | Reload VSCode                         |
| Bell icon branco        | Verificar dark mode class no parent   |

---

## 📝 NOTAS

### Setup

- Migration leva ~30s
- Criará 3 tabelas + 1 enum

### Integração

- Sempre adicionar `sendEmail: true` se quiser enviar email
- Use `broadcastNotification` para múltiplos usuários
- Sempre include o `actionUrl` para ação contextual

### UI

- Bell icon usa polling (30s)
- Se precisar real-time, considerar WebSocket
- Dark mode funcionando via classe `.dark` no `html`

### Testes

- Sempre testar em light + dark mode
- Sempre testar em desktop + mobile
- Sempre verificar inbox + spam

---

## ✨ DICAS EXTRAS

1. **Customizar ícones:** Edite `getNotificationIcon()` em `notification-bell.tsx`
2. **Customizar cores:** Edite classes Tailwind em componentes
3. **Adicionar som:** Descomente `inSystemSound` e adicione `new Audio(...).play()`
4. **Real-time:** Considere WebSocket depois (Socket.io)
5. **Digest email:** Implementar job que envia resumo diário

---

## 📞 PRÓXIMOS PASSOS APÓS CONCLUSÃO

1. **Monitorar:** Verificar logs de notificações em produção
2. **Feedback:** Coletar feedback de usuários
3. **Melhorias:** Adicionar mais tipos de notificações conforme necessário
4. **Real-time:** Migrar para WebSocket se performance exigir
5. **Mobile:** Adicionar push notifications nativas

---

**Imprime este checklist e marca conforme avança! 📋**

**Desenvolvido com excelência pela VisionVII — Inovação e Transformação Digital**

Data: ******\_\_\_\_******  
Responsável: ******\_\_\_\_******  
Status: ☐ INICIADO ☐ EM PROGRESSO ☐ CONCLUÍDO ✅
