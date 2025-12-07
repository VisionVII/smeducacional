# 📚 Documentação SM Educacional

**Índice completo e organizado da documentação do projeto.**

## 📖 Visão Geral
- 🏠 [README Principal](../README.md) - Visão do produto, stack e começando
- 📊 [Status e Roadmap](./status/README.md) - Phase 2 completo + próximos passos
- 📸 [Screenshots](../screenshots/README.md) - 30 páginas documentadas

## 🚀 Setup e Configuração
- ⚙️ [Setup Local](../SETUP.md) - Instalação e configuração inicial
- 🔐 [Segurança](../SECURITY.md) - Políticas e boas práticas
- 🔑 [RLS Setup](../RLS_SETUP.md) + [`enable-rls-policies.sql`](../enable-rls-policies.sql)

### Integrações
- 🗄️ **Supabase**: [Connection](../SUPABASE_CONNECTION.md) | [Storage](../SUPABASE_STORAGE_SETUP.md) | [Video Storage](../SUPABASE_STORAGE_VIDEO_SETUP.md) | [Video Setup](../SUPABASE_VIDEO_SETUP.md)
- 📧 **Email**: [Resend Setup](../RESEND_EMAIL_SETUP.md)
- 🔓 **OAuth**: [Google OAuth](../GOOGLE_OAUTH_SETUP.md)

### Guias Rápidos
- 📋 [Ver Dados no Supabase](./guides/SUPABASE_DATA.md)
- 🔧 [Executar Migrations](./guides/EXECUTE_MIGRATION.md)
- 🎨 [Executar SQL de Temas](./guides/EXECUTE_THEMES_SQL.md)
- ⚡ [Cores e Animações (Quick)](./guides/QUICK_COLORS_ANIMATIONS.md)

## ✨ Funcionalidades

### 🎨 Temas e Personalização
- 📂 [Visão Geral](./features/README.md)
- 🎨 **Temas**:
  - [Guia](./features/themes/GUIDE.md)
  - [Quickstart](./features/themes/QUICKSTART.md)
  - [Implementação](./features/themes/IMPLEMENTATION.md)
  - [Ativar](./features/themes/ACTIVATE.md)
  - [Melhorias](./features/themes/IMPROVEMENTS.md)
  - [Provider Fix](./features/themes/PROVIDER_FIX.md)

### 🎬 Animações
- 📚 [Overview](./features/animations/README.md)
- 📖 [Guia Completo](./features/animations/GUIDE.md)
- ⚡ [Quick Reference](./features/animations/QUICK_REF.md)
- 📊 [Resumo](./features/animations/SUMMARY.md)
- 🔍 [Sistema Completo](./features/animations/SYSTEM.md)
- 👁️ [Resumo Visual](./features/animations/VISUAL.md)
- 🔄 [Antes/Depois](./features/animations/BEFORE_AFTER.md)
- ✅ [Checklist](./features/animations/CHECKLIST.md)

## 📊 Status e Histórico
- 📈 [Status Atual (Phase 2)](./status/README.md)
- 🗺️ [Roadmap Completo](./status/ROADMAP.md)
- ✅ [Checklist Principal](./status/CHECKLIST.md)
- ⚡ [Checklist Rápido](./status/CHECKLIST_QUICK.md)
- 🧪 [Testing Teacher](./status/TESTING_TEACHER.md)

### Fases Anteriores
- 📦 [Phase 2 Complete](./status/PHASE_2_COMPLETE.md)
- ✔️ [Phase 2 Done](./status/PHASE_2_DONE.md)
- 📝 [Phase 2 Final Status](./status/PHASE_2_FINAL_STATUS.md)
- 👨‍🏫 [Phase 2 Teacher](./status/PHASE_2_TEACHER_COMPLETE.md)

## 🛠️ Troubleshooting
- 📊 [Dashboard Fix](./troubleshooting/DASHBOARD_FIX.md)
- ⚠️ [Error 500 Fix](./troubleshooting/ERROR_500_FIX.md)
- 🎨 [Theme Debug](./troubleshooting/THEME_DEBUG.md)
- 🔒 [RLS Fix](./troubleshooting/RLS_FIX.md)
- 🎨 [Themes Fix](./troubleshooting/THEMES_FIX.md)

## 🤖 GitHub Copilot
- 📖 [Setup Completo (MCP)](../COPILOT_MCP_SETUP.md)
- ⚡ [Quickstart](../COPILOT_QUICKSTART.md)
- ✅ [Verificação](../COPILOT_VERIFICATION.md)
- 📝 [Instruções do Projeto](../.github/copilot-instructions.md)

## 🔧 Scripts Úteis
Localizados em `scripts/`:
- `safe-db-push.js` - Push seguro para DB
- `diagnose-db.js` - Diagnóstico de conexão
- `list-courses.js` - Listar cursos
- `list-users.js` - Listar usuários
- `test-themes.js` - Testar sistema de temas
- `validate-themes.js` - Validar temas

## 📞 Suporte
1. Consulte o [Troubleshooting](./troubleshooting/)
2. Veja o [Checklist](./status/CHECKLIST.md)
3. Revise os logs em `scripts/diagnose-db.js`
