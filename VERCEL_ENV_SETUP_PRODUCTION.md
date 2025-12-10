# 🔧 Configuração de Variáveis de Ambiente - Vercel (Produção)

## 📋 Instruções

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto **smeducacional**
3. Vá em **Settings** → **Environment Variables**
4. Adicione/atualize TODAS as variáveis abaixo (use os valores de `.env.local`):

---

## ✅ Variáveis Obrigatórias para Produção

### 1. **Database (PostgreSQL/Supabase)**

Copie de `.env.local`:

- `DATABASE_URL`
- `DIRECT_URL`

### 2. **NextAuth (Autenticação)**

Copie de `.env.local`:

- `NEXTAUTH_URL` → **Mude para:** `https://smeducacional.vercel.app`
- `NEXTAUTH_SECRET`

### 3. **Google OAuth**

Copie de `.env.local`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 4. **Email (Resend)**

Copie de `.env.local`:

- `RESEND_API_KEY`
- `NEXT_PUBLIC_FROM_EMAIL`

### 5. **Supabase (Storage)**

Copie de `.env.local`:

- `SUPABASE_SERVICE_ROLE_KEY`

### 6. **Cron Jobs (GitHub Actions)**

Copie de `.env.local`:

- `CRON_SECRET`

---

## ⚠️ IMPORTANTE - Google Cloud Console

Você precisa **adicionar a URL de produção no Google Cloud Console**:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique no OAuth Client ID que você criou
3. Em "Authorized JavaScript origins", adicione:
   ```
   https://smeducacional.vercel.app
   ```
4. Em "Authorized redirect URIs", adicione:
   ```
   https://smeducacional.vercel.app/api/auth/callback/google
   ```
5. Salve as alterações

### Verificação de URLs

- ✅ **NEXTAUTH_URL em Vercel** = `https://smeducacional.vercel.app`
- ✅ **Google Redirect URI** = `https://smeducacional.vercel.app/api/auth/callback/google`

---

## 🧪 Teste de Conexão

Depois de adicionar todas as variáveis:

1. Faça um novo deploy no Vercel (Push para main ou Deploy manual)
2. Acesse https://smeducacional.vercel.app/login
3. Clique em "Entrar com Google"
4. Você deve ser redirecionado para Google
5. Após autorizar, deve retornar para o dashboard
6. Verifique nos logs do Vercel (Function logs) se há erros

---

## 📝 Checklist

- [ ] Variáveis de Database copiadas para Vercel
- [ ] NEXTAUTH_URL e SECRET copiados para Vercel
- [ ] Google OAuth Client ID e Secret copiados para Vercel
- [ ] URL de produção adicionada no Google Cloud Console
- [ ] Resend API Key copiada para Vercel
- [ ] Supabase Service Role Key copiada para Vercel
- [ ] CRON_SECRET copiado para Vercel
- [ ] Deploy realizado no Vercel
- [ ] Teste de login executado com sucesso

---

## 🔍 Debug de Erros

Se o login não funcionar, verifique:

1. **Logs do Vercel**: Vá em `Settings → Function Logs` para ver mensagens de erro
2. **Verificar Google Cloud**: Confirme URLs exatas em `https://console.cloud.google.com/apis/credentials`
3. **Check NEXTAUTH_URL**: Deve ser exatamente `https://smeducacional.vercel.app` (sem `/` no final)
4. **Certificar secrets**: NEXTAUTH_SECRET deve ser o mesmo entre local e Vercel
