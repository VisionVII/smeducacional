# 📚 Plano de Limpeza e Reorganização da Documentação

**Data**: 10 de dezembro de 2025  
**Status**: 🟡 Aguardando Aprovação

---

## 🔍 Análise Atual

**Total de arquivos .md**: 84 documentos  
**Problema**: Duplicação, falta de hierarquia, docs de troubleshooting já resolvidos

---

## 🎯 Estrutura Proposta

```
/
├── README.md                          # Overview principal do projeto
├── QUICK_START.md                     # Setup rápido para devs
├── CHANGELOG.md                       # Histórico de versões
├── CONTRIBUTING.md                    # Guia de contribuição
├── SECURITY.md                        # Políticas de segurança
│
├── .github/
│   ├── copilot-instructions.md        # ✅ Instruções para AI agents
│   └── workflows/
│       └── ci.yml                     # GitHub Actions
│
└── docs/
    ├── README.md                      # Índice da documentação
    ├── ROADMAP.md                     # ✅ Roadmap de features
    │
    ├── setup/                         # 🆕 Guias de configuração
    │   ├── DATABASE.md                # PostgreSQL + Prisma
    │   ├── AUTHENTICATION.md          # NextAuth setup
    │   ├── STORAGE.md                 # Supabase Storage
    │   ├── PAYMENTS.md                # Stripe integration
    │   ├── EMAIL.md                   # Resend setup
    │   └── DEPLOYMENT.md              # Vercel deploy
    │
    ├── features/                      # Documentação de funcionalidades
    │   ├── authentication/
    │   ├── courses/
    │   ├── payments/
    │   ├── notifications/
    │   ├── certificates/             # 🆕
    │   ├── analytics/                # 🆕
    │   ├── calendar/                 # 🆕
    │   └── gamification/             # 🆕
    │
    ├── api/                           # 🆕 Documentação de API
    │   ├── README.md                  # Overview das APIs
    │   ├── authentication.md          # /api/auth/*
    │   ├── student.md                 # /api/student/*
    │   ├── teacher.md                 # /api/teacher/*
    │   └── admin.md                   # /api/admin/*
    │
    ├── architecture/                  # 🆕 Decisões técnicas
    │   ├── DATABASE_SCHEMA.md         # Modelos Prisma explicados
    │   ├── AUTHENTICATION.md          # NextAuth + RBAC
    │   ├── FILE_STRUCTURE.md          # Organização de pastas
    │   └── TECH_DECISIONS.md          # Por que Next.js, etc.
    │
    ├── testing/                       # 🆕 Guias de teste
    │   ├── UNIT_TESTS.md
    │   ├── E2E_TESTS.md
    │   └── MANUAL_TESTING.md
    │
    ├── performance/                   # 🆕 Otimização
    │   ├── MONITORING.md
    │   ├── CACHING.md
    │   └── OPTIMIZATION.md
    │
    └── archive/                       # 🗄️ Docs antigos (histórico)
        ├── troubleshooting/           # Fixes já resolvidos
        ├── status/                    # Phase reports antigos
        └── vercel-setup-old/          # Múltiplos VERCEL_*.md
```

---

## 🗑️ Arquivos para Arquivar

### **Troubleshooting (já resolvidos)**

```
✅ Mover para docs/archive/troubleshooting/

- ERRO_CONFIGURATION.md
- FIX_DATABASE_URL.md
- LOGIN_FIX_GUIDE.md
- NEXTAUTH_SECRET_FIX.md
- TOKEN_DIAGNOSTIC.md
- VERCEL_AUTH_FIX.md
- VERCEL_TROUBLESHOOTING.md
- docs/troubleshooting/BOM_FIX.md
- docs/troubleshooting/DASHBOARD_FIX.md
- docs/troubleshooting/ERROR_500_FIX.md
- docs/troubleshooting/PORT_CHANGE.md
- docs/troubleshooting/RLS_FIX.md
- docs/troubleshooting/STORAGE_RLS_*.md
- docs/troubleshooting/THEME_DEBUG.md
- docs/troubleshooting/THEMES_FIX.md
```

### **Status Reports (já completos)**

```
✅ Mover para docs/archive/status/

- BUILD_LOG.md
- CRON_DEPLOYMENT_STATUS.md
- CRON_FINAL_STATUS.md
- DEPLOY_STATUS.md
- IMPLEMENTATION_REPORT.md
- docs/status/CHECKLIST*.md
- docs/status/PHASE_2_*.md
- docs/status/TESTING_TEACHER.md
```

### **Setup Duplicados (consolidar)**

