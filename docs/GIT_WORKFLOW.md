# 🌿 Git Workflow - VisionVII SM Educacional

**Versão**: 1.0.0  
**Data**: 10 de dezembro de 2025

---

## 🎯 Objetivo

Estabelecer um fluxo de trabalho Git profissional que:

- ✅ Mantém `main` sempre estável (production-ready)
- ✅ Permite desenvolvimento paralelo seguro
- ✅ Facilita code review e rollback
- ✅ Integra com Vercel preview deploys
- ✅ Previne bugs em produção

---

## 🌳 Estrutura de Branches

```
main (production)
  ↓
dev (staging/integration)
  ↓
feature/* (novas funcionalidades)
fix/* (correções de bugs)
docs/* (documentação)
refactor/* (refatoração)
```

### **Descrição das Branches**

#### `main` - Produção

- **Propósito**: Código em produção (deploy Vercel)
- **Proteções**:
  - ⛔ Commits diretos BLOQUEADOS
  - ✅ Apenas via Pull Request
  - ✅ Review obrigatório
  - ✅ CI/CD deve passar
- **Deploy**: Automático na Vercel (production)

#### `dev` - Desenvolvimento

- **Propósito**: Integração e testes antes de produção
- **Proteções**:
  - ⚠️ Commits diretos permitidos (mas desencorajados)
  - ✅ Preferir Pull Requests de feature branches
- **Deploy**: Automático na Vercel (preview)
- **Sincronização**: Merge para `main` após validação

#### `feature/*` - Novas Funcionalidades

- **Convenção**: `feature/nome-descritivo`
- **Exemplos**:
  - `feature/pdf-certificates`
  - `feature/advanced-analytics`
  - `feature/video-player-improvements`
- **Origem**: Criado a partir de `dev`
- **Destino**: Merge de volta para `dev`
- **Lifecycle**: Deletar após merge

#### `fix/*` - Correções

- **Convenção**: `fix/descricao-do-bug`
- **Exemplos**:
  - `fix/auth-cookie-mismatch`
  - `fix/upload-timeout`
- **Urgência**: Se crítico, pode mergear direto para `main` + `dev`

#### `docs/*` - Documentação

- **Convenção**: `docs/topico`
- **Exemplos**:
  - `docs/api-documentation`
  - `docs/cleanup`
- **Destino**: Merge para `dev`

---

## 🚀 Setup Inicial

### **1. Criar Branch `dev`**

```bash
# No main
git checkout main
git pull origin main

# Criar dev
git checkout -b dev
git push origin dev

# Definir dev como branch padrão para novas features
git config branch.dev.description "Development/staging branch"
```

### **2. Proteger Branch `main` no GitHub**

1. Ir para: **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Configurações:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
   - ✅ **Do not allow bypassing the above settings**
4. Salvar

### **3. Configurar Vercel**

1. **Production Branch**: `main`
2. **Preview Branches**: All branches (automático)
3. **Environment Variables**: Já configurado

---

## 🔄 Workflow Diário

### **Cenário 1: Nova Feature**

```bash
# 1. Garantir que dev está atualizado
git checkout dev
git pull origin dev

# 2. Criar feature branch
git checkout -b feature/pdf-certificates

# 3. Desenvolver (commits frequentes)
git add .
git commit -m "feat: add certificate generation logic"

git add .
git commit -m "feat: add certificate download API"

# 4. Push para remote
git push origin feature/pdf-certificates

# 5. Criar Pull Request no GitHub
# - Base: dev
# - Compare: feature/pdf-certificates
# - Preencher template de PR
# - Solicitar review

# 6. Após aprovação e merge
git checkout dev
git pull origin dev
git branch -d feature/pdf-certificates  # Deletar local
git push origin --delete feature/pdf-certificates  # Deletar remote
```

### **Cenário 2: Bug Fix Urgente**

```bash
# 1. Partir de main (produção)
git checkout main
git pull origin main

# 2. Criar fix branch
git checkout -b fix/auth-cookie-production

# 3. Corrigir e testar localmente
git add .
git commit -m "fix: auth cookie name for production environment"

# 4. Push
git push origin fix/auth-cookie-production

# 5. Criar 2 PRs:
# PR 1: fix/auth-cookie-production → main (URGENTE)
# PR 2: fix/auth-cookie-production → dev (SYNC)

# 6. Após merge, deletar branch
git branch -d fix/auth-cookie-production
```

### **Cenário 3: Atualizar Feature com Dev**

