# 🚀 Setup Rápido - GitHub Actions Cron Jobs

## ⏱️ Tempo: 5 minutos

### PASSO 1: Adicionar Secret no GitHub

```
1. Acesse: https://github.com/VisionVII/smeducacional/settings/secrets/actions
2. Clique: "New repository secret"
3. Nome: CRON_SECRET
4. Valor: [Copie seu CRON_SECRET do .env]
5. Clique: "Add secret"
```

**Onde encontrar CRON_SECRET:**

```bash
# No seu .env local:
CRON_SECRET=<seu-valor-aqui>
```

---

### PASSO 2: Verificar Workflow no GitHub

```
1. Acesse: https://github.com/VisionVII/smeducacional/actions
2. Procure: "Cron Remarketing Jobs"
3. Veja status: 🟢 Ativo ou 🔴 Erro
```

---

### PASSO 3: Disparar Teste Manual (OPCIONAL)

```
1. GitHub Actions → "Cron Remarketing Jobs"
2. Clique: "Run workflow"
3. Selecione: "main" branch
4. Clique: "Run workflow"
5. Aguarde: ~30 segundos
6. Veja resultado: ✅ Sucesso ou ❌ Erro
```

---

## ✅ Checklist de Ativação

- [ ] Secret `CRON_SECRET` adicionado no GitHub
- [ ] Workflow "Cron Remarketing Jobs" está visível em Actions
- [ ] (Opcional) Teste manual executado com sucesso

---

## 📊 O que Acontece Agora?

✅ **Automaticamente, 4x por dia (0:00, 6:00, 12:00, 18:00 UTC):**

- GitHub Actions dispara cron job
- Faz POST para: `https://smeducacional.vercel.app/api/cron/remarketing`
- Seu backend envia:
  - 📧 Reminder de invoices vencidas
  - 🔔 Alerta de renovação de subscription
  - ♻️ Retry de pagamentos falhados

**Logs:** https://github.com/VisionVII/smeducacional/actions

---

## 🎯 Próximas Ações

1. ✅ Completar os 3 passos acima
2. ✅ Monitorar logs por 1-2 dias
3. ✅ Validar que emails estão sendo enviados (check Resend dashboard)
4. ✅ Quando crescer, migrar para Railway/Vercel Pro se needed

---

**Custos:** $0/mês ✅  
**Escalabilidade:** Ilimitada ✅  
**Status:** Pronto para produção ✅

---

Dúvidas? Verifique `.github/workflows/CRON_README.md`
