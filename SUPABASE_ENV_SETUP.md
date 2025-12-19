# ⚙️ Configurar Variáveis de Ambiente Supabase

## 🎯 Problema Identificado

```
❌ NEXT_PUBLIC_SUPABASE_URL não está definida
❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida
```

**Causa:** Faltam as credenciais do Supabase no arquivo `.env.local`

## ✅ Solução Passo a Passo

### **PASSO 1: Obter Credenciais do Supabase**

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Clique em **Settings** (⚙️ no menu lateral esquerdo)
4. Clique em **API** no submenu
5. Copie as seguintes informações:

**Você verá algo assim:**

```
Project URL
https://xxxxxxxxxxx.supabase.co
```

👆 **Copie esta URL completa**

```
Project API keys
┌─────────────────────────────────┐
│ anon  public  ████████████████  │ ← Clique em "Copy" aqui
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ service_role  ████████████████  │ ← NÃO use esta chave!
└─────────────────────────────────┘
```

👆 **Copie APENAS a chave `anon public`**

### **PASSO 2: Criar/Editar .env.local**

No diretório raiz do projeto (`SM Educa/`), crie ou edite o arquivo `.env.local`:

**Windows (PowerShell):**

```powershell
notepad .env.local
```

**OU use VS Code:**

```bash
code .env.local
```

### **PASSO 3: Adicionar as Variáveis**

Cole o seguinte conteúdo no `.env.local`:

```env
# ===================================
# 🗄️ DATABASE (Supabase PostgreSQL)
# ===================================
DATABASE_URL="sua-connection-string-aqui-com-pgbouncer"
DIRECT_URL="sua-connection-string-aqui-direta"

# ===================================
# 🔐 AUTHENTICATION (NextAuth.js)
# ===================================
NEXTAUTH_SECRET="seu-secret-gerado-aqui"
NEXTAUTH_URL="http://localhost:3000"

# ===================================
# 📦 SUPABASE STORAGE
# ===================================
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon-key-aqui"

# ===================================
# 💳 STRIPE (Pagamentos)
# ===================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ===================================
# 📧 RESEND (Email Transacional)
# ===================================
RESEND_API_KEY="re_..."
```

**⚠️ IMPORTANTE:**

- Substitua `xxxxxxxxxxx.supabase.co` pela **Project URL** que você copiou
- Substitua `sua-chave-anon-key-aqui` pela **anon public key** que você copiou
- **NÃO** use aspas duplas dentro das strings
- **NÃO** compartilhe este arquivo (já está no `.gitignore`)

### **PASSO 4: Exemplo Real (Redacted)**

```env
# Exemplo (suas chaves serão diferentes)
NEXT_PUBLIC_SUPABASE_URL="https://abc123xyz789.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM3h5ejc4OSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MTU2NTYwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### **PASSO 5: Salvar e Reiniciar o Servidor**

1. **Salve o arquivo** `.env.local` (Ctrl+S)
2. **Pare o servidor Next.js** (Ctrl+C no terminal)
3. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

### **PASSO 6: Verificar Configuração**

Execute o diagnóstico novamente:

```bash
npm run db:diagnose:upload
```

**Resultado esperado:**

```
✅ NEXT_PUBLIC_SUPABASE_URL encontrada
   URL: https://abc123xyz789.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY encontrada
   Key: eyJhbGciOiJIUzI1NiI...
✅ Conexão com Supabase estabelecida
```

## 🔍 Onde Encontrar as Credenciais

### **Navegação no Supabase Dashboard:**

```
Supabase Dashboard
└── [Seu Projeto]
    └── Settings ⚙️
        └── API
            ├── Configuration
            │   └── Project URL: https://xxx.supabase.co
            └── Project API keys
                ├── anon public (USE ESTA) ✅
                └── service_role (NÃO USE) ❌
```

### **Screenshot Guia (Localização Visual):**

```
┌──────────────────────────────────────────────────────┐
│ 🏠 Dashboard > Project Settings > API                │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 📍 Project URL                                       │
│ https://xxxxxxxxxxx.supabase.co                      │
│                                                      │
│ 🔑 API Keys                                          │
│ ┌────────────────────────────────────────────────┐  │
│ │ anon                                           │  │
│ │ public                                         │  │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...      │  │
│ │                                    [Copy] 📋  │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ service_role                                   │  │
│ │ secret                                         │  │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...      │  │
│ │                                    [Copy] 📋  │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 🚨 Erros Comuns

### ❌ "Cannot find module '.env.local'"

**Solução:** O arquivo `.env.local` deve estar na **raiz do projeto**, não em pastas como `src/`, `scripts/`, etc.

```
✅ Correto:
SM Educa/
├── .env.local          ← AQUI
├── package.json
├── next.config.ts
└── src/

❌ Errado:
SM Educa/
└── src/
    └── .env.local      ← NÃO AQUI
```

### ❌ "Invalid API key"

**Causas possíveis:**

- Você copiou a chave `service_role` em vez da `anon public`
- Há espaços ou quebras de linha na chave
- Há aspas extras (`""` ou `''`) dentro do valor

**Solução:**

```env
# ❌ Errado
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave "aqui" "

# ✅ Correto
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-aqui-sem-aspas-internas"
```

### ❌ Variáveis não carregam após editar .env.local

**Solução:** Reinicie o servidor Next.js:

```bash
# Pare o servidor (Ctrl+C)
# Depois reinicie
npm run dev
```

## 📋 Checklist de Configuração

- [ ] Acessei Supabase Dashboard → Settings → API
- [ ] Copiei a **Project URL** completa
- [ ] Copiei a chave **anon public** (não service_role)
- [ ] Criei/editei `.env.local` na **raiz** do projeto
- [ ] Adicionei ambas as variáveis (URL e ANON_KEY)
- [ ] **Salvei** o arquivo `.env.local`
- [ ] **Reiniciei** o servidor Next.js (`npm run dev`)
- [ ] Executei `npm run db:diagnose:upload` para verificar
- [ ] Vi mensagens "✅ encontrada" para ambas as variáveis

## 🎯 Próximo Passo

Após configurar as variáveis, continue com:

1. **Criar bucket 'images'** (ver `UPLOAD_ERROR_500_FIX.md`)
2. **Configurar RLS policies** (ver `IMAGE_UPLOAD_DIAGNOSTIC.md`)
3. **Testar upload** em Admin → Settings → Branding

## 📚 Documentos Relacionados

- **UPLOAD_ERROR_500_FIX.md** - Solução rápida do erro 500
- **IMAGE_UPLOAD_DIAGNOSTIC.md** - Diagnóstico completo de upload
- **SUPABASE_STORAGE_SETUP.md** - Configuração detalhada do Storage

---

**Desenvolvido com excelência pela VisionVII**  
🔐 Guia de configuração de environment variables
