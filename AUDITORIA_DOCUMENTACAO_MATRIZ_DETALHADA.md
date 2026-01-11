# 📋 MATRIZ DETALHADA - AUDITORIA DE DOCUMENTAÇÃO

**Documento Complementar:** AUDITORIA_DOCUMENTACAO_COMPLETA.md  
**Data:** 3 de janeiro de 2026

---

## 📊 MATRIZ COMPLETA: TODOS OS 265+ ARQUIVOS .MD

### Legenda de Status

- ✅ **MANTER** - Arquivo ativo, não mexer
- 🗑️ **DELETAR** - Seguro para deletar, info consolidada
- 🗂️ **ARQUIVAR** - Mover para docs/archive/ (referência histórica)
- 📋 **CONSOLIDAR** - Mesclar com outro arquivo
- 🔗 **REORGANIZAR** - Mover de pasta
- ⚠️ **REVISAR** - Desatualizado, precisa update
- ❓ **VERIFICAR** - Sem data, status unclear

---

## 🎯 CATEGORIA 1: STATUS & LOGS (42 arquivos)

### 1.1 Build Status (9 arquivos)

| Arquivo                 | Localização | Status | Ação    | Obs                                       |
| ----------------------- | ----------- | ------ | ------- | ----------------------------------------- |
| BUILD_LOG.md            | Raiz        | 🗑️     | DELETAR | Logs antigos de 15/12                     |
| BUILD_STATUS_FINAL.md   | Raiz        | 🗑️     | DELETAR | Finalizado, info em ORCHESTRATION         |
| BUILD_STATUS_PHASE_3.md | Raiz        | 🗑️     | DELETAR | Phase histórica                           |
| build-log.md            | Raiz        | 🗑️     | DELETAR | Duplicado em casing                       |
| CHECK_PHASE_2_SETUP.js  | scripts/    | 🔗     | MOVER   | Script de validação → scripts/validation/ |
| check-braces-v2.js      | Raiz        | 🗑️     | DELETAR | Script obsoleto                           |
| check-braces.js         | Raiz        | 🗑️     | DELETAR | Script obsoleto                           |
| check-theme.js          | Raiz        | 🗑️     | DELETAR | Script obsoleto                           |
| check-db.js             | Raiz        | 🗑️     | DELETAR | Script obsoleto                           |

### 1.2 Deploy Status (8 arquivos)

| Arquivo                           | Localização     | Status | Ação    | Obs                          |
| --------------------------------- | --------------- | ------ | ------- | ---------------------------- |
| DEPLOY_STATUS.md                  | Raiz            | 🗑️     | DELETAR | Status antigo de 09/12       |
| DEPLOY_STATUS_FINAL.md            | Raiz            | 🗑️     | DELETAR | Finalizado, em ORCHESTRATION |
| DEPLOYMENT_CHECKLIST_PHASE_2_4.md | Raiz            | 🗑️     | DELETAR | Phase obsoleta               |
| CRON_DEPLOYMENT_STATUS.md         | Raiz            | 🗑️     | DELETAR | Status consolidado           |
| CRON_FINAL_STATUS.md              | Raiz            | 🗑️     | DELETAR | Finalizado                   |
| CRON_DEPLOYMENT_STATUS.md (2)     | Raiz            | 🗑️     | DELETAR | Duplicado                    |
| DEPLOY_BRIEFING.md                | .github/agents/ | ✅     | MANTER  | Referência técnica           |
| DEPLOY_CHECKLIST.md               | .github/agents/ | ✅     | MANTER  | Checklist ativo              |

### 1.3 Phase Completions (10 arquivos)

| Arquivo                                  | Localização  | Status | Ação     | Obs                          |
| ---------------------------------------- | ------------ | ------ | -------- | ---------------------------- |
| docs/status/PHASE_2_DONE.md              | docs/status/ | 🗂️     | ARQUIVAR | Referência histórica Phase 2 |
| docs/status/PHASE_2_COMPLETE.md          | docs/status/ | 🗂️     | ARQUIVAR | Duplicado                    |
| docs/status/PHASE_2_FINAL_STATUS.md      | docs/status/ | 🗂️     | ARQUIVAR | Duplicado                    |
| docs/status/PHASE_2_TEACHER_COMPLETE.md  | docs/status/ | 🗂️     | ARQUIVAR | Teacher phase                |
| .github/FINAL_STATUS_PHASE_1_COMPLETE.md | .github/     | 🗂️     | ARQUIVAR | Phase 1 finalizada           |
| .github/ORCHESTRATION_MASTER_STATUS.md   | .github/     | ✅     | MANTER   | **CRITICAL** - Plano mestre  |
| CONSOLIDATED_PHASE_2_4.md                | Raiz         | 🗑️     | DELETAR  | Consolidado em ORCHESTRATION |
| EXECUTIVE_SUMMARY_PHASE_2_4.md           | Raiz         | 🗑️     | DELETAR  | Resumo obsoleto              |
| PHASE_2_4_VERSION.json                   | Raiz         | 🗑️     | DELETAR  | Versão histórica             |
| PHASE_2_4_SUMMARY.md                     | Raiz         | 🗑️     | DELETAR  | Resumo obsoleto              |

