# ⚠️ ERRO "Configuration" - Checklist

## O erro "Configuration" do NextAuth acontece quando falta configuração no Vercel

### ✅ Verifique se TODAS essas variáveis estão no Vercel:

Acesse: https://vercel.com/visionvii/smeducacional/settings/environment-variables

#### 1. NEXTAUTH_SECRET ⚠️ CRÍTICO

```
+fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM=
```

**Ambientes**: Production, Preview, Development

#### 2. NEXTAUTH_URL ⚠️ CRÍTICO

```
https://smeducacional.vercel.app
```

**Apenas Production**

Para Preview/Development, adicione separadamente:

```
https://$VERCEL_URL
```

#### 3. DATABASE_URL ⚠️ CRÍTICO

```
postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f!A7#pQ2@dL8%rX4$zN1&@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&pool_timeout=0&connect_timeout=10
```

**Ambientes**: Production, Preview, Development

#### 4. DIRECT_URL ⚠️ CRÍTICO

```
postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f!A7#pQ2@dL8%rX4$zN1&@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?connect_timeout=10
```

**Ambientes**: Production, Preview, Development

#### 5. SUPABASE_SERVICE_ROLE_KEY

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGdzdmFsZnd4eG94Y2Z4bWhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3MjAzMSwiZXhwIjoyMDc5MjQ4MDMxfQ.TFhzAO1r1NG_EHezVhmJVykoCFzivumscHlPgMStqBw
```

**Ambientes**: Production, Preview, Development

---

## 🔍 Diagnóstico

Se você JÁ adicionou essas variáveis mas ainda dá erro:

### 1. Verifique os Logs do Vercel

👉 https://vercel.com/visionvii/smeducacional/logs

Procure por:

- "Missing required environment variable"
- "NEXTAUTH_SECRET"
- "NEXTAUTH_URL"

### 2. Force Redeploy

```powershell
git commit --allow-empty -m "Force redeploy"
git push
```

### 3. Teste Localmente Primeiro

```powershell
npm run dev
# Acesse: http://localhost:3000/login
# Teste com: professor@smeducacional.com / prof123
```

---

## ❌ Você NÃO precisa configurar Google OAuth

O código já trata isso automaticamente. Se não tiver credenciais Google, o botão simplesmente não aparece.

---

## ✅ Depois de Configurar

1. Aguarde 2-3 minutos para deploy
2. Teste: https://smeducacional.vercel.app/login
3. Use: `professor@smeducacional.com` / `prof123`

---

## 🆘 Se ainda der erro

Me envie:

1. Screenshot dos logs do Vercel
2. Confirmação de que as 5 variáveis estão lá
3. Screenshot da lista de variáveis de ambiente
