# Script para configurar variáveis no Vercel
# Execute este arquivo linha por linha no terminal do Vercel CLI

# Instale o Vercel CLI se ainda não tiver:
# npm i -g vercel

# Faça login:
# vercel login

# Entre no projeto:
# cd C:\Users\hvvct\Desktop\smeducacional
# vercel link

# Execute os comandos abaixo:

# 1. DATABASE_URL
vercel env add DATABASE_URL production
# Cole: postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f!A7#pQ2@dL8%rX4$zN1&@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&pool_timeout=0&connect_timeout=10

vercel env add DATABASE_URL preview
# Cole a mesma URL acima

vercel env add DATABASE_URL development
# Cole a mesma URL acima

# 2. DIRECT_URL
vercel env add DIRECT_URL production
# Cole: postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f!A7#pQ2@dL8%rX4$zN1&@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?connect_timeout=10

vercel env add DIRECT_URL preview
# Cole a mesma URL acima

vercel env add DIRECT_URL development
# Cole a mesma URL acima

# 3. NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Cole: +fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM=

vercel env add NEXTAUTH_SECRET preview
# Cole a mesma secret acima

vercel env add NEXTAUTH_SECRET development
# Cole a mesma secret acima

# 4. NEXTAUTH_URL (Production)
vercel env add NEXTAUTH_URL production
# Cole: https://smeducacional.vercel.app

# NEXTAUTH_URL (Preview e Development - usa variável dinâmica)
# Para preview/dev, configure manualmente no dashboard usando: https://$VERCEL_URL

# 5. SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGdzdmFsZnd4eG94Y2Z4bWhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3MjAzMSwiZXhwIjoyMDc5MjQ4MDMxfQ.TFhzAO1r1NG_EHezVhmJVykoCFzivumscHlPgMStqBw

vercel env add SUPABASE_SERVICE_ROLE_KEY preview
# Cole a mesma key acima

vercel env add SUPABASE_SERVICE_ROLE_KEY development
# Cole a mesma key acima

# 6. RESEND_API_KEY (opcional - para emails)
vercel env add RESEND_API_KEY production
# Cole: re_2kEnTsB9_bM7oirZESiEVdbjVha1BVprE

vercel env add RESEND_API_KEY preview
# Cole a mesma key acima

vercel env add RESEND_API_KEY development
# Cole a mesma key acima

# Após adicionar todas as variáveis, force redeploy:
vercel --prod