### 1.4 Implementation Status (15 arquivos)

| Arquivo                            | Localização | Status | Ação       | Obs                          |
| ---------------------------------- | ----------- | ------ | ---------- | ---------------------------- |
| EXECUTION_PLAN.md                  | Raiz        | 🗑️     | DELETAR    | Plano executado              |
| PHASE_2_4_FINAL_STATUS.md          | Raiz        | 🗑️     | DELETAR    | Status final obsoleto        |
| IMPLEMENTATION_SUMMARY_20251213.md | Raiz        | 🗂️     | ARQUIVAR   | Sumário histórico            |
| README_PHASE_2_4.md                | Raiz        | 📋     | CONSOLIDAR | Mover em docs/index          |
| SETUP_FINAL_PHASE_2_4.md           | Raiz        | 📋     | CONSOLIDAR | Mesclar em SETUP.md          |
| SETUP_CORRETO_PHASE_2_4.md         | Raiz        | 📋     | CONSOLIDAR | Mesclar em SETUP.md          |
| QUICK_INSTALL_PHASE_2.md           | Raiz        | 📋     | CONSOLIDAR | Mesclar em SETUP.md          |
| QUICK_INSTALL_PHASE_2.md           | Raiz        | 📋     | CONSOLIDAR | Mesclar em docs/setup        |
| INFRASTRUCTURE_AUDIT_PHASE_2_4.md  | Raiz        | 🗂️     | ARQUIVAR   | Auditoria histórica          |
| SETUP_FINAL_PHASE_2_4.md           | Raiz        | 📋     | CONSOLIDAR | Duplicado setup              |
| create-system-config.js            | scripts/    | ✅     | MANTER     | Script útil                  |
| apply-migration.js                 | Raiz        | 🔗     | MOVER      | Script → scripts/migrations/ |
| check-phase-2-setup.js             | scripts/    | 🔗     | MOVER      | Script → scripts/validation/ |
| fix-prisma.js                      | scripts/    | 🔗     | MOVER      | Script → scripts/fixes/      |
| verify-schema.js                   | scripts/    | 🔗     | MOVER      | Script → scripts/validation/ |

---

## 🏗️ CATEGORIA 2: PROCESSO & IMPLEMENTAÇÃO (58 arquivos)

### 2.1 Setup & Installation (12 arquivos)

| Arquivo                          | Localização | Status | Ação       | Obs                                     |
| -------------------------------- | ----------- | ------ | ---------- | --------------------------------------- |
| SETUP.md                         | Raiz        | ✅     | MANTER     | **PRINCIPAL** - Setup oficial           |
| SETUP_FINAL_PHASE_2_4.md         | Raiz        | 📋     | CONSOLIDAR | → SETUP.md seção "Phase 2.4"            |
| SETUP_CORRETO_PHASE_2_4.md       | Raiz        | 📋     | CONSOLIDAR | → SETUP.md seção "Configuração Correta" |
| QUICK_INSTALL_PHASE_2.md         | Raiz        | 📋     | CONSOLIDAR | → docs/setup/INSTALLATION.md            |
| QUICK_START.md                   | Raiz        | 📋     | CONSOLIDAR | Mesclar com QUICK_START_PHASE_2_3.md    |
| .github/QUICK_START_PHASE_2_3.md | .github/    | ✅     | MANTER     | Início rápido Phase 2/3                 |
| COMECE_AQUI_UPLOAD.md            | Raiz        | 🗑️     | DELETAR    | Upload guide consolidado                |
| install-phase-2.js               | scripts/    | 🔗     | MOVER      | → scripts/setup/                        |
| install-phase-2.sh               | scripts/    | 🔗     | MOVER      | → scripts/setup/                        |
| check-phase-2-setup.js           | scripts/    | 🔗     | MOVER      | → scripts/validation/                   |
| vercel-env-setup.sh              | Raiz        | 🔗     | MOVER      | → scripts/vercel/                       |
| docs/GIT_WORKFLOW.md             | docs/       | ✅     | MANTER     | Workflow Git bem documentado            |

### 2.2 Feature Implementation (20 arquivos)

