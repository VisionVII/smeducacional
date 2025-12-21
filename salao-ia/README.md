# 🤖 Salão IA — Sistema de Agentes Inteligentes VisionVII

> Infraestrutura de múltiplos agentes especializados com GPT-4 para automação, segurança e qualidade de código.

## 📋 Índice de Agentes

### 1. 🔒 **SecureOpsAI** — Segurança & Compliance

**Status**: ✅ Implementado  
**Função**: Auditoria de segurança, RBAC, validações Zod, rate limiting  
**Pasta**: `./secure-ops-ai/`

### 2. 🏗️ **ArchitectAI** — Arquitetura & Design

**Status**: 🔄 Planejado  
**Função**: Validação de Clean Architecture, DDD, padrões de código  
**Pasta**: `./architect-ai/`

### 3. 🎨 **UIDirectorAI** — Design System & UX

**Status**: 🔄 Planejado  
**Função**: Consistência visual, Shadcn/UI, acessibilidade, responsividade  
**Pasta**: `./ui-director-ai/`

### 4. ⚡ **PerfAI** — Performance & Otimização

**Status**: 🔄 Planejado  
**Função**: Caching, bundle size, React optimization, queries Prisma  
**Pasta**: `./perf-ai/`

### 5. 🗄️ **DBMasterAI** — Database & Prisma

**Status**: 🔄 Planejado  
**Função**: Schema optimization, migrations, query analysis  
**Pasta**: `./db-master-ai/`

### 6. 📝 **DocProAI** — Documentação & Padrões

**Status**: 🔄 Planejado  
**Função**: READMEs, JSDoc, padronização de commits  
**Pasta**: `./doc-pro-ai/`

### 7. 🧪 **TestRunnerAI** — QA & Testes

**Status**: 🔄 Planejado  
**Função**: Unit tests, E2E, mocks, cobertura de código  
**Pasta**: `./test-runner-ai/`

### 8. 🔄 **OpsAI** — Automação & CI/CD

**Status**: 🔄 Planejado  
**Função**: Webhooks, logs, monitoramento, integração com Sentry  
**Pasta**: `./ops-ai/`

---

## 🚀 Como Usar

### Setup Inicial

```bash
# 1. Copiar .env.example para .env
cp .env.example .env

# 2. Adicionar API Key da OpenAI
# OPENAI_API_KEY=sk-...

# 3. Instalar dependências (se necessário)
npm install openai zod
```

### Executar Agente Específico

````bash
# SecureOpsAI - Scan de Segurança
npm run ai:security

# ArchitectAI - Validação de Arquitetura (futuro)
npm run ai:architecture

# UIDirectorAI - Análise de UI (futuro)
npm run ai:ui
```bash
npm run ai:security
````

---

## 🏗️ Estrutura de Cada Agente

```text
salao-ia/
  └── [nome-agente]/
      ├── config.ts           # Configuração GPT-4 + prompts
      ├── scanner.ts          # Lógica principal do agente
      ├── rules.ts            # Regras específicas do domínio
      ├── types.ts            # TypeScript interfaces
      ├── index.ts            # Entry point + CLI
      ├── README.md           # Documentação específica
      └── reports/            # Relatórios gerados
          └── .gitkeep
```

---

## 🔐 Variáveis de Ambiente

```env
# OpenAI API
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.2

# Configurações de Scan
AI_SCAN_DEPTH=full           # full | quick | deep
AI_AUTO_FIX=false            # true | false
AI_BLOCK_INSECURE=true       # Bloqueia commits inseguros
```

---

## 📊 Níveis de Severidade

| Nível           | Descrição                                      | Ação                    |
| --------------- | ---------------------------------------------- | ----------------------- |
| 🔴 **CRITICAL** | Vulnerabilidade grave, dados expostos          | ❌ Bloqueia deploy      |
| 🟠 **HIGH**     | Risco alto, RBAC incorreto, falta de validação | ⚠️ Alerta obrigatório   |
| 🟡 **MEDIUM**   | Má prática, performance issue                  | 📝 Sugestão de correção |
| 🔵 **LOW**      | Melhoria de código, legibilidade               | 💡 Opcional             |
| ⚪ **INFO**     | Informativo, sem risco                         | ℹ️ Apenas log           |

---

## 🎯 Workflows de Integração

### 1. Pre-Commit Hook (Recomendado)

```bash
# .husky/pre-commit
npm run ai:security --quick
```

### 2. GitHub Actions (CI/CD)

```yaml
- name: Security Scan
  run: npm run ai:security --full
```

### 3. Manual (Desenvolvimento)

```bash
npm run ai:security -- --file src/app/api/admin/users/route.ts
```

---

## 🧠 Tecnologias

- **GPT-4 Turbo** - Análise semântica avançada
- **TypeScript** - Type safety
- **Zod** - Validação de schemas
- **Prisma** - Análise de queries
- **AST Parser** - Análise sintática de código

---

## 📈 Roadmap

- [x] Estrutura base do Salão IA
- [x] SecureOpsAI v1.0
- [ ] ArchitectAI v1.0
- [ ] UIDirectorAI v1.0
- [ ] Dashboard Web para visualização de reports
- [ ] Integração com Slack/Discord
- [ ] Machine Learning para aprendizado contínuo
- [ ] Auto-fix automático (com confirmação)

---

## 🤝 Contribuindo

Cada agente segue os padrões definidos em `.github/copilot-instructions.md`.

**Desenvolvido com excelência pela VisionVII** — transformando desenvolvimento com inteligência artificial.
