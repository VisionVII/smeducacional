# Configuração de Email com Resend

Este sistema usa o [Resend](https://resend.com) para envio de emails transacionais, incluindo códigos de recuperação de senha.

## 🚀 Setup Rápido

### 1. Criar Conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu email

### 2. Obter API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Copie a chave gerada

### 3. Configurar Variável de Ambiente

Adicione no seu arquivo `.env`:

```env
RESEND_API_KEY="re_sua_chave_aqui"
```

### 4. Atualizar Banco de Dados

Execute para adicionar os campos de recuperação de senha:

```bash
npx prisma db push
```

## 📧 Funcionalidades

### Email de Recuperação de Senha

- **Design:** Email HTML responsivo com gradiente azul
- **Código:** 6 dígitos aleatórios
- **Expiração:** 15 minutos
- **Segurança:** Alerta sobre não solicitar = ignorar email

### Fluxo de Recuperação

1. **Usuário solicita recuperação** → Digita email
2. **Sistema envia código** → Email com código de 6 dígitos
3. **Usuário verifica código** → Digita código recebido
4. **Usuário cria nova senha** → Define nova senha
5. **Senha redefinida** → Redireciona para login

## 🔧 Modo Desenvolvimento

Se `RESEND_API_KEY` não estiver configurada:

- Código é exibido no **console** do servidor
- Não envia email real
- Útil para testes locais

```bash
# Console mostrará:
Código de recuperação: 123456
```

## 🎨 Personalização do Email

O email é totalmente customizável em:
```
src/app/api/auth/forgot-password/route.ts
```

Função `getEmailHTML(code, userName)` contém o HTML do email.

### Elementos do Email:

- ✅ Header com gradiente azul
- ✅ Logo centralizado
- ✅ Saudação personalizada
- ✅ Código em destaque (36px, monospace)
- ✅ Temporizador de expiração
- ✅ Alerta de segurança amarelo
- ✅ Footer com copyright
- ✅ Responsivo para mobile

## 📝 Endpoints da API

### POST `/api/auth/forgot-password`
Envia código de recuperação

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Response:**
```json
{
  "message": "Código enviado para seu email"
}
```

### POST `/api/auth/verify-code`
Verifica código de recuperação

**Body:**
```json
{
  "email": "usuario@email.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Código verificado com sucesso"
}
```

### POST `/api/auth/reset-password`
Redefine a senha

**Body:**
```json
{
  "email": "usuario@email.com",
  "code": "123456",
  "password": "novaSenha123"
}
```

**Response:**
```json
{
  "message": "Senha redefinida com sucesso"
}
```

## ⚠️ Importante

### Plano Gratuito Resend

- **100 emails/dia** gratuitos
- Domínio verificado recomendado para produção
- Emails de teste podem cair em spam sem domínio verificado

### Segurança

- ✅ Códigos de 6 dígitos aleatórios
- ✅ Expiração em 15 minutos
- ✅ Códigos armazenados com hash no banco
- ✅ Um código por vez (novo código invalida anterior)
- ✅ Código removido após uso

## 🚀 Produção

Para usar em produção:

1. **Verifique seu domínio** no Resend
2. **Configure DNS** com registros fornecidos
3. **Atualize o FROM** do email:
   ```typescript
   from: 'SM Educacional <no-reply@seudominio.com.br>'
   ```

## 🐛 Troubleshooting

### Email não chega

1. Verifique se RESEND_API_KEY está correta
2. Confirme que o domínio está verificado
3. Verifique pasta de spam
4. Em dev, olhe o console do servidor

### Código inválido

1. Código expira em 15 minutos
2. Cada novo código invalida o anterior
3. Código é case-sensitive (apenas números)

### Erro de banco

Execute:
```bash
npx prisma db push
npx prisma generate
```

## 📚 Documentação Resend

- [Documentação Oficial](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference/introduction)
- [SDKs](https://resend.com/docs/sdks/overview)