| Arquivo                                   | Localização | Status | Ação       | Obs                                       |
| ----------------------------------------- | ----------- | ------ | ---------- | ----------------------------------------- |
| THEME_SYSTEM_V2_IMPLEMENTATION_STATUS.md  | Raiz        | ✅     | MANTER     | Implementação V2.0 completa               |
| THEME_UPLOAD_IMPLEMENTATION.md            | Raiz        | ✅     | MANTER     | Upload de temas                           |
| THEME_UPLOAD_IMPLEMENTATION_FINAL.md      | Raiz        | 📋     | CONSOLIDAR | Mesclar em THEME_UPLOAD_IMPLEMENTATION.md |
| THEME_HIERARCHY_SYSTEM.md                 | Raiz        | ✅     | MANTER     | Sistema hierárquico                       |
| THEME_HIERARCHY_IMPLEMENTATION_SUMMARY.md | Raiz        | ⚠️     | REVISAR    | Resumo desatualizado                      |
| SYSTEM_CONFIG_IMPLEMENTATION.md           | Raiz        | ✅     | MANTER     | Configurações globais                     |
| FEATURE_UNLOCK_SUMMARY.md                 | Raiz        | ✅     | MANTER     | Feature unlock system                     |
| FEATURE_UNLOCK_README.md                  | Raiz        | ✅     | MANTER     | Feature unlock guide                      |
| FEATURE_UNLOCK_IMPLEMENTATION.md          | docs/       | ⚠️     | REVISAR    | Desatualizado                             |
| docs/FEATURE_UNLOCK_ARCHITECTURE.md       | docs/       | ✅     | MANTER     | **CRITICAL** - Arquitetura                |
| docs/FEATURE_UNLOCK_GUIDE.md              | docs/       | ✅     | MANTER     | Guia completo                             |
| CORREÇÃO_TEMA_RESUMO_EXECUTIVO.md         | Raiz        | 📋     | CONSOLIDAR | → docs/features/themes/                   |
| CORREÇÕES_FINAIS_TEMA.md                  | Raiz        | 📋     | CONSOLIDAR | → docs/features/themes/IMPROVEMENTS.md    |
| THEME_FIX_CATALOG_PERFORMANCE.md          | Raiz        | 📋     | CONSOLIDAR | → docs/troubleshooting/                   |
| THEME_HIERARCHY_IMPLEMENTATION_SUMMARY.md | Raiz        | ⚠️     | REVISAR    | Duplicado?                                |
| DASHBOARD_V3_IMPLEMENTATION_STATUS.md     | Raiz        | ✅     | MANTER     | Dashboard V3                              |
| ADMIN_DASHBOARD_IMPROVEMENTS.md           | Raiz        | 🗂️     | ARQUIVAR   | Melhorias antigas                         |
| ADMIN_REFACTOR_SUMMARY.md                 | Raiz        | 🗂️     | ARQUIVAR   | Refator antigo                            |
| ADMIN_COURSES_REFACTOR_SUMMARY.md         | Raiz        | 🗂️     | ARQUIVAR   | Refator antigo                            |
| ADMIN_USERS_REFACTOR_COMPLETE.md          | Raiz        | 🗂️     | ARQUIVAR   | Refator antigo                            |

### 2.3 Guides & QuickStarts (15 arquivos)

| Arquivo                                | Localização  | Status | Ação        | Obs                                     |
| -------------------------------------- | ------------ | ------ | ----------- | --------------------------------------- |
| GUIA_RAPIDO.md                         | Raiz         | 🔗     | REORGANIZAR | → docs/guides/QUICK_REFERENCE.md        |
| COPILOT_QUICKSTART.md                  | Raiz         | ✅     | MANTER      | Ou mover para .github/                  |
| VERCEL_QUICK_START.md                  | Raiz         | 🔗     | REORGANIZAR | → docs/deployment/VERCEL_QUICK_START.md |
| STRIPE_VISUAL_GUIDE.md                 | Raiz         | 🔗     | REORGANIZAR | → docs/features/payments/               |
| STRIPE_QUICKSTART.md                   | Raiz         | 🔗     | REORGANIZAR | → docs/features/payments/               |
| STRIPE_INDEX.md                        | Raiz         | 🔗     | REORGANIZAR | → docs/features/payments/               |
| STRIPE_IMPLEMENTATION_SUMMARY.md       | Raiz         | 🔗     | REORGANIZAR | → docs/features/payments/               |
| STRIPE_INTERNATIONAL_CONFIG.md         | Raiz         | 🔗     | REORGANIZAR | → docs/features/payments/               |
| MAINTENANCE_MODE_README.md             | Raiz         | ✅     | MANTER      | Maintenance mode guide                  |
| MAINTENANCE_MODE_INDEX.md              | Raiz         | ✅     | MANTER      | Index para maintenance                  |
| MAINTENANCE_MODE_QUICKSTART.md         | Raiz         | ✅     | MANTER      | Quick start maintenance                 |
| docs/guides/QUICK_COLORS_ANIMATIONS.md | docs/guides/ | ✅     | MANTER      | Quick guide animações                   |
| docs/guides/SUPABASE_DATA.md           | docs/guides/ | ✅     | MANTER      | Guia Supabase                           |
| docs/guides/EXECUTE_MIGRATION.md       | docs/guides/ | ✅     | MANTER      | Guia migration                          |
| docs/guides/EXECUTE_THEMES_SQL.md      | docs/guides/ | ✅     | MANTER      | Guia SQL temas                          |

### 2.4 Deployment & Infrastructure (11 arquivos)

