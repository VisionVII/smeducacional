# 🔒 SecureOpsAI — Agente de Segurança & Compliance

> Auditoria automatizada de segurança usando GPT-4 para garantir código seguro, validações corretas e compliance com OWASP.

## 🎯 Responsabilidades

### 1. Autenticação & Autorização

- ✅ Verifica se `auth()` está presente em API routes protegidas
- ✅ Valida role checks (ADMIN, TEACHER, STUDENT)
- ✅ Detecta rotas sem autenticação que deveriam ter
- ✅ Analisa NextAuth configuration

### 2. Validação de Dados (Zod)

- ✅ Detecta APIs sem validação Zod server-side
- ✅ Verifica se `.safeParse()` está sendo usado corretamente
- ✅ Identifica dados de req.body não validados
- ✅ Checa tipos TypeScript vs schemas Zod

### 3. SQL Injection & XSS

- ✅ Garante uso de Prisma (sem raw queries perigosas)
- ✅ Detecta `dangerouslySetInnerHTML` sem sanitização
- ✅ Verifica user input em queries diretas
- ✅ Analisa concatenação de strings em SQL

### 4. Rate Limiting

- ✅ Verifica rate limiting em endpoints públicos
- ✅ Detecta `/api/auth/*` sem proteção
- ✅ Sugere implementação de rate limit

### 5. Secrets & Environment Variables

- ✅ Detecta secrets hardcoded no código
- ✅ Verifica uso correto de `process.env`
- ✅ Identifica `NEXT_PUBLIC_` expondo dados sensíveis
- ✅ Valida .env.example vs .env

### 6. OWASP Top 10 Compliance

- ✅ A01 - Broken Access Control
- ✅ A02 - Cryptographic Failures
- ✅ A03 - Injection
- ✅ A04 - Insecure Design
- ✅ A05 - Security Misconfiguration
- ✅ A07 - Identification and Authentication Failures
- ✅ A08 - Software and Data Integrity Failures

---

## 🚀 Como Usar

### Scan Completo do Projeto

```bash
npm run ai:security
```

### Scan de Arquivo Específico

```bash
npm run ai:security -- --file src/app/api/admin/users/route.ts
```

### Scan Rápido (Apenas Critical/High)

```bash
npm run ai:security -- --quick
```

### Scan com Auto-Fix (Experimental)

```bash
npm run ai:security -- --auto-fix
```

---

## 📊 Tipos de Issues Detectadas

### 🔴 CRITICAL - Bloqueadores

```typescript
// ❌ Senha hardcoded
const password = "admin123";

// ❌ API sem autenticação
export async function DELETE(req: NextRequest) {
  await prisma.user.delete({ ... }); // SEM auth()!
}

// ❌ SQL Injection vulnerável
const query = `SELECT * FROM users WHERE id = ${req.body.id}`;
```

### 🟠 HIGH - Riscos Sérios

```typescript
// ❌ Sem validação Zod
export async function POST(req: NextRequest) {
  const body = await req.json(); // Direto sem safeParse!
  await prisma.user.create({ data: body });
}

// ❌ Role check faltando
const session = await auth();
if (!session)
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Faltou: if (session.user.role !== 'ADMIN') ...
```

### 🟡 MEDIUM - Más Práticas

```typescript
// ⚠️ Rate limiting ausente
export async function POST(req: NextRequest) {
  // Endpoint público sem rate limit
  await sendEmail(...);
}

// ⚠️ Erro genérico expõe stack trace
catch (error) {
  return NextResponse.json({ error: error.message }); // Expõe detalhes!
}
```

---

## 🛠️ Configuração

### 1. Variáveis de Ambiente

```bash
# .env
OPENAI_API_KEY=sk-...
AI_BLOCK_INSECURE=true
AI_MIN_SEVERITY=HIGH
```

### 2. Regras Customizadas

Edite `rules.ts` para adicionar regras específicas do projeto:

```typescript
export const customRules: SecurityRule[] = [
  {
    id: 'custom-01',
    name: 'Verificar feature flags',
    severity: 'MEDIUM',
    pattern: /canAccessFeature\(/,
    message: 'Feature flag sem fallback',
  },
];
```

### 3. Exceções (Whitelist)

Adicione arquivos/padrões para ignorar:

```typescript
// config.ts
export const IGNORE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'prisma/migrations/**',
  'public/**',
];
```

---

## 📈 Relatórios

Relatórios são gerados em `salao-ia/reports/security/`:

```
reports/
  └── security/
      ├── 2025-12-21_14-30-00.json    # JSON estruturado
      ├── 2025-12-21_14-30-00.html    # Visualização web
      └── latest.json                 # Sempre o mais recente
```

### Exemplo de Relatório JSON

```json
{
  "timestamp": "2025-12-21T14:30:00.000Z",
  "scanDuration": "12.3s",
  "filesScanned": 245,
  "issuesFound": 8,
  "summary": {
    "CRITICAL": 2,
    "HIGH": 3,
    "MEDIUM": 3,
    "LOW": 0,
    "INFO": 0
  },
  "issues": [
    {
      "id": "SEC-001",
      "severity": "CRITICAL",
      "file": "src/app/api/admin/users/route.ts",
      "line": 45,
      "rule": "missing-auth-check",
      "message": "Rota DELETE sem validação de auth()",
      "suggestion": "Adicionar: const session = await auth(); if (!session) return ...",
      "code": "export async function DELETE(req: NextRequest) { ... }"
    }
  ]
}
```

---

## 🔗 Integrações

### GitHub Actions (CI/CD)

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run ai:security
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: salao-ia/reports/security/latest.json
```

### Pre-Commit Hook (Husky)

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run ai:security -- --quick --block-critical
```

### Slack Notifications

```typescript
// Configurado em config.ts
if (criticalIssues.length > 0) {
  await sendSlackAlert({
    webhook: process.env.AI_SLACK_WEBHOOK,
    message: `🚨 ${criticalIssues.length} vulnerabilidades críticas detectadas!`,
  });
}
```

---

## 🧪 Testes

```bash
# Testar detecção de vulnerabilidades conhecidas
npm run test:security

# Testar com arquivo de exemplo inseguro
npm run ai:security -- --file salao-ia/secure-ops-ai/tests/unsafe-example.ts
```

---

## 📚 Referências

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [NextAuth.js Security Best Practices](https://next-auth.js.org/security)
- [Zod Validation Guide](https://zod.dev/)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)

---

**Desenvolvido com excelência pela VisionVII** — código seguro é código confiável.
