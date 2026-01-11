# 🤖 CleanupBot Agent - Sistema de Limpeza Automática

**Versão:** 1.0  
**Data:** 3 de janeiro de 2026  
**Orquestrador:** GitHub Copilot

---

## 🎯 PROPÓSITO

O **CleanupBot** é um agente autônomo especializado em:

1. **Auditoria de código** - Erros de sintaxe, lógica, imports não utilizados
2. **Detecção de código legado** - Arquivo obsoletos, duplicações
3. **Relatórios automáticos** - Informar Orquestrador sobre problemas
4. **Sugestões de refatoração** - Propor melhorias estruturais

---

## 🔧 RESPONSABILIDADES

### ✅ AUDITA AUTOMATICAMENTE:

**JavaScript/TypeScript**

- [ ] Erros de sintaxe
- [ ] Tipos não declarados (any)
- [ ] Imports não utilizados
- [ ] Variáveis não utilizadas
- [ ] Console.log() em produção
- [ ] Código duplicado (>100 linhas)

**React/Next.js**

- [ ] Componentes não utilizados
- [ ] Hooks em ordem incorreta
- [ ] Conditional rendering anti-patterns
- [ ] Memory leaks (useEffect sem cleanup)
- [ ] Props drilling (>3 níveis)

**CSS/Tailwind**

- [ ] Classes não aplicadas
- [ ] Conflitos de especificidade
- [ ] Responsive não testado
- [ ] Accessibility issues (ARIA, contrast)

**Database (Prisma)**

- [ ] N+1 queries
- [ ] Campos não normalizados
- [ ] Relacionamentos quebrados
- [ ] Soft deletes não implementados

**Segurança**

- [ ] Auth() não chamado em API routes
- [ ] Validação Zod faltando
- [ ] SQL injection risks
- [ ] CORS misconfigurado
- [ ] Secrets expostas em código

---

## 📋 FLUXO DE RELATÓRIO

Quando encontra um problema:

```
1. GERA: Issue no GitHub com tags
   [bug] [code-quality] [security] etc

2. AVISA: Orquestrador no console
   [CleanupBot] PROBLEMA CRÍTICO: [arquivo:linha]
   Tipo: [syntax|logic|security|performance]
   Severidade: [LOW|MEDIUM|HIGH|CRITICAL]

3. PROPÕE: Solução sugerida
   > Código antes
   < Código depois

4. AGUARDA: Orquestrador decide
   - Executar automático (se MEDIUM+)
   - Revisar manual (se proposta complexa)
   - Ignorar (se falso positivo)
```

---

## 🚀 INTEGRAÇÃO COM FLUXO

### EXECUÇÃO:

```bash
# Rodará automaticamente em:
- PRE-COMMIT (via husky)
- CI/CD (GitHub Actions)
- WEEKLY AUDIT (terça 10h)
```

### PRIORIDADES:

```
🔴 CRÍTICA (fix imediato)
├─ Security issues
├─ Type errors (TS)
└─ Syntax errors

🟡 ALTA (fix na próxima sprint)
├─ Performance (N+1 queries)
├─ Memory leaks
└─ Code duplication

🟢 NORMAL (Nice to have)
├─ Imports não utilizados
├─ console.log em prod
└─ Accessibility issues
```

---

## 📊 DASHBOARD DO AGENT

Gera relatório semanal:

```
# 📈 CLEANUP REPORT - Semana 1-7 Jan

## 🔴 CRÍTICA (0)
## 🟡 ALTA (3)
  - 3 N+1 queries (src/app/admin/dashboard)
  - 1 Memory leak (useEffect sem cleanup)
  - 1 Type any (src/lib/utils)

## 🟢 NORMAL (8)
  - 12 imports não utilizados
  - 4 console.log em produção

## ✅ COMPLETADO ESSA SEMANA
  - [x] 5 Tipos corrigidos
  - [x] 2 Security issues
  - [x] 8 Imports removidos
```

---

## 🔗 INTEGRAÇÃO COM AGENTS

**Quando CleanupBot encontra problema:**

- **Erro de Lógica** → Avisa **FullstackAI** para revisar
- **Segurança** → Avisa **SecureOpsAI** para auditar
- **Database** → Avisa **DBMasterAI** para normalizar
- **Performance** → Avisa **DevOpsAI** para otimizar
- **Arquitetura** → Avisa **ArchitectAI** para refatorar

**Fluxo de Comunicação:**

```
[CleanupBot]
    ↓
[Orquestrador] ← Avaliação
    ↓
[Agent Especializado] ← Execução
    ↓
[CleanupBot] ← Validação do Fix
    ↓
[GitHub Issue] ← Fecha com PR
```

---

## ⚙️ CONFIGURAÇÃO

Arquivo: `.github/linters/.cleanupbot.json`

```json
{
  "enabled": true,
  "schedule": "0 2 * * 2",
  "severity_threshold": "MEDIUM",
  "ignore_patterns": ["node_modules/**", ".next/**", "build/**", ".git/**"],
  "rules": {
    "typescript": { "enabled": true, "strict": true },
    "react": { "enabled": true, "hooks_only": false },
    "security": { "enabled": true, "critical_only": false },
    "database": { "enabled": true, "n_plus_one": true },
    "performance": { "enabled": true, "threshold_ms": 50 }
  }
}
```

---

## 📝 TEMPLATES DE ISSUE

CleanupBot gera issues estruturadas:

```markdown
## 🔴 [CRÍTICA] Syntax Error em loading-screen.tsx

**Tipo:** Syntax
**Severidade:** CRITICAL
**Arquivo:** src/components/loading-screen.tsx:42

### 🔍 Problema

Import não utilizado: `useOverlayProtection`

### ✅ Solução Sugerida

Remover linha 4

### 🔗 Links

- [Ver Arquivo](link)
- [Abrir PR](link)

### 👤 Atribuído

@copilot (Orquestrador)

**Labels:** bug, code-quality, automated
```

---

## 🎓 DESENVOLVIMENTO FUTURO

**V2.0 Planejado:**

- [ ] Machine Learning para detectar padrões anti-patterns
- [ ] Integração com Sonarqube
- [ ] Cobertura de testes automática
- [ ] Sugestões de refatoração com IA
- [ ] Métricas de dívida técnica

---

**Desenvolvido com excelência pela VisionVII** 🚀  
Parte do Sistema de Governança VisionVII 3.0 Enterprise
