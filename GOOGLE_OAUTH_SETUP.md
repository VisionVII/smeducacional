# 🔐 Configuração Google OAuth - SM Educacional

## 📋 Passo a Passo

### 1️⃣ Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google

### 2️⃣ Criar um Projeto

1. Clique em **"Select a project"** no topo
2. Clique em **"NEW PROJECT"**
3. Nome do projeto: `SM Educacional`
4. Clique em **"CREATE"**

### 3️⃣ Configurar OAuth Consent Screen

1. No menu lateral, vá em **APIs & Services** → **OAuth consent screen**
2. Escolha **External** (para permitir qualquer usuário do Google)
3. Clique em **CREATE**
4. Preencha:
   - **App name**: `SM Educacional`
   - **User support email**: seu email
   - **Developer contact information**: seu email
5. Clique em **SAVE AND CONTINUE**
6. Em **Scopes**, clique em **ADD OR REMOVE SCOPES**
7. Selecione:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
8. Clique em **UPDATE** → **SAVE AND CONTINUE**
9. Em **Test users**, adicione seu email para testar
10. Clique em **SAVE AND CONTINUE**

### 4️⃣ Criar Credenciais OAuth 2.0

1. No menu lateral, vá em **APIs & Services** → **Credentials**
2. Clique em **CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `SM Educacional Web`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://seudominio.com
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://seudominio.com/api/auth/callback/google
   ```
7. Clique em **CREATE**

### 5️⃣ Copiar Credenciais

Após criar, você verá:

- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

**⚠️ IMPORTANTE**: Guarde essas credenciais com segurança!

### 6️⃣ Configurar Variáveis de Ambiente

Abra o arquivo `.env` e substitua:

```env
# Google OAuth
GOOGLE_CLIENT_ID="seu-client-id-aqui.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
```

### 7️⃣ Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
npm run dev
```

## ✅ Testar Login com Google

1. Acesse: http://localhost:3000/login
2. Clique em **"Continuar com Google"**
3. Escolha sua conta Google
4. Autorize o acesso
5. Você será redirecionado para o dashboard!

## 🔄 Atualização do Schema Prisma

O schema já está configurado para aceitar login com Google. O NextAuth criará automaticamente o usuário na primeira vez.

### Campos importantes:

- `emailVerified`: Preenchido automaticamente pelo Google
- `avatar`: URL da foto do Google
- `role`: Padrão é STUDENT (você pode alterar manualmente no banco)

## 🚀 Produção

Quando publicar em produção:

1. Volte no **Google Cloud Console**
2. Vá em **Credentials**
3. Edite o OAuth client ID
4. Adicione suas URLs de produção:
   ```
   https://seudominio.com
   https://seudominio.com/api/auth/callback/google
   ```
5. Em **OAuth consent screen**, publique o app clicando em **PUBLISH APP**

## 📝 Observações

- Por padrão, novos usuários do Google são criados como **STUDENT**
- Para tornar alguém TEACHER ou ADMIN, edite manualmente no banco ou crie uma página de gerenciamento
- A foto do perfil do Google é sincronizada automaticamente
- O email é verificado automaticamente (emailVerified)

## 🛠️ Troubleshooting

### Erro: "redirect_uri_mismatch"

- Verifique se as URLs em "Authorized redirect URIs" estão corretas
- Certifique-se de incluir `/api/auth/callback/google`

### Erro: "access_denied"

- Adicione seu email em "Test users" no OAuth consent screen
- Ou publique o app para uso público

### Usuário não é criado

- Verifique se o Prisma está conectado
- Veja os logs do terminal para erros

## 📧 Suporte

Dúvidas? Entre em contato com a equipe de desenvolvimento.