```
✅ Consolidar em docs/setup/

Vercel (8 arquivos):
- VERCEL_AUTH_FIX.md
- VERCEL_CHECKLIST.md
- VERCEL_DEPLOYMENT.md
- VERCEL_ENV_SETUP_PRODUCTION.md
- VERCEL_ENV_TEMPLATE.md
- VERCEL_LOGIN_SETUP.md
- VERCEL_QUICK_START.md
- VERCEL_TESTING.md
→ Consolidar em docs/setup/DEPLOYMENT.md

Supabase (5 arquivos):
- SUPABASE_CONNECTION.md
- SUPABASE_STORAGE_SETUP.md
- SUPABASE_STORAGE_VIDEO_SETUP.md
- SUPABASE_VIDEO_SETUP.md
- RLS_SETUP.md
→ Consolidar em docs/setup/STORAGE.md

Outros:
- GOOGLE_OAUTH_SETUP.md → docs/setup/AUTHENTICATION.md
- RESEND_EMAIL_SETUP.md → docs/setup/EMAIL.md
- GITHUB_ACTIONS_SETUP.md → .github/workflows/README.md
```

### **Features (organizar por pasta)**

```
✅ Mover para docs/features/

Animations (8 arquivos):
- docs/features/animations/* → OK (já organizados)

Themes (6 arquivos):
- docs/features/themes/* → OK (já organizados)

Payments (3 arquivos):
- docs/PAYMENT_SYSTEM.md → docs/features/payments/README.md
- FEATURE_UNLOCK_*.md → docs/features/payments/FEATURE_GATING.md
- docs/FEATURE_UNLOCK_*.md → docs/features/payments/
```

---

## ✅ Arquivos para Manter na Raiz

```
README.md                    # Overview principal
QUICK_START.md               # Setup rápido
SECURITY.md                  # Políticas de segurança
.github/copilot-instructions.md  # AI agent instructions
```

---

## 🆕 Novos Arquivos a Criar

```
CHANGELOG.md                 # Histórico de versões
CONTRIBUTING.md              # Guia de contribuição
docs/setup/*.md              # Guias consolidados
docs/api/README.md           # Documentação de APIs
docs/architecture/*.md       # Decisões arquiteturais
docs/testing/*.md            # Guias de teste
```

---

## 📋 Plano de Execução

### **Fase 1: Backup (Segurança)**

```bash
# Criar branch de backup antes de mover arquivos
git checkout -b docs/cleanup-backup
git push origin docs/cleanup-backup
```

### **Fase 2: Criar Estrutura**

```bash
mkdir -p docs/{setup,api,architecture,testing,performance,archive/{troubleshooting,status,vercel-setup-old}}
```

### **Fase 3: Mover Arquivos (Git mv)**

```bash
# Preserva histórico do Git
git mv ERRO_CONFIGURATION.md docs/archive/troubleshooting/
git mv BUILD_LOG.md docs/archive/status/
# ... etc
```

### **Fase 4: Consolidar Duplicados**

- Criar `docs/setup/DEPLOYMENT.md` unificando 8 docs Vercel
- Criar `docs/setup/STORAGE.md` unificando 5 docs Supabase
- Atualizar links internos

### **Fase 5: Criar Novos Docs**

- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `docs/api/README.md`
- `docs/architecture/*.md`

### **Fase 6: Atualizar README Principal**

- Adicionar seção "Documentation"
- Links para docs principais
- Badges de status

### **Fase 7: Commit e PR**

```bash
git add .
git commit -m "docs: reorganize documentation structure"
git push origin docs/cleanup
# Criar PR para review
```

---

## 🎯 Resultado Esperado

**Antes**: 84 arquivos .md espalhados, duplicados, desorganizados  
**Depois**: ~30 arquivos .md bem organizados, com hierarquia clara

**Benefícios**:

- ✅ Fácil navegação
- ✅ Sem duplicação
- ✅ Histórico preservado (git mv)
- ✅ Manutenção simplificada
- ✅ Onboarding mais rápido

---

## ⏱️ Tempo Estimado

- Fase 1-2: 30 minutos
- Fase 3: 1-2 horas
- Fase 4-5: 2-3 horas
- Fase 6-7: 1 hora

**Total**: 4-6 horas

---

## 🚨 Aprovação Necessária

Antes de executar, confirmar:

- [ ] Aprovação para arquivar troubleshooting resolvidos
- [ ] Aprovação para consolidar docs duplicados
- [ ] Definir se mantemos histórico completo em archive/

---

**Desenvolvido com excelência pela VisionVII** — Software, inovação e transformação digital.
