# Correção do Erro 500 no NextAuth (Vercel)

## Problema

Erro 500 em `/api/auth/session`:

```
There was a problem with the server configuration.
Check the server logs for more information.
```

## Causa

O NextAuth precisa de variáveis de ambiente críticas configuradas no Vercel:

- `NEXTAUTH_SECRET` - Chave secreta para criptografia JWT
- `NEXTAUTH_URL` - URL base da aplicação

## Solução

### 1. Configurar Variáveis no Vercel

Acesse: https://vercel.com/visionvii/smeducacional/settings/environment-variables

Adicione as seguintes variáveis:

#### Variáveis OBRIGATÓRIAS (Production, Preview, Development):

```env
NEXTAUTH_SECRET="+fAMKFCCCQIX7LIlbwl4dqFRPQ/7pkreleC1Mw8B8DM="
NEXTAUTH_URL="https://smeducacional.vercel.app"
```

> ⚠️ **Importante**: Use o mesmo `NEXTAUTH_SECRET` do arquivo `.env.local` para manter consistência entre ambientes.

#### Variáveis OPCIONAIS (só se quiser Google OAuth):

```env
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

> 💡 **Nota**: O código agora detecta automaticamente se as credenciais Google estão disponíveis. Se não estiverem, o login por Google simplesmente não aparecerá.

### 2. Forçar Novo Deploy

Após adicionar as variáveis:

1. Vá em: https://vercel.com/visionvii/smeducacional/deployments
2. Clique no último deploy
3. Clique em "..." (três pontos) → "Redeploy"
4. ✅ Selecione "Use existing Build Cache"
5. Clique em "Redeploy"

**OU** faça um push vazio:

```powershell
git commit --allow-empty -m "Trigger Vercel redeploy with env vars"
git push
```

### 3. Verificar Deploy

Aguarde 2-3 minutos e teste:

- https://smeducacional.vercel.app/login

O login deve funcionar normalmente!

## Mudanças no Código

### Commit: `ec1ae17` - Guard Google OAuth provider

**Arquivo**: `src/lib/auth.ts`

**O que mudou**:

- ✅ Google OAuth só é adicionado se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` existirem
- ✅ Adicionado `secret: process.env.NEXTAUTH_SECRET` explicitamente
- ✅ Tipagem correta com `NextAuthConfig['providers']`

**Benefício**: Evita erro 500 quando Google OAuth não está configurado.

## Checklist

- [x] Código corrigido e commitado
- [ ] Variáveis adicionadas no Vercel
- [ ] Novo deploy disparado
- [ ] Login testado e funcionando

## Próximos Passos

Após login funcionar:

1. **Ativar emails** (opcional):

   - Adicionar `RESEND_API_KEY` no Vercel
   - Testar recuperação de senha

2. **Ativar pagamentos** (opcional):

   - Adicionar `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` no Vercel
   - Testar checkout de cursos

3. **Ativar cron jobs**:
   - Adicionar `CRON_SECRET` no GitHub Secrets
   - Verificar execução automática

## Suporte

Se ainda tiver erro 500:

1. Verifique os logs no Vercel: https://vercel.com/visionvii/smeducacional/logs
2. Confirme que `NEXTAUTH_SECRET` e `NEXTAUTH_URL` estão configurados
3. Teste em modo incógnito para limpar cache