| Arquivo                        | Localização | Status | Ação        | Obs                                   |
| ------------------------------ | ----------- | ------ | ----------- | ------------------------------------- |
| VERCEL_DEPLOYMENT.md           | Raiz        | ✅     | MANTER      | **IMPORTANTE** - Deploy guide         |
| VERCEL_CHECKLIST.md            | Raiz        | ✅     | MANTER      | **IMPORTANTE** - Checklist            |
| VERCEL_ENV_TEMPLATE.md         | Raiz        | ✅     | MANTER      | Template variáveis                    |
| VERCEL_TESTING.md              | Raiz        | ✅     | MANTER      | Testes pós-deploy                     |
| VERCEL_ENV_SETUP_PRODUCTION.md | Raiz        | 📋     | CONSOLIDAR  | Mesclar em VERCEL_ENV_TEMPLATE.md     |
| VERCEL_TROUBLESHOOTING.md      | Raiz        | 🔗     | REORGANIZAR | → docs/troubleshooting/VERCEL.md      |
| PRODUCTION_DEPLOY_CHECKLIST.md | Raiz        | 📋     | CONSOLIDAR  | Mesclar em VERCEL_CHECKLIST.md        |
| vercel.json                    | Raiz        | ✅     | MANTER      | Config oficial                        |
| vercel-env-setup.sh            | Raiz        | 🔗     | MOVER       | → scripts/vercel/                     |
| ENV_VARS_GUIDE.md              | Raiz        | 📋     | CONSOLIDAR  | → docs/setup/ENVIRONMENT_VARIABLES.md |
| .env.example                   | Raiz        | ✅     | MANTER      | Arquivo oficial                       |

---

## 📚 CATEGORIA 3: REFERÊNCIA & ARQUITETURA (67 arquivos)

### 3.1 Architecture & Governance (15 arquivos)

| Arquivo                                      | Localização | Status | Ação       | Obs                                    |
| -------------------------------------------- | ----------- | ------ | ---------- | -------------------------------------- |
| .github/copilot-instructions.md              | .github/    | ✅     | MANTER     | **CRÍTICO** - VisionVII 3.0 Governance |
| THEME_ARCHITECTURE.md                        | Raiz        | ✅     | MANTER     | Arquitetura temas                      |
| THEME_MULTI_LAYER_ARCHITECTURE.md            | docs/       | ✅     | MANTER     | Multi-layer design                     |
| THEME_STORAGE_ARCHITECTURE.md                | Raiz        | ✅     | MANTER     | Storage design                         |
| .github/ORCHESTRATION_PLAN_PHASE_5.md        | .github/    | ✅     | MANTER     | **IMPORTANTE** - Plano                 |
| .github/DASHBOARD_REFACTOR_INDEX.md          | .github/    | ✅     | MANTER     | Índice dashboard                       |
| .github/PHASE_1_COMPLETION_REPORT.md         | .github/    | 🗂️     | ARQUIVAR   | Phase 1 completa                       |
| .github/PHASE_1_3_MENU_REFACTOR_COMPLETE.md  | .github/    | 🗂️     | ARQUIVAR   | Menu refactor                          |
| .github/PHASE_2_IMAGE_PERSISTENCE_PLAN.md    | .github/    | 🗂️     | ARQUIVAR   | Image persistence                      |
| .github/PHASE_3_FEATURE_ACCESS_LOGIC_PLAN.md | .github/    | 🗂️     | ARQUIVAR   | Feature access                         |
| .github/VISUAL_COMPLETION_SUMMARY.md         | .github/    | 🗂️     | ARQUIVAR   | Resumo visual                          |
| ORCHESTRATION_PLAN_PHASE_5.md                | Raiz        | 📋     | CONSOLIDAR | Duplicado em .github/                  |
| DASHBOARD_REFACTOR_INDEX.md                  | Raiz        | 📋     | CONSOLIDAR | Duplicado em .github/                  |
| docs/THEME_MULTI_LAYER_ARCHITECTURE.md       | docs/       | ✅     | MANTER     | Arquitetura themes                     |
| THEME_AUDIT_REPORT.md                        | Raiz        | 🗂️     | ARQUIVAR   | Auditoria completa                     |

### 3.2 Security & Compliance (18 arquivos)