```bash
# Você está em feature/analytics e dev foi atualizado

# 1. Commitar trabalho atual
git add .
git commit -m "wip: analytics dashboard"

# 2. Trazer mudanças de dev
git fetch origin
git rebase origin/dev
# OU (se preferir merge)
git merge origin/dev

# 3. Resolver conflitos (se houver)
git add .
git rebase --continue
# OU
git merge --continue

# 4. Push (se já havia push anterior, usar --force-with-lease)
git push origin feature/analytics --force-with-lease
```

### **Cenário 4: Release para Produção**

```bash
# 1. Validar que dev está estável
# - Todos os testes passando
# - Preview deploy funcionando
# - Features testadas

# 2. Criar PR: dev → main
# Título: "Release v1.2.0 - Analytics & Certificates"
# Descrição: Lista de features incluídas

# 3. Review final

# 4. Merge para main
# - Vercel faz deploy automático
# - Monitorar logs

# 5. Tag de versão
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0: Analytics & Certificates"
git push origin v1.2.0

# 6. Atualizar CHANGELOG.md
```

---

## 📝 Conventional Commits

### **Formato**

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### **Tipos**

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Adição/correção de testes
- `chore`: Manutenção (deps, config)
- `perf`: Melhoria de performance
- `ci`: Mudanças em CI/CD

### **Exemplos**

```bash
git commit -m "feat(auth): add 2FA for admin users"
git commit -m "fix(player): resolve video buffering issue on Safari"
git commit -m "docs(api): add authentication endpoint documentation"
git commit -m "refactor(db): optimize course queries with includes"
git commit -m "test(certificates): add unit tests for PDF generation"
```

---

## 🔍 Pull Request Template

Criar arquivo `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## 📋 Descrição

Breve descrição da mudança e contexto.

## 🎯 Tipo de Mudança

- [ ] 🐛 Bug fix (correção que resolve um issue)
- [ ] ✨ Nova feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (fix ou feature que quebra compatibilidade)
- [ ] 📝 Documentação
- [ ] 🔧 Refatoração

## 🧪 Como Testar

1. Passo 1
2. Passo 2
3. Resultado esperado

## ✅ Checklist

- [ ] Código testado localmente
- [ ] Testes automatizados adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem erros TypeScript
- [ ] Preview deploy validado
- [ ] Code review solicitado

## 📸 Screenshots (se aplicável)

[Adicionar imagens]

## 🔗 Issues Relacionados

Closes #123
```

---

## 🛡️ Boas Práticas

### **DO ✅**

- Commits pequenos e focados
- Mensagens de commit descritivas
- Testar localmente antes de push
- Resolver conflitos rapidamente
- Deletar branches após merge
- Code review minucioso
- Atualizar feature branch com dev regularmente

### **DON'T ❌**

- Commits diretos em `main`
- Commits gigantes ("fix everything")
- Mensagens vagas ("fix", "update")
- Deixar conflitos sem resolver
- Acumular branches antigas
- Skip de testes
- Merge sem review

---

## 🚨 Emergências

### **Rollback de Produção**

```bash
# 1. Identificar último commit bom
git log --oneline

# 2. Reverter para commit específico
git checkout main
git revert <commit-hash>
git push origin main

# 3. Vercel faz deploy automático

# 4. Investigar e corrigir em feature branch
```

### **Hotfix Crítico**

```bash
# 1. Partir de main
git checkout main
git checkout -b hotfix/critical-security-fix

# 2. Corrigir
git commit -m "fix(security): patch SQL injection vulnerability"

# 3. Merge direto para main
# (Pular review se MUITO crítico)
git checkout main
git merge hotfix/critical-security-fix
git push origin main

# 4. Sync com dev
git checkout dev
git merge hotfix/critical-security-fix
git push origin dev

# 5. Tag de patch
git tag -a v1.2.1 -m "Security hotfix"
git push origin v1.2.1
```

---

## 📊 Monitoramento

### **Métricas de Saúde do Workflow**

- **Branches ativas**: < 5 simultâneas
- **Tempo médio de PR**: < 48h
- **Conflitos de merge**: < 10% das PRs
- **Rollbacks**: < 1 por mês
- **Main uptime**: 99.9%

---

## 🔗 Integrações

### **Vercel**

- Main → Production deploy
- Outras branches → Preview deploy
- Comentários automáticos em PRs

### **GitHub Actions** (futuro)

- CI/CD: lint, type-check, tests
- Auto-assign reviewers
- Label automation

---

## 📚 Referências

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Desenvolvido com excelência pela VisionVII** — Software, inovação e transformação digital.
