# ✅ Checklist Completo - Vercel Deployment

## 📋 Fase 1: Pré-Deploy (Local)

- [ ] Build local passa: `npm run build`
- [ ] Banco de dados funcionando localmente: `npm run db:push`
- [ ] Todas as mudanças commitadas: `git log --oneline -5`
- [ ] Repositório sincronizado: `git push origin main`
- [ ] Arquivo `vercel.json` na raiz do projeto

## 📋 Fase 2: Vercel Dashboard Setup

### 2.1 Criar Projeto

- [ ] Acessar https://vercel.com/dashboard
- [ ] Clicar em "Add New" → "Project"
- [ ] Selecionar repositório `smeducacional`
- [ ] Confirmar Build Command: `npm run build`
- [ ] Confirmar Output Directory: `.next`

### 2.2 Environment Variables (Production)

- [ ] DATABASE_URL (Postgres gerenciado)
- [ ] NEXTAUTH_URL (domínio Vercel ou customizado)
- [ ] NEXTAUTH_SECRET (gerado)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (chave pública Stripe)
- [ ] STRIPE_SECRET_KEY (chave secreta Stripe)
- [ ] STRIPE_WEBHOOK_SECRET (webhook secret Stripe)
- [ ] STRIPE_PRICE_ID_STUDENT_MONTHLY (ID do preço estudante)
- [ ] STRIPE_PRICE_ID_TEACHER_MONTHLY (ID do preço professor)
- [ ] RESEND_API_KEY (chave da API Resend)
- [ ] NEXT_PUBLIC_FROM_EMAIL (email verificado Resend)
- [ ] CRON_SECRET (gerado para cron jobs)

### 2.3 Preview Environment (opcional)

- [ ] Copiar as mesmas vars para Preview (exceto DATABASE_URL em sandbox se preferir)

## 📋 Fase 3: Serviços Externos

### 3.1 Banco de Dados

- [ ] Provisionar Postgres (Supabase, Railway, Render, AWS RDS, Azure Database)
- [ ] Copiar DATABASE_URL
- [ ] Testar conexão localmente: `psql $DATABASE_URL -c "SELECT 1"`
- [ ] Executar migrations:
  ```bash
  npm run db:push
  ```
- [ ] (Opcional) Popular dados iniciais:
  ```bash
  npm run db:seed
  ```

### 3.2 Stripe

- [ ] Conta Stripe criada (https://stripe.com)
- [ ] 2 Produtos criados:
  - [ ] Student Subscription (monthly)
  - [ ] Teacher Subscription (monthly)
- [ ] Copiar chaves: Publishable e Secret
- [ ] Copiar Price IDs dos 2 produtos

### 3.3 Resend

- [ ] Conta Resend criada (https://resend.com)
- [ ] Domínio verificado (ou usar `onboarding@resend.dev` para testes)
- [ ] API Key gerada
- [ ] Email verificado (`NEXT_PUBLIC_FROM_EMAIL`)

### 3.4 NextAuth

- [ ] NEXTAUTH_SECRET gerado (comando acima)
- [ ] NEXTAUTH_URL = domínio Vercel

### 3.5 Stripe Webhook

- [ ] Acessar https://dashboard.stripe.com/webhooks
- [ ] Clique "Add an endpoint"
- [ ] URL: `https://seu-app.vercel.app/api/webhooks/stripe`
- [ ] Eventos selecionados:
  - [ ] `checkout.session.completed`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Copiar Signing Secret como `STRIPE_WEBHOOK_SECRET`

## 📋 Fase 4: Deploy Inicial

- [ ] Vercel inicia build automaticamente após push
- [ ] Acompanhar logs: https://vercel.com/dashboard/project/smeducacional
- [ ] Build completa com sucesso (sem erros vermelhos)
- [ ] Deployment finalizado (blue checkmark ✅)

## 📋 Fase 5: Testes Pós-Deploy

### 5.1 Health Checks

- [ ] Homepage carrega: `https://seu-app.vercel.app`
- [ ] Sem erros 500 na console
- [ ] Logs do Vercel mostram "Deployment Successful"

### 5.2 Funcionalidade de Autenticação

- [ ] Login page acessa: `/login`
- [ ] Criar novo usuário (signup)
- [ ] Email de boas-vindas chega (Resend)
- [ ] Fazer login com credenciais

### 5.3 Fluxo de Pagamento

- [ ] Acessar página de cursos: `/courses`
- [ ] Clicar "Comprar" ou "Subscribe"
- [ ] Stripe checkout modal aparece
- [ ] Usar cartão de teste Stripe: `4242 4242 4242 4242` (expiração futura, CVC aleatório)
- [ ] Confirmar pagamento
- [ ] Redirecionado para `/checkout/success?session_id=...`
- [ ] Email de confirmação de pagamento chega

### 5.4 Verificação de Dados

- [ ] Dashboard Admin abre sem erros: `/admin/dashboard`
- [ ] Analytics de pagamento aparecem
- [ ] Payment table mostra transação recente
- [ ] System Logs mostram eventos

### 5.5 Cron Jobs

- [ ] Testar manualmente:
  ```bash
  curl -X POST https://seu-app.vercel.app/api/cron/remarketing \
    -H "Authorization: Bearer <CRON_SECRET>" \
    -H "Content-Type: application/json"
  ```
- [ ] Resposta: `{ "success": true, ... }`
- [ ] Verificar Logs no Vercel (DevTools → Network → POST /api/cron/remarketing)
- [ ] Sistema Logs mostra entradas de cron

### 5.6 Verificar Emails

- [ ] Dashboard Resend: https://resend.com/emails
- [ ] Todos os 5 tipos de email aparecem como "Sent":
  - [ ] Welcome Email
  - [ ] Payment Success
  - [ ] Payment Failed (se houve falha)
  - [ ] Pending Invoice
  - [ ] Subscription Renewal

## 📋 Fase 6: Monitoramento Contínuo

- [ ] Configurar Vercel Analytics (opcional)
- [ ] Configurar alertas de erros (opcional)
- [ ] Monitorar tráfego e performance
- [ ] Verificar logs regularmente
- [ ] Testar pagamentos real 1x por semana

## 📋 Troubleshooting Rápido

| Problema             | Verificar                         | Solução                                       |
| -------------------- | --------------------------------- | --------------------------------------------- |
| Build falha          | Logs Vercel                       | `npm run build` local; corrigir erros TS      |
| Banco inacessível    | DATABASE_URL                      | Testar localmente; firewall/VPC aberto        |
| 500 na homepage      | Logs Vercel                       | Erro de env var? Deploy build com problema    |
| Emails não chegam    | Resend dashboard                  | API key correta? Domínio verificado?          |
| Webhook Stripe falha | Stripe dashboard (Webhook Events) | URL correta? STRIPE_WEBHOOK_SECRET?           |
| Cron não dispara     | Vercel logs + Stripe dashboard    | Cron secret correto? Schedule em vercel.json? |

## 🎉 Após Tudo Passar

- [ ] Domínio customizado (Settings → Domains)
- [ ] Auto-redeployment em PRs (Settings → Deploy → Git)
- [ ] Backups automáticos do banco
- [ ] Monitoramento de performance (New Relic/DataDog)
- [ ] Documentar senhas em gerenciador seguro

---

**Última atualização**: 8 de dezembro de 2025
**Status**: Pronto para produção ✅
