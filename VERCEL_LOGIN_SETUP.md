# 🔐 Configuração Completa do Login no Vercel

## 📋 Checklist Rápido

- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Fazer redeploy no Vercel
- [ ] Testar login
- [ ] ✅ Login funcionando!

---

## 🎯 Passo 1: Configurar Variáveis no Vercel

### Acesse o Painel de Variáveis

**URL**: https://vercel.com/visionvii/smeducacional/settings/environment-variables

### Variáveis OBRIGATÓRIAS

Adicione cada variável clicando em **"Add New"**:

#### 1. DATABASE_URL

```
postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f!A7#pQ2@dL8%rX4$zN1&@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&pool_timeout=0&connect_timeout=10
```

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

#### 2. DIRECT_URL

```
postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f!A7#pQ2@dL8%rX4$zN1&@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?connect_timeout=10
```

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

#### 3. NEXTAUTH_SECRET

```
+fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM=
```

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

#### 4. NEXTAUTH_URL

```
https://smeducacional.vercel.app
```

- ✅ **Production** apenas

**Para Preview e Development**, use:

```
https://$VERCEL_URL
```

#### 5. SUPABASE_SERVICE_ROLE_KEY

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGdzdmFsZnd4eG94Y2Z4bWhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3MjAzMSwiZXhwIjoyMDc5MjQ4MDMxfQ.TFhzAO1r1NG_EHezVhmJVykoCFzivumscHlPgMStqBw
```

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### Variáveis OPCIONAIS (para funcionalidades extras)

#### 6. RESEND_API_KEY (para emails)

```
re_2kEnTsB9_bM7oirZESiEVdbjVha1BVprE
```

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

> 💡 **Nota**: Sem essa variável, a recuperação de senha não funciona, mas o login normal sim.

#### 7. GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET (para login com Google)

```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
```

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

> 💡 **Nota**: Sem essas variáveis, o botão de "Login com Google" não aparece.

#### 8. STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET (para pagamentos)

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

> 💡 **Nota**: Sem essas variáveis, a compra de cursos não funciona, mas o login sim.

---

## 🚀 Passo 2: Forçar Redeploy

### Opção A: Pelo Dashboard Vercel

1. Vá para: https://vercel.com/visionvii/smeducacional/deployments
2. Clique no último deployment
3. Clique em "..." (três pontos)
4. Clique em **"Redeploy"**
5. ✅ Marque "Use existing Build Cache"
6. Clique em **"Redeploy"**

### Opção B: Pelo Terminal

```powershell
git commit --allow-empty -m "Trigger Vercel redeploy with env vars"
git push
```

---

## ✅ Passo 3: Testar Login

### 1. Aguarde o Deploy (2-3 minutos)

Monitore em: https://vercel.com/visionvii/smeducacional/deployments

### 2. Acesse a Página de Login

**URL**: https://smeducacional.vercel.app/login

### 3. Teste Credenciais

Use um usuário existente ou crie um novo.

**Usuários de exemplo** (se rodou seed):

- Email: `admin@escola.com` / Senha: `admin123`
- Email: `professor@escola.com` / Senha: `prof123`
- Email: `aluno@escola.com` / Senha: `aluno123`

### 4. Verificar Sucesso

Após login bem-sucedido, você deve ser redirecionado para:

- `/student/dashboard` (se for aluno)
- `/teacher/dashboard` (se for professor)
- `/admin/dashboard` (se for admin)

---

## 🐛 Troubleshooting

### Erro 500 em /api/auth/session

**Causa**: Falta `NEXTAUTH_SECRET` ou `NEXTAUTH_URL`

**Solução**: Confirme que as variáveis estão no Vercel

### Erro "Database connection failed"

**Causa**: `DATABASE_URL` ou `DIRECT_URL` incorretas

**Solução**: Verifique se copiou as URLs completas, incluindo a senha codificada (`S9f!A7#pQ2@dL8%rX4$zN1&`)

### Login não redireciona

**Causa**: Código já foi corrigido (commit `5f36344`)

**Solução**: Force novo deploy para pegar o código atualizado

### Botão Google não aparece

**Causa**: Normal se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` não estão configurados

**Solução**: Adicione as credenciais ou ignore (login por email/senha funciona)

---

## 📊 Status Atual do Código

### ✅ Commits Aplicados

1. **5f36344** - Fix login flow (window.location.href)
2. **ec1ae17** - Guard Google OAuth provider

### ✅ Correções Implementadas

- Login usa `window.location.href` para forçar reload completo
- Google OAuth só é adicionado se credenciais existirem
- Stripe só é inicializado se `STRIPE_SECRET_KEY` existir
- Resend só é inicializado se `RESEND_API_KEY` existir

---

## 🎯 Resumo Final

### Para Login Funcionar (MÍNIMO):

1. ✅ `DATABASE_URL`
2. ✅ `DIRECT_URL`
3. ✅ `NEXTAUTH_SECRET`
4. ✅ `NEXTAUTH_URL`
5. ✅ `SUPABASE_SERVICE_ROLE_KEY`

### Para Funcionalidades Completas (OPCIONAL):

6. ⚪ `RESEND_API_KEY` (emails)
7. ⚪ `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (Google OAuth)
8. ⚪ `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` (pagamentos)

---

## 🤝 Suporte

Se após seguir todos os passos ainda houver problemas:

1. **Verifique os logs do Vercel**: https://vercel.com/visionvii/smeducacional/logs
2. **Teste em modo incógnito** (limpa cache)
3. **Verifique se o deploy terminou** (status "Ready")
4. **Confirme que todas as 5 variáveis obrigatórias estão configuradas**

---

## ✨ Próximos Passos (Após Login Funcionar)

1. **Configurar Google OAuth** (opcional)

   - Criar projeto no Google Cloud Console
   - Obter Client ID e Secret
   - Adicionar no Vercel

2. **Ativar Emails** (opcional)

   - Confirmar `RESEND_API_KEY` está ativa
   - Testar recuperação de senha

3. **Ativar Pagamentos** (opcional)

   - Configurar Stripe Webhook
   - Adicionar `STRIPE_WEBHOOK_SECRET`
   - Testar compra de curso

4. **Ativar Cron Jobs** (remarketing)
   - Adicionar `CRON_SECRET` no GitHub Secrets
   - Verificar execução automática 4x/dia
