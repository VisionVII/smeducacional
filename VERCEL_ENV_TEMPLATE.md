# 🔐 Template de Variáveis de Ambiente - Vercel

Copie e preencha este template no Vercel Dashboard → Settings → Environment Variables

```env
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📦 BANCO DE DADOS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE_URL=postgresql://user:password@host:5432/database_name

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔑 NEXTAUTH
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=<gere-com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 💳 STRIPE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
STRIPE_PRICE_ID_STUDENT_MONTHLY=price_XXXXXXXXXXXXXXXXXXXX
STRIPE_PRICE_ID_TEACHER_MONTHLY=price_XXXXXXXXXXXXXXXXXXXX

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📧 RESEND (Emails)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FROM_EMAIL=noreply@seudominio.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⏰ CRON JOBS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRON_SECRET=<gere-com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔵 SUPABASE (Opcional - se usar storage)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔴 GOOGLE OAUTH (Opcional - se usar)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📤 UPLOADTHING (Opcional - uploads)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPLOADTHING_SECRET=sk_live_xxxxx
NEXT_PUBLIC_UPLOADTHING_APP_ID=xxxxx

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🌍 AMBIENTE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NODE_ENV=production
```

## 📋 Checklist de Preenchimento

- [ ] DATABASE_URL (obrigatório)
- [ ] NEXTAUTH_URL (obrigatório)
- [ ] NEXTAUTH_SECRET (obrigatório)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (obrigatório)
- [ ] STRIPE_SECRET_KEY (obrigatório)
- [ ] STRIPE_WEBHOOK_SECRET (obrigatório)
- [ ] STRIPE_PRICE_ID_STUDENT_MONTHLY (obrigatório)
- [ ] STRIPE_PRICE_ID_TEACHER_MONTHLY (obrigatório)
- [ ] RESEND_API_KEY (obrigatório)
- [ ] NEXT_PUBLIC_FROM_EMAIL (obrigatório)
- [ ] CRON_SECRET (obrigatório)
- [ ] Opcionais preenchidos conforme necessário

## 🔗 Como Obter Cada Valor

| Variável                | Origem               | Passos                                                                     |
| ----------------------- | -------------------- | -------------------------------------------------------------------------- |
| DATABASE_URL            | Supabase/Railway/RDS | Criar banco → copiar connection string                                     |
| NEXTAUTH_SECRET         | Terminal             | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| STRIPE_PUBLISHABLE_KEY  | Stripe Dashboard     | Settings → API Keys → Publishable                                          |
| STRIPE_SECRET_KEY       | Stripe Dashboard     | Settings → API Keys → Secret                                               |
| STRIPE_WEBHOOK_SECRET   | Stripe Dashboard     | Webhooks → Create webhook → Signing secret                                 |
| STRIPE*PRICE_ID*\*      | Stripe Dashboard     | Products → Prices → ID                                                     |
| RESEND_API_KEY          | Resend Dashboard     | API Tokens                                                                 |
| GOOGLE_CLIENT_ID/SECRET | Google Cloud Console | OAuth 2.0 → Credentials                                                    |

**Salve este arquivo como `.env.production` localmente para referência!**
