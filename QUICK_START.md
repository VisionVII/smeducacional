# 🎯 GUIA RÁPIDO: Fazer Login Funcionar no Vercel

## ⚡ 3 Passos Simples

### 1️⃣ Abrir Painel do Vercel

👉 https://vercel.com/visionvii/smeducacional/settings/environment-variables

### 2️⃣ Adicionar 5 Variáveis Obrigatórias

Clique em **"Add New"** para cada variável:

| Variável                    | Valor                                                                                                                                                                                                                         | Ambientes                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `DATABASE_URL`              | `postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f!A7#pQ2@dL8%rX4$zN1&@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&pool_timeout=0&connect_timeout=10`                                                       | ✅ Production<br>✅ Preview<br>✅ Development |
| `DIRECT_URL`                | `postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f!A7#pQ2@dL8%rX4$zN1&@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?connect_timeout=10`                                                                                     | ✅ Production<br>✅ Preview<br>✅ Development |
| `NEXTAUTH_SECRET`           | `+fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM=`                                                                                                                                                                                | ✅ Production<br>✅ Preview<br>✅ Development |
| `NEXTAUTH_URL`              | `https://smeducacional.vercel.app`                                                                                                                                                                                            | ✅ Production apenas                          |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGdzdmFsZnd4eG94Y2Z4bWhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3MjAzMSwiZXhwIjoyMDc5MjQ4MDMxfQ.TFhzAO1r1NG_EHezVhmJVykoCFzivumscHlPgMStqBw` | ✅ Production<br>✅ Preview<br>✅ Development |

### 3️⃣ Fazer Redeploy

**Opção A - Dashboard:**

1. Vá em: https://vercel.com/visionvii/smeducacional/deployments
2. Último deploy → "..." → **"Redeploy"**

**Opção B - Terminal:**

```powershell
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## ✅ Testar (após 2-3 minutos)

👉 https://smeducacional.vercel.app/login

**Credenciais de teste:**

- Email: `admin@escola.com` / Senha: `admin123`
- Email: `professor@escola.com` / Senha: `prof123`
- Email: `aluno@escola.com` / Senha: `aluno123`

---

## 🎁 BÔNUS (Opcional)

### Para Emails (Recuperação de Senha)

```
RESEND_API_KEY = re_2kEnTsB9_bM7oirZESiEVdbjVha1BVprE
```

### Para Login com Google

```
GOOGLE_CLIENT_ID = seu-client-id
GOOGLE_CLIENT_SECRET = seu-client-secret
```

### Para Pagamentos (Stripe)

```
STRIPE_SECRET_KEY = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
```

---

## 📝 Nota sobre NEXTAUTH_URL

Para **Preview** e **Development**, use:

```
NEXTAUTH_URL = https://$VERCEL_URL
```

---

## 🆘 Problemas?

1. ✅ Confirme que todas as 5 variáveis estão no Vercel
2. ✅ Aguarde o deploy terminar (status "Ready")
3. ✅ Teste em modo incógnito
4. ✅ Veja logs: https://vercel.com/visionvii/smeducacional/logs

---

## ✨ Pronto!

Após configurar, o login deve funcionar perfeitamente! 🚀