| Arquivo                                           | Localização             | Status | Ação       | Obs                              |
| ------------------------------------------------- | ----------------------- | ------ | ---------- | -------------------------------- |
| SECURITY.md                                       | Raiz                    | ✅     | MANTER     | **CRÍTICO** - Política segurança |
| SECURITY_AUDIT.md                                 | Raiz                    | ✅     | MANTER     | **IMPORTANTE** - Auditoria OWASP |
| CSP_SECURITY_GUIDE.md                             | Raiz                    | ✅     | MANTER     | Content Security Policy          |
| P0_1_VALIDATION_CHECKLIST.md                      | Raiz                    | ✅     | MANTER     | Validação compliance             |
| MAINTENANCE_MODE_BRIEFING.md                      | .github/agents/         | ✅     | MANTER     | Security briefing                |
| .github/agents/MAINTENANCE_MODE_BRIEFING.md       | .github/agents/         | ✅     | MANTER     | 8 Q&A segurança                  |
| .github/agents/MAINTENANCE_MODE_MANIFEST.md       | .github/agents/         | ✅     | MANTER     | Manifesto 1-pager                |
| .github/agents/MAINTENANCE_MODE_IMPLEMENTATION.md | .github/agents/         | ✅     | MANTER     | Implementação                    |
| .github/agents/MAINTENANCE_MODE_DEPLOY.md         | .github/agents/         | ✅     | MANTER     | Deploy checklist                 |
| MAINTENANCE_MODE_IMPLEMENTATION.md                | Raiz                    | ✅     | MANTER     | Implementação maintenance        |
| MAINTENANCE_MODE_VERIFICATION.md                  | Raiz                    | ✅     | MANTER     | Verificação final                |
| salao-ia/README.md                                | salao-ia/               | ✅     | MANTER     | **IMPORTANTE** - Agentes IA      |
| salao-ia/secure-ops-ai/README.md                  | salao-ia/secure-ops-ai/ | ✅     | MANTER     | **IMPORTANTE** - SecureOpsAI     |
| salao-ia/secure-ops-ai/rules.ts                   | salao-ia/secure-ops-ai/ | ✅     | MANTER     | Regras segurança                 |
| salao-ia/QUICKSTART.md                            | salao-ia/               | ✅     | MANTER     | QuickStart agentes               |
| audit-security.js                                 | scripts/                | ✅     | MANTER     | Script auditoria                 |
| audit-result.json                                 | Raiz                    | 📋     | CONSOLIDAR | Resultado → docs/audit/          |
| DELETED_FILES_BACKUP.md                           | Raiz                    | ⚠️     | REVISAR    | Referência deletados             |

### 3.3 Database & Schema (12 arquivos)

| Arquivo                         | Localização | Status | Ação     | Obs                       |
| ------------------------------- | ----------- | ------ | -------- | ------------------------- |
| docs/DATABASE_DASHBOARD.md      | docs/       | ✅     | MANTER   | Dashboard banco dados     |
| prisma/schema.prisma            | prisma/     | ✅     | MANTER   | Schema oficial            |
| PRISMA_FIX.md                   | Raiz        | 🗂️     | ARQUIVAR | Problema resolvido        |
| SUPABASE_CONNECTION.md          | Raiz        | ✅     | MANTER   | Conexão Supabase          |
| SUPABASE_STORAGE_SETUP.md       | Raiz        | ✅     | MANTER   | Storage setup             |
| SUPABASE_STORAGE_VIDEO_SETUP.md | Raiz        | ✅     | MANTER   | Video storage setup       |
| SUPABASE_VIDEO_SETUP.md         | Raiz        | ✅     | MANTER   | Video setup               |
| FIX_DATABASE_URL.md             | Raiz        | 🗑️     | DELETAR  | Problema resolvido        |
| FIX_PRISMA_CLIENT.md            | Raiz        | 🗑️     | DELETAR  | Problema resolvido        |
| diagnose-db.js                  | scripts/    | 🔗     | MOVER    | → scripts/diagnosis/      |
| add-animations.sql              | Raiz        | 🔗     | MOVER    | → scripts/migrations/sql/ |
| add-reset-fields.sql            | Raiz        | 🔗     | MOVER    | → scripts/migrations/sql/ |

### 3.4 Documentation Infrastructure (22 arquivos)

| Arquivo                                  | Localização               | Status | Ação   | Obs                          |
| ---------------------------------------- | ------------------------- | ------ | ------ | ---------------------------- |
| docs/README.md                           | docs/                     | ✅     | MANTER | Índice documentação          |
| docs/DOCUMENTATION_CLEANUP.md            | docs/                     | ✅     | MANTER | **AUTO-REF** - Plano cleanup |
| docs/status/README.md                    | docs/status/              | ✅     | MANTER | Índice status                |
| docs/status/ROADMAP.md                   | docs/status/              | ✅     | MANTER | Roadmap projeto              |
| docs/status/CHECKLIST.md                 | docs/status/              | ✅     | MANTER | Checklist principal          |
| docs/status/CHECKLIST_QUICK.md           | docs/status/              | ✅     | MANTER | Checklist rápido             |
| docs/status/TESTING_TEACHER.md           | docs/status/              | ✅     | MANTER | Testes teacher               |
| docs/features/README.md                  | docs/features/            | ✅     | MANTER | Índice features              |
| docs/features/themes/README.md           | docs/features/themes/     | ✅     | MANTER | Índice temas                 |
| docs/features/themes/GUIDE.md            | docs/features/themes/     | ✅     | MANTER | Guia temas                   |
| docs/features/themes/QUICKSTART.md       | docs/features/themes/     | ✅     | MANTER | QuickStart temas             |
| docs/features/themes/IMPLEMENTATION.md   | docs/features/themes/     | ✅     | MANTER | Implementação temas          |
| docs/features/themes/ACTIVATE.md         | docs/features/themes/     | ✅     | MANTER | Ativar temas                 |
| docs/features/themes/IMPROVEMENTS.md     | docs/features/themes/     | ✅     | MANTER | Melhorias temas              |
| docs/features/themes/PROVIDER_FIX.md     | docs/features/themes/     | ✅     | MANTER | Fix provider                 |
| docs/features/animations/README.md       | docs/features/animations/ | ✅     | MANTER | Índice animações             |
| docs/features/animations/GUIDE.md        | docs/features/animations/ | ✅     | MANTER | Guia animações               |
| docs/features/animations/QUICK_REF.md    | docs/features/animations/ | ✅     | MANTER | Quick ref animações          |
| docs/features/animations/SUMMARY.md      | docs/features/animations/ | ✅     | MANTER | Sumário animações            |
| docs/features/animations/SYSTEM.md       | docs/features/animations/ | ✅     | MANTER | Sistema animações            |
| docs/features/animations/VISUAL.md       | docs/features/animations/ | ✅     | MANTER | Visual animações             |
| docs/features/animations/BEFORE_AFTER.md | docs/features/animations/ | ✅     | MANTER | Antes/depois                 |

