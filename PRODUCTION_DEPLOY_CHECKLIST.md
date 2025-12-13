# 🚀 Checklist de Deploy Produção - VisionVII

**Status do Commit:** ✅ `9b5ef24` - Push bem-sucedido  
**Data:** ${new Date().toLocaleDateString('pt-BR')}

---

## ✅ Correções Implementadas

### 1. **Logs de Produção Removidos**

- ✅ `auth-redirect-check.tsx`: Removido log com email/role do usuário
- ✅ `teacher-theme-provider.tsx`: Removidos 8 console.debug (mantidos apenas console.error para erros críticos)
- ✅ `middleware.ts`: Todos os logs de token/cookie já removidos no commit anterior
- ✅ `auth.ts`: Logs condicionados a `NODE_ENV === 'development'`

### 2. **Páginas 404 Corrigidas**

- ✅ `/become-instructor` - Landing page para instrutores
- ✅ `/help` - Central de ajuda e FAQ
- ✅ `/cookies` - Política de cookies (LGPD compliance)
- ✅ `/teacher/courses/[id]` - Redirect automático para `/content`

### 3. **CSP (Content Security Policy)**

- ✅ `media-src 'self' https: data: blob:` - Permite vídeos Supabase
- ✅ `frame-src` - Permite YouTube e Vimeo embeds
- ✅ Middleware atualizado e commitado

---

## 🔧 Próximos Passos OBRIGATÓRIOS

### PASSO 1: Configurar Variável de Ambiente no Vercel

**⚠️ CRÍTICO**: Sem esta variável, vídeos privados não funcionarão em produção!

#### Como Adicionar:

1. Acesse: https://vercel.com/visionvii/smeducacional/settings/environment-variables

2. Clique em **"Add New"**

3. Configure:

   ```
   Key: SUPABASE_SERVICE_ROLE
   Value: [Copie da linha abaixo]
   ```

4. **Obtenha o valor**:

   - Opção A: No Supabase Dashboard → Project Settings → API → service_role key (secret)
   - Opção B: Copie do seu `.env.local` (linha `SUPABASE_SERVICE_ROLE=...`)

5. **Environments** (selecione TODOS):

   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. Clique em **"Save"**

#### ⚠️ Verificação:

Após adicionar, force um novo deploy:

```bash
# Na aba Deployments do Vercel
1. Vá em: https://vercel.com/visionvii/smeducacional/deployments
2. Clique nos "..." do último deploy
3. Selecione "Redeploy"
4. Marque "Use existing Build Cache" = OFF
5. Clique "Redeploy"
```

---

### PASSO 2: Aguardar Propagação do Deploy

**Tempo estimado:** 3-5 minutos

O que acontece:

- ✅ Vercel faz build do código novo (commit 9b5ef24)
- ✅ CSP headers são atualizados
- ✅ Novas páginas (/help, /cookies, etc.) ficam disponíveis
- ✅ Logs de produção param de aparecer

**Como verificar:**

1. Acesse: https://smeducacional.vercel.app
2. Abra DevTools (F12) → Console
3. Veja se aparecem erros de CSP
4. Tente acessar: /help, /cookies, /become-instructor

---

### PASSO 3: Testar Vídeos em Produção

**Após o deploy completar + SUPABASE_SERVICE_ROLE configurado:**

#### Como Aluno:

1. Faça login como aluno em produção
2. Acesse um curso matriculado
3. Tente assistir uma aula com vídeo do Supabase
4. **Esperado:**
   - ✅ Vídeo carrega e reproduz
   - ✅ Sem erros de CSP no console
   - ✅ URL começa com `https://...supabase.co/storage/v1/object/sign/...`

#### Como Professor:

1. Faça login como professor
2. Acesse `/teacher/courses/[id]/content`
3. Clique em uma aula
4. **Esperado:**
   - ✅ Vídeo visualiza normalmente
   - ✅ Sem erros 401 ou 403

---

## 🚨 Problemas Conhecidos (A Resolver)

### 1. **Vulnerabilidades Dependabot** (GitHub Alert)

```
GitHub found 2 vulnerabilities on VisionVII/smeducacional's default branch
(1 high, 1 moderate)
```

**Como Resolver:**

