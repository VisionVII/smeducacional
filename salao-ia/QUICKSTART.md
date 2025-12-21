# 🚀 Salão IA - Quick Start Guide

## 1️⃣ Configuração Inicial (5 minutos)

### Passo 1: Instalar Dependências

```bash
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp salao-ia/.env.example .env

# Editar .env e adicionar sua API key da OpenAI
# OPENAI_API_KEY=sk-...
```

**Obter API Key da OpenAI:**

1. Acesse: <https://platform.openai.com/api-keys>
2. Crie uma nova API key
3. Cole no `.env`

---

## 2️⃣ Usar SecureOpsAI (Agente de Segurança)

### Scan Completo do Projeto

```bash
npm run ai:security
```

**Output esperado:**

```text
🔒 SecureOpsAI - Iniciando scan de segurança...

📁 Arquivos a escanear: 245

⚡ Fase 1: Análise estática...
   245/245 arquivos escaneados...

🧠 Fase 2: Análise com GPT-4...
   42/42 API routes analisadas com GPT...

✅ Scan completo em 12.3s

═══════════════════════════════════════════════════════════

📊 RESUMO DO SCAN

   Arquivos escaneados: 245
   Duração: 12.3s
   Issues encontradas: 8
   Compliance Score: 85/100

📈 POR SEVERIDADE:

   🔴 CRITICAL: 2
   🟠 HIGH: 3
   🟡 MEDIUM: 3

🔍 TOP ISSUES:

   1. 🔴 [CRITICAL] Rota DELETE sem validação de auth()
      Arquivo: src/app/api/admin/users/route.ts:45
      Sugestão: Adicionar: const session = await auth(); ...

   2. 🟠 [HIGH] API route processa req.body sem validação Zod
      Arquivo: src/app/api/courses/route.ts:78
      Sugestão: Use Zod: const result = schema.safeParse(body); ...

💡 RECOMENDAÇÕES:

   🚨 URGENTE: Corrija vulnerabilidades CRITICAL antes de deploy!
   ⚠️  Priorize correção de issues HIGH
   ✅ Use pre-commit hook para scan automático

═══════════════════════════════════════════════════════════

📄 Relatório salvo: salao-ia/reports/security/2025-12-21_14-30-00.json
```

---

### Scan Rápido (Apenas Regras Estáticas)

```bash
npm run ai:security:quick
```

⚡ **Mais rápido** - Não usa GPT-4, apenas regex rules  
⏱️ **Tempo**: ~3 segundos para 200+ arquivos

---

### Scan Profundo (GPT-4 em Todos Arquivos)

```bash
npm run ai:security:deep
```

🧠 **Mais completo** - GPT-4 analisa até componentes React  
⏱️ **Tempo**: ~30-60 segundos (depende do número de arquivos)

---

### Scan de Arquivo Específico

```bash
npm run ai:security -- --file src/app/api/admin/users/route.ts
```

---

## 3️⃣ Entender Níveis de Severidade

| Nível           | O que Significa                         | Ação                          |
| --------------- | --------------------------------------- | ----------------------------- |
| 🔴 **CRITICAL** | Vulnerabilidade grave, deploy bloqueado | ❌ Corrigir AGORA             |
| 🟠 **HIGH**     | Risco alto, autenticação/validação      | ⚠️ Corrigir antes de produção |
| 🟡 **MEDIUM**   | Má prática, pode virar problema         | 📝 Corrigir em breve          |
| 🔵 **LOW**      | Melhoria de código                      | 💡 Opcional                   |
| ⚪ **INFO**     | Informativo, sem risco                  | ℹ️ Apenas log                 |

---

## 4️⃣ Interpretar Relatório JSON

O relatório completo é salvo em: `salao-ia/reports/security/latest.json`