---

## 🛠️ CATEGORIA 4: TROUBLESHOOTING & TESTING (78 arquivos)

### 4.1 Troubleshooting - Resolvido (20 arquivos - ARQUIVAR)

| Arquivo                                 | Localização           | Status | Ação        | Motivo                     |
| --------------------------------------- | --------------------- | ------ | ----------- | -------------------------- |
| HYDRATION_ERROR_FIX.md                  | Raiz                  | 🗂️     | ARQUIVAR    | Problema resolvido em v2.0 |
| HYDRATION_FIX_STATUS.md                 | Raiz                  | 🗂️     | ARQUIVAR    | Status completado          |
| FIX_UPLOAD_AGORA.md                     | Raiz                  | 🗂️     | ARQUIVAR    | Upload corrigido           |
| FIX_ANON_KEY_NOW.md                     | Raiz                  | 🗂️     | ARQUIVAR    | Chave corrigida            |
| FIX_DATABASE_URL.md                     | Raiz                  | 🗂️     | ARQUIVAR    | URL corrigida              |
| UPLOAD_ERROR_500_FIX.md                 | Raiz                  | 🗂️     | ARQUIVAR    | Erro resolvido             |
| NEXTAUTH_SECRET_FIX.md                  | Raiz                  | 🗂️     | ARQUIVAR    | Secret corrigido           |
| VERCEL_TROUBLESHOOTING.md               | Raiz                  | 🔗     | REORGANIZAR | → docs/troubleshooting/    |
| docs/troubleshooting/BOM_FIX.md         | docs/troubleshooting/ | ✅     | MANTER      | BOM issue                  |
| docs/troubleshooting/ERROR_500_FIX.md   | docs/troubleshooting/ | ✅     | MANTER      | Error 500                  |
| docs/troubleshooting/STORAGE_RLS_FIX.md | docs/troubleshooting/ | ✅     | MANTER      | RLS issue                  |
| docs/troubleshooting/THEMES_FIX.md      | docs/troubleshooting/ | ✅     | MANTER      | Themes issue               |
| docs/troubleshooting/DASHBOARD_FIX.md   | docs/troubleshooting/ | ✅     | MANTER      | Dashboard issue            |
| docs/troubleshooting/PORT_CHANGE.md     | docs/troubleshooting/ | ✅     | MANTER      | Port issue                 |
| docs/troubleshooting/RLS_FIX.md         | docs/troubleshooting/ | ✅     | MANTER      | RLS fix                    |
| ERRO_CONFIGURATION.md                   | Raiz                  | 🗂️     | ARQUIVAR    | Config error               |
| ERROS_CORRIGIDOS.md                     | Raiz                  | 🗂️     | ARQUIVAR    | Erros consolidados         |
| LOGIN_FIX_GUIDE.md                      | Raiz                  | 🗂️     | ARQUIVAR    | Login fix                  |
| TOKEN_DIAGNOSTIC.md                     | Raiz                  | 🗂️     | ARQUIVAR    | Token issue                |
| VERCEL_AUTH_FIX.md                      | Raiz                  | 🗂️     | ARQUIVAR    | Auth Vercel                |

### 4.2 Troubleshooting - Ativo (10 arquivos - MANTER)

| Arquivo                                 | Localização           | Status | Ação        | Obs                              |
| --------------------------------------- | --------------------- | ------ | ----------- | -------------------------------- |
| docs/troubleshooting/BOM_FIX.md         | docs/troubleshooting/ | ✅     | MANTER      | BOM Windows issue                |
| docs/troubleshooting/ERROR_500_FIX.md   | docs/troubleshooting/ | ✅     | MANTER      | Erro 500 fix                     |
| docs/troubleshooting/STORAGE_RLS_FIX.md | docs/troubleshooting/ | ✅     | MANTER      | RLS policies                     |
| docs/troubleshooting/THEMES_FIX.md      | docs/troubleshooting/ | ✅     | MANTER      | Themes debug                     |
| docs/troubleshooting/DASHBOARD_FIX.md   | docs/troubleshooting/ | ✅     | MANTER      | Dashboard                        |
| docs/troubleshooting/PORT_CHANGE.md     | docs/troubleshooting/ | ✅     | MANTER      | Port conflicts                   |
| docs/troubleshooting/RLS_FIX.md         | docs/troubleshooting/ | ✅     | MANTER      | RLS permissions                  |
| THEME_FIX_CATALOG_PERFORMANCE.md        | Raiz                  | 🔗     | REORGANIZAR | → docs/troubleshooting/THEMES.md |
| VERCEL_TROUBLESHOOTING.md               | Raiz                  | 🔗     | REORGANIZAR | → docs/troubleshooting/VERCEL.md |
| CHAT_IA_FORCE_UNLOCK.md                 | Raiz                  | 🗂️     | ARQUIVAR    | Chat IA unlock                   |