```bash
# 1. Ver quais são as vulnerabilidades
npm audit

# 2. Tentar fix automático
npm audit fix

# 3. Se não resolver, atualizar manualmente
npm audit fix --force

# 4. Commit e push
git add package*.json
git commit -m "fix: resolve Dependabot security vulnerabilities"
git push origin main
```

**⚠️ Atenção:** `npm audit fix --force` pode quebrar compatibilidade. Teste localmente antes!

---

### 2. **Console.error ainda em Produção**

**Mantidos intencionalmente** em `teacher-theme-provider.tsx`:

- `console.error('[loadTheme]')` - Erros críticos de carregamento
- `console.error('[updateTheme]')` - Falhas ao salvar tema
- `console.error('[resetTheme]')` - Problemas ao resetar

**Por quê?** Erros críticos devem ser logados mesmo em produção para debugging via Vercel Logs.

**Dados expostos:** ❌ NENHUM (apenas mensagens de erro genéricas)

---

## 📊 Status Checklist

| Item                  | Status | Observação                          |
| --------------------- | ------ | ----------------------------------- |
| Logs removidos        | ✅     | Commit 9b5ef24                      |
| Páginas 404           | ✅     | /help, /cookies, /become-instructor |
| CSP atualizado        | ✅     | media-src configurado               |
| Push para GitHub      | ✅     | 9b5ef24 pushed                      |
| Deploy Vercel         | 🔄     | Em andamento (auto-trigger)         |
| SUPABASE_SERVICE_ROLE | ⏳     | **VOCÊ PRECISA FAZER**              |
| Teste vídeos produção | ⏳     | Após deploy + env var               |
| Vulnerabilidades      | ⏳     | npm audit fix                       |

---

## 🎯 Validação Final

**Quando considerar o deploy 100% OK:**

1. ✅ Deploy Vercel completou (status: Ready)
2. ✅ Variável `SUPABASE_SERVICE_ROLE` configurada
3. ✅ Nenhum erro CSP no console (F12)
4. ✅ Vídeos reproduzem normalmente
5. ✅ Páginas /help, /cookies, /become-instructor acessíveis
6. ✅ Nenhum log com dados sensíveis aparecendo
7. ✅ Vulnerabilidades resolvidas (opcional, mas recomendado)

---

## 📞 Troubleshooting

### "Vídeo ainda não carrega"

**Diagnóstico:**

```bash
# 1. Verificar se a env var foi adicionada
curl https://smeducacional.vercel.app/api/lessons/[ID]/signed-url \
  -H "Cookie: __Secure-next-auth.session-token=..."

# Esperado: { "data": { "signedUrl": "https://..." } }
# Se retornar 500: env var não configurada
```

**Solução:**

- Verificar se `SUPABASE_SERVICE_ROLE` foi salvo em TODOS os environments
- Force redeploy com cache OFF

---

### "CSP ainda bloqueando"

**Diagnóstico:**

```bash
# Ver headers atuais em produção
curl -I https://smeducacional.vercel.app
```

**Esperado:**

```
content-security-policy: ... media-src 'self' https: data: blob: ...
```

**Se não aparecer:**

- Deploy ainda não propagou (aguardar mais 2-3 minutos)
- Cache do Vercel Edge (aguardar ou force redeploy)

---

### "Ainda vejo logs no console"

**Verificar:**

1. Hard refresh (Ctrl+Shift+R)
2. Limpar cache do navegador
3. Verificar se o deploy realmente completou
4. Testar em aba anônima

**Se persistir:**

```bash
# Ver logs do Vercel
https://vercel.com/visionvii/smeducacional/logs
```

---

## 🎉 Resumo

**O que foi feito:**

- Removemos TODOS os logs que vazavam dados sensíveis
- Criamos 3 páginas públicas faltantes
- Corrigimos a CSP para permitir vídeos
- Mantivemos apenas logs de erros críticos (sem dados expostos)

**O que VOCÊ precisa fazer:**

1. ⚠️ Adicionar `SUPABASE_SERVICE_ROLE` no Vercel (CRÍTICO)
2. ⏳ Aguardar deploy completar
3. ✅ Testar vídeos em produção
4. 🔧 Resolver vulnerabilidades Dependabot (npm audit fix)

**Tempo total estimado:** 10-15 minutos

---

**Desenvolvido com excelência pela VisionVII** — Transformando educação através da tecnologia.
