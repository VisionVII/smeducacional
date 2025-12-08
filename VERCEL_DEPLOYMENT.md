# 🚀 Guia de Deployment na Vercel

## 1️⃣ Pré-requisitos

### Banco de Dados

- [ ] Provisione um Postgres gerenciado (Supabase, Railway, RDS, Azure Database for PostgreSQL)
- [ ] Copie a `DATABASE_URL` (formato: `postgresql://user:password@host:5432/db`)
- [ ] Teste a conexão localmente: `npm run db:push`

### Serviços Externos

- [ ] **Stripe**: Crie conta em https://stripe.com

  - Copie as chaves: `STRIPE_SECRET_KEY` e `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Crie 2 produtos com preços:
    - Student subscription (monthly)
    - Teacher subscription (monthly)
  - Copie os Price IDs: `STRIPE_PRICE_ID_STUDENT_MONTHLY`, `STRIPE_PRICE_ID_TEACHER_MONTHLY`

- [ ] **Resend**: Crie conta em https://resend.com

  - Copie a chave: `RESEND_API_KEY`
  - Verifique seu domínio (ou use `onboarding@resend.dev` para testes)
  - `NEXT_PUBLIC_FROM_EMAIL` = seu email verificado (ex: `noreply@seudominio.com`)

- [ ] **NextAuth.js**
  - Gere um `NEXTAUTH_SECRET` seguro:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
  - `NEXTAUTH_URL` = seu domínio Vercel (ex: `https://seu-app.vercel.app`)

### Segurança

- [ ] Gere um `CRON_SECRET` seguro (mesmo comando acima)

---

## 2️⃣ Criar Projeto na Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório `smeducacional` (vincule com GitHub)
4. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (padrão)
   - **Node.js Version**: 20.x (recomendado)

---

## 3️⃣ Definir Variáveis de Ambiente

No dashboard da Vercel, acesse **Settings** → **Environment Variables** e adicione:

### Obrigatórias (Production + Preview)

```
DATABASE_URL=postgresql://user:password@host:5432/db
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=<seu-secret-gerado>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STUDENT_MONTHLY=price_...
STRIPE_PRICE_ID_TEACHER_MONTHLY=price_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_FROM_EMAIL=noreply@seudominio.com
CRON_SECRET=<seu-cron-secret-gerado>
```

### Opcionais (se usar)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

---

## 4️⃣ Preparar o Banco de Dados

Após definir `DATABASE_URL` na Vercel:

1. **Localmente**, teste a conexão:

   ```bash
   npm run db:push
   ```

2. **Na Vercel**, execute migration via console ou script:

   - Opção A: Rodar um script pré-deploy (não está implementado; veja [Prisma + Vercel](https://www.prisma.io/docs/guides/deploy/vercel))
   - Opção B: Rodar localmente com a `DATABASE_URL` de produção antes do deploy

3. **Popular dados iniciais (opcional)**:
   ```bash
   npm run db:seed
   ```

---

## 5️⃣ Configurar Stripe Webhook

1. Acesse https://dashboard.stripe.com/webhooks
2. Clique em **"Add an endpoint"**
3. URL do endpoint: `https://seu-app.vercel.app/api/webhooks/stripe`
4. Selecione eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copie o **Signing Secret** (começa com `whsec_`) e adicione como `STRIPE_WEBHOOK_SECRET` na Vercel

---

## 6️⃣ Deploy

1. **Commit & Push** o código com `vercel.json` (já incluso):

   ```bash
   git add .
   git commit -m "chore: add vercel config and deployment files"
   git push origin main
   ```

2. **Na Vercel**, o deployment inicia automaticamente
3. **Acompanhe os logs** → Build deve completar em ~30s-1min

---

## 7️⃣ Testes Pós-Deploy

### 7.1 Verificar Build

- [ ] Logs do Vercel mostram "Build Successful"
- [ ] Não há erros de tipo TypeScript

### 7.2 Testar Funcionalidades

- [ ] Acessar homepage: `https://seu-app.vercel.app`
- [ ] Registrar novo usuário → receber welcome email (Resend)
- [ ] Fazer login
- [ ] Testar checkout (curso/subscrição)
  - Stripe deve criar a sessão
  - Webhook deve processar e criar enrollment/pagamento
  - Email de confirmação deve chegar
- [ ] Testar cron manualmente:
  ```bash
  curl -X POST https://seu-app.vercel.app/api/cron/remarketing \
    -H "Authorization: Bearer <seu-CRON_SECRET>"
  ```
  - Deve retornar `{ "success": true, ... }`
  - Verificar Logs no Vercel

### 7.3 Verificar Emails

- [ ] Dashboard Resend → "Sent" mostra emails enviados
- [ ] Testar inbox (use um email real se não estiver em modo development)

---

## 8️⃣ Troubleshooting

| Problema                                | Solução                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| Build falha com erro de tipo TypeScript | Verificar `npm run build` localmente; commit das correções                           |
| Banco inacessível                       | Testar `DATABASE_URL` localmente; confirmar firewall/vnet no provedor                |
| Emails não chegam                       | Verificar `RESEND_API_KEY`; domínio verificado no Resend; consultar dashboard Resend |
| Webhook Stripe não funciona             | Verificar URL pública está correta; `STRIPE_WEBHOOK_SECRET` correto; logs da Vercel  |
| Cron não dispara                        | Confirmar `vercel.json` foi commitado; `CRON_SECRET` definido; cron schedule válido  |

---

## 9️⃣ Próximos Passos

- [ ] Configurar domínio customizado (Vercel → Settings → Domains)
- [ ] Habilitar Auto-deployment em PRs (Vercel → Deployments → Preview)
- [ ] Criar environment separado para Staging (se necessário)
- [ ] Configurar analytics/monitoring (Vercel Analytics ou New Relic/DataDog)
- [ ] Backup automático do banco de dados

---

## 📞 Links Úteis

- Vercel: https://vercel.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deploy/vercel
- Next.js 15 Deployment: https://nextjs.org/docs/deployment
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Resend Docs: https://resend.com/docs

---

**Última atualização**: 8 de dezembro de 2025