### 4.3 Testing & Validation (18 arquivos)

| Arquivo                            | Localização  | Status | Ação   | Obs                       |
| ---------------------------------- | ------------ | ------ | ------ | ------------------------- |
| docs/status/TESTING_TEACHER.md     | docs/status/ | ✅     | MANTER | Testes teacher            |
| docs/status/CHECKLIST.md           | docs/status/ | ✅     | MANTER | Checklist master          |
| docs/status/CHECKLIST_QUICK.md     | docs/status/ | ✅     | MANTER | Checklist rápido          |
| P0_1_VALIDATION_CHECKLIST.md       | Raiz         | ✅     | MANTER | Validação P0.1            |
| MAINTENANCE_MODE_VERIFICATION.md   | Raiz         | ✅     | MANTER | Verificação maintenance   |
| VERCEL_TESTING.md                  | Raiz         | ✅     | MANTER | Testes Vercel             |
| VERCEL_CHECKLIST.md                | Raiz         | ✅     | MANTER | Checklist Vercel          |
| COPILOT_VERIFICATION.md            | Raiz         | ✅     | MANTER | Verificação Copilot       |
| src/tests/maintenance-mode.test.ts | src/tests/   | ✅     | MANTER | Test suite                |
| scripts/test-feature-unlock.ts     | scripts/     | ✅     | MANTER | Feature tests             |
| check-vercel-build.js              | scripts/     | 🔗     | MOVER  | → scripts/validation/     |
| check-key.bat                      | Raiz         | 🔗     | MOVER  | → scripts/windows/        |
| check-checkout-setup.js            | Raiz         | 🔗     | MOVER  | → scripts/validation/     |
| fix-migration.ps1                  | Raiz         | 🔗     | MOVER  | → scripts/windows/        |
| fix-images-policies.sql            | Raiz         | 🔗     | MOVER  | → scripts/migrations/sql/ |
| fix-migration.ps1                  | Raiz         | 🔗     | MOVER  | → scripts/windows/        |
| fix-storage-rls.sql                | Raiz         | 🔗     | MOVER  | → scripts/migrations/sql/ |
| enable-rls-policies.sql            | Raiz         | 🔗     | MOVER  | → scripts/migrations/sql/ |

### 4.4 Feature-Specific Guides (30 arquivos)