```json
{
  "timestamp": "2025-12-21T14:30:00.000Z",
  "scanDuration": "12.3s",
  "filesScanned": 245,
  "issuesFound": 8,
  "blocked": false,
  "summary": {
    "CRITICAL": 2,
    "HIGH": 3,
    "MEDIUM": 3,
    "LOW": 0,
    "INFO": 0
  },
  "issues": [
    {
      "id": "AUTH-001-1703171400000",
      "ruleId": "AUTH-001",
      "severity": "CRITICAL",
      "category": "authentication",
      "file": "src/app/api/admin/users/route.ts",
      "line": 45,
      "message": "API route não possui validação de autenticação",
      "code": "export async function DELETE(req: NextRequest) {",
      "suggestion": "Adicionar: const session = await auth(); if (!session) return ...",
      "owaspReference": "A07:2021 – Identification and Authentication Failures",
      "timestamp": "2025-12-21T14:30:00.000Z"
    }
  ],
  "recommendations": [
    "🚨 URGENTE: Corrija vulnerabilidades CRITICAL antes de deploy!",
    "⚠️ Priorize correção de issues HIGH",
    "✅ Use pre-commit hook para scan automático"
  ],
  "complianceScore": 85
}
```

---

## 5️⃣ Workflow Recomendado

### Desenvolvimento Diário

```bash
# Antes de fazer commit
npm run ai:security:quick

# Se encontrar issues HIGH/CRITICAL, corrigir antes de commit
```

### Antes de Pull Request

```bash
# Scan completo com GPT-4
npm run ai:security

# Garantir compliance score > 80
```

### CI/CD (GitHub Actions)

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
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: salao-ia/reports/security/latest.json
```

---

## 6️⃣ Troubleshooting

### ❌ Erro: "OPENAI_API_KEY não definida"

**Solução**: Adicione a API key no `.env`

```bash
OPENAI_API_KEY=sk-your-key-here
```

### ❌ Erro: "Module 'openai' not found"

**Solução**: Instale as dependências

```bash
npm install
```

### ⚠️ Scan muito lento

**Solução**: Use scan rápido ou reduza arquivos

```bash
# Scan rápido (sem GPT-4)
npm run ai:security:quick

# Ou scan apenas de API routes críticas
npm run ai:security -- --file "src/app/api/**/*.ts"
```

### ⚠️ Muitas issues INFO/LOW

**Solução**: Ajuste severidade mínima no `.env`

```bash
AI_MIN_SEVERITY=MEDIUM  # Ignora LOW e INFO
```

---

## 7️⃣ Próximos Passos

### Integrar no Workflow

```bash
# Instalar Husky para pre-commit hooks
npx husky-init && npm install

# Adicionar hook
echo "npm run ai:security:quick" > .husky/pre-commit
```

### Explorar Outros Agentes (Em Breve)

- **ArchitectAI**: Validação de Clean Architecture
- **UIDirectorAI**: Consistência de Design System
- **PerfAI**: Análise de performance
- **DBMasterAI**: Otimização de queries Prisma

---

## 8️⃣ Recursos

- 📚 **Documentação Completa**: `salao-ia/secure-ops-ai/README.md`
- 🔐 **Regras de Segurança**: `salao-ia/secure-ops-ai/rules.ts`
- 🧪 **Arquivo de Teste**: `salao-ia/secure-ops-ai/tests/unsafe-example.md`
- 📊 **Relatórios**: `salao-ia/reports/security/`

---

## 💡 Dicas Pro

### Escanear Apenas Mudanças Git

```bash
# Listar arquivos modificados
git diff --name-only

# Scan apenas desses arquivos
git diff --name-only | xargs -I {} npm run ai:security -- --file {}
```

### Integrar com VS Code

Adicione task em `.vscode/tasks.json`:

```json
{
  "label": "Security Scan",
  "type": "npm",
  "script": "ai:security",
  "problemMatcher": []
}
```

### Ignorar False Positives

Edite `salao-ia/secure-ops-ai/config.ts`:

```typescript
export const IGNORE_PATTERNS = [
  'node_modules/**',
  'src/app/api/webhooks/**', // Webhooks públicos ok
];
```

---

**Desenvolvido com excelência pela VisionVII** — código seguro é código confiável.
