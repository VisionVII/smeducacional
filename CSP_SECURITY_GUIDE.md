# 🔒 Content Security Policy (CSP) - Guia de Segurança

## 📋 Visão Geral

Este documento explica a configuração de Content Security Policy (CSP) implementada no SM Educacional e como resolver erros comuns.

---

## ✅ Configuração Atual

### Middleware (`middleware.ts`)

O CSP é aplicado automaticamente via middleware em **todas as rotas** do sistema:

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https: http:;
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' https: http: ws: wss:;
  media-src 'self' https: data: blob:;
  frame-src 'self' https://www.youtube.com https://player.vimeo.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

---

## 🚨 Erro Comum: "CSP blocks the use of 'eval'"

### Sintoma:

```
Content Security Policy of your site blocks the use of 'eval' in JavaScript
```

### Causa:

Next.js e React usam `eval()` e `new Function()` internamente para:

- Hot Module Replacement (HMR) em desenvolvimento
- Code splitting dinâmico
- Algumas bibliotecas de terceiros

### Solução ✅:

**Já está resolvido!** O middleware já inclui `unsafe-eval` na diretiva `script-src`:

```typescript
script-src 'self' 'unsafe-eval' 'unsafe-inline'
```

### Verificação:

1. **Confirmar que `middleware.ts` existe na raiz do projeto**:

   ```bash
   ls middleware.ts
   ```

2. **Verificar se o middleware está sendo aplicado**:

   - Abra DevTools → Network
   - Recarregue a página
   - Clique em qualquer request
   - Verifique os Response Headers:
     ```
     Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' ...
     ```

3. **Se ainda ocorrer erro**:
   ```bash
   # Limpar cache do Next.js
   rm -rf .next
   npm run build
   npm run dev
   ```

---

## 🔐 Por que usar `unsafe-eval`?

### ⚠️ Riscos:

- Permite execução de código dinâmico
- Pode ser explorado se houver XSS vulnerability

### ✅ Mitigações Ativas:

1. **Zod Validation**: Todos os inputs validados server-side
2. **NextAuth**: Autenticação robusta com JWT
3. **Prisma ORM**: Protege contra SQL injection
4. **Rate Limiting**: Previne abuse de APIs
5. **CORS**: Controlado via Next.js config
6. **Sanitização**: Inputs escapados automaticamente pelo React

### 📊 Trade-off Aceitável:

- ✅ Framework moderno precisa
- ✅ Outras camadas de segurança compensam
- ✅ Benefícios de performance > riscos mínimos

---

## 📦 Headers de Segurança Adicionais

### Aplicados via Middleware:

```typescript
X-Frame-Options: DENY                 // Previne clickjacking
X-Content-Type-Options: nosniff       // Previne MIME sniffing
X-XSS-Protection: 1; mode=block       // XSS browser protection
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()...
```

### Aplicados via `next.config.ts`:

```typescript
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-DNS-Prefetch-Control: on
```

---

## 🛠️ Troubleshooting

### Problema: CSP ainda bloqueando scripts

**Solução 1 - Verificar middleware**:

```bash
# Arquivo deve existir na raiz
ls middleware.ts
```

**Solução 2 - Limpar cache**:

```bash
rm -rf .next node_modules/.cache
npm run dev
```

**Solução 3 - Verificar em produção (Vercel)**:

```bash
# Deploy e teste
vercel --prod
```

### Problema: Scripts externos não carregam

**Verificar domínio na whitelist**:

```typescript
// middleware.ts - adicionar domínio em script-src
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://seu-dominio.com;
```

### Problema: Vídeos/iframes não carregam

**Verificar domínio em frame-src**:

```typescript
// middleware.ts - adicionar domínio em frame-src
frame-src 'self' https://www.youtube.com https://seu-player.com;
```

---

## 📝 Checklist de Segurança

### Antes de Deploy:

- [ ] `middleware.ts` na raiz do projeto
- [ ] CSP com `unsafe-eval` para Next.js
- [ ] Security headers aplicados
- [ ] Testes em ambiente local
- [ ] Testes em Vercel preview
- [ ] DevTools não mostra erros CSP
- [ ] Todas as funcionalidades funcionando

### Após Deploy:

- [ ] Verificar headers via DevTools
- [ ] Testar upload de arquivos
- [ ] Testar player de vídeo
- [ ] Testar formulários
- [ ] Verificar console por erros

---

## 🔗 Recursos Úteis

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

## ✅ Status Atual

- ✅ CSP configurado e funcional
- ✅ `unsafe-eval` permitido (necessário)
- ✅ Security headers aplicados
- ✅ Middleware ativo em todas as rotas
- ✅ Testado em desenvolvimento e produção

**Última atualização**: 21 de dezembro de 2025

---

**Desenvolvido com excelência pela VisionVII** — Segurança sem comprometer performance.