| Arquivo                                  | Localização               | Status | Ação        | Obs                        |
| ---------------------------------------- | ------------------------- | ------ | ----------- | -------------------------- |
| docs/features/themes/GUIDE.md            | docs/features/themes/     | ✅     | MANTER      | Bem estruturado            |
| docs/features/themes/QUICKSTART.md       | docs/features/themes/     | ✅     | MANTER      | Setup rápido               |
| docs/features/themes/IMPLEMENTATION.md   | docs/features/themes/     | ✅     | MANTER      | Implementação              |
| docs/features/themes/IMPROVEMENTS.md     | docs/features/themes/     | ✅     | MANTER      | Melhorias                  |
| docs/features/themes/PROVIDER_FIX.md     | docs/features/themes/     | ✅     | MANTER      | Fix provider               |
| docs/features/animations/GUIDE.md        | docs/features/animations/ | ✅     | MANTER      | Bem estruturado            |
| docs/features/animations/QUICK_REF.md    | docs/features/animations/ | ✅     | MANTER      | Quick reference            |
| docs/features/animations/SUMMARY.md      | docs/features/animations/ | ✅     | MANTER      | Sumário                    |
| docs/features/animations/SYSTEM.md       | docs/features/animations/ | ✅     | MANTER      | Sistema                    |
| docs/features/animations/VISUAL.md       | docs/features/animations/ | ✅     | MANTER      | Visual                     |
| docs/features/animations/CHECKLIST.md    | docs/features/animations/ | ✅     | MANTER      | Checklist                  |
| docs/features/animations/BEFORE_AFTER.md | docs/features/animations/ | ✅     | MANTER      | Comparação                 |
| docs/FEATURE_UNLOCK_GUIDE.md             | docs/                     | ✅     | MANTER      | Feature unlock             |
| docs/FEATURE_UNLOCK_ARCHITECTURE.md      | docs/                     | ✅     | MANTER      | Arquitetura                |
| IMAGE_UPLOAD_SETUP.md                    | Raiz                      | 🔗     | REORGANIZAR | → docs/features/uploads/   |
| THEME_SYSTEM_V2_IMPLEMENTATION_STATUS.md | Raiz                      | ✅     | MANTER      | Tema V2.0                  |
| THEME_UPLOAD_IMPLEMENTATION.md           | Raiz                      | ✅     | MANTER      | Upload temas               |
| THEME_HIERARCHY_SYSTEM.md                | Raiz                      | ✅     | MANTER      | Hierarquia                 |
| FEATURE_UNLOCK_README.md                 | Raiz                      | ✅     | MANTER      | Feature unlock             |
| FEATURE_UNLOCK_SUMMARY.md                | Raiz                      | ✅     | MANTER      | Sumário features           |
| ADMIN_COURSES_REFACTOR_SUMMARY.md        | Raiz                      | 🗂️     | ARQUIVAR    | Admin refactor             |
| ADMIN_DASHBOARD_IMPROVEMENTS.md          | Raiz                      | 🗂️     | ARQUIVAR    | Dashboard melhoras         |
| ADMIN_REFACTOR_SUMMARY.md                | Raiz                      | 🗂️     | ARQUIVAR    | Admin refactor             |
| ADMIN_USERS_REFACTOR_COMPLETE.md         | Raiz                      | 🗂️     | ARQUIVAR    | Users refactor             |
| ADMIN_CONFIG_GUIDE.md                    | Raiz                      | 🗂️     | ARQUIVAR    | Admin config               |
| ADMIN_THEME_SETUP.md                     | Raiz                      | 🗂️     | ARQUIVAR    | Admin theme                |
| ADMIN_DASHBOARD_IMPROVEMENTS.md          | Raiz                      | 🗂️     | ARQUIVAR    | Dashboard                  |
| ADMIN_REFACTOR_ANALYSIS.md               | Raiz                      | 🗂️     | ARQUIVAR    | Análise refactor           |
| DASHBOARD_V3_IMPLEMENTATION_STATUS.md    | Raiz                      | ✅     | MANTER      | Dashboard V3               |
| DASHBOARD_V3_README.md                   | Raiz                      | 🔗     | REORGANIZAR | → docs/features/dashboard/ |

### 4.5 Status Reports & Checklists (15 arquivos)

| Arquivo                           | Localização  | Status | Ação       | Obs                   |
| --------------------------------- | ------------ | ------ | ---------- | --------------------- |
| docs/status/CHECKLIST.md          | docs/status/ | ✅     | MANTER     | Principal             |
| docs/status/CHECKLIST_QUICK.md    | docs/status/ | ✅     | MANTER     | Rápido                |
| docs/status/TESTING_TEACHER.md    | docs/status/ | ✅     | MANTER     | Teacher tests         |
| docs/status/ROADMAP.md            | docs/status/ | ✅     | MANTER     | Roadmap               |
| P0_1_VALIDATION_CHECKLIST.md      | Raiz         | ✅     | MANTER     | Validação P0          |
| MAINTENANCE_MODE_VERIFICATION.md  | Raiz         | ✅     | MANTER     | Verification          |
| VERCEL_TESTING.md                 | Raiz         | ✅     | MANTER     | Testes                |
| VERCEL_CHECKLIST.md               | Raiz         | ✅     | MANTER     | Checklist             |
| PRODUCTION_DEPLOY_CHECKLIST.md    | Raiz         | 📋     | CONSOLIDAR | → VERCEL_CHECKLIST.md |
| DEPLOYMENT_CHECKLIST_PHASE_2_4.md | Raiz         | 🗑️     | DELETAR    | Obsoleto              |
| ACESSO_DASHBOARD_V3.md            | Raiz         | ⚠️     | REVISAR    | Sem data              |
| ANALISE_DASHBOARD_ADMIN.md        | Raiz         | ⚠️     | REVISAR    | Sem data              |
| DASHBOARD_ADMIN_NOVO.md           | Raiz         | ⚠️     | REVISAR    | Desatualizado         |
| BUILD_LOG.md                      | Raiz         | 🗑️     | DELETAR    | Obsoleto              |
| FEATURED_COURSES_GUIDE.md         | Raiz         | ⚠️     | REVISAR    | Sem data              |

---

## 📊 RESUMO CONSOLIDADO POR AÇÃO

| Ação           | Quantidade | % do Total | Impacto            |
| -------------- | ---------- | ---------- | ------------------ |
| ✅ MANTER      | 156        | 59%        | Documentação ativa |
| 🗑️ DELETAR     | 42         | 16%        | Sem risco          |
| 🗂️ ARQUIVAR    | 35         | 13%        | Histórico          |
| 📋 CONSOLIDAR  | 18         | 7%         | Deduplicação       |
| 🔗 REORGANIZAR | 14         | 5%         | Estrutura          |
| ⚠️ REVISAR     | 12         | 5%         | Desatualizados     |
| ❓ VERIFICAR   | 8          | 3%         | Unclear status     |
| **TOTAL**      | **265+**   | **100%**   | **Auditado**       |

---

_Matriz detalhada para referência durante implementação da reorganização_ 📋
