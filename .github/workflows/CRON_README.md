# 🔄 GitHub Actions Cron Jobs - Guia de Setup

## O que é?

Este workflow executa automaticamente o cron job de remarketing **4 vezes por dia** usando GitHub Actions (totalmente grátis).

## 🎯 Schedule Atual

```
0 0,6,12,18 * * *
↓   ↓   ↓
├─ 00:00 (meia-noite UTC)
├─ 06:00 (6 da manhã UTC)
├─ 12:00 (meio-dia UTC)
└─ 18:00 (6 da tarde UTC)
```

**No horário de São Paulo (UTC-3):**
- 21:00 (dia anterior)
- 03:00
- 09:00
- 15:00

## ⚙️ Setup Necessário

### 1. Adicionar Secret no GitHub

1. Acesse: https://github.com/VisionVII/smeducacional/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Nome: `CRON_SECRET`
4. Valor: Mesmo valor que você tem em `CRON_SECRET` no `.env`
5. Clique em **"Add secret"**

### 2. Verificar o Workflow

1. Acesse: https://github.com/VisionVII/smeducacional/actions
2. Procure por **"Cron Remarketing Jobs"**
3. Verá histórico de execuções automáticas

### 3. Disparar Manualmente (teste)

1. No GitHub Actions → "Cron Remarketing Jobs"
2. Clique em **"Run workflow"**
3. Selecione **"main"** branch
4. Clique em **"Run workflow"** novamente

## 📊 O que Acontece?

Cada execução:
1. ✅ GitHub Actions dispara à hora agendada
2. ✅ Faz curl POST para seu endpoint: `https://smeducacional.vercel.app/api/cron/remarketing`
3. ✅ Envia header: `Authorization: Bearer <CRON_SECRET>`
4. ✅ Seu endpoint processa:
   - Invoices vencidas → enviar reminders
   - Subscriptions vencendo → enviar alertas
   - Pagamentos falhados → enviar retry
5. ✅ Logs salvos no GitHub Actions

## 📋 Monitoramento

### Ver Logs

1. GitHub Actions → "Cron Remarketing Jobs"
2. Clique na execução mais recente
3. Veja output completo com:
   - ✅ Timestamp de execução
   - ✅ HTTP Status (200 = sucesso)
   - ✅ JSON response do seu endpoint

### Alertas de Falha

Se o curl falhar 3x consecutivas:
- ❌ Você pode receber notificação (opcional configurar)
- 🔍 Verificar logs do GitHub Actions
- 🔧 Testar endpoint localmente

## 🔧 Modificar Schedule

Quer executar em outros horários? Edite `.github/workflows/cron-remarketing.yml`:

```yaml
on:
  schedule:
    - cron: '0 0,6,12,18 * * *'  # ← Modifique aqui
```

**Exemplos:**
```yaml
# Uma vez por dia (meia-noite)
- cron: '0 0 * * *'

# A cada 3 horas
- cron: '0 */3 * * *'

# A cada hora
- cron: '0 * * * *'

# Segunda a sexta, 9 da manhã
- cron: '0 9 * * 1-5'
```

Referência: https://crontab.guru

## ✅ Checklist

- [ ] Secret `CRON_SECRET` adicionado no GitHub
- [ ] Workflow visível em Actions
- [ ] Teste manual disparado com sucesso
- [ ] Logs mostram "Status HTTP: 200"
- [ ] Database recebeu dados (checar System Logs)

## 🚨 Troubleshooting

### "Authorization failed" ou "401"
- Verificar se `CRON_SECRET` no GitHub é idêntico ao do `.env`
- Testar: `echo $CRON_SECRET` no terminal

### "Connection refused" ou "404"
- Verificar se Vercel site está online: https://smeducacional.vercel.app
- Checar se endpoint `/api/cron/remarketing` existe

### "Logs não aparecem"
- Pode levar até 2 minutos após execução
- Atualizar página do GitHub Actions

## 💡 Próximos Passos

1. ✅ Deixar rodando por 1 semana
2. ✅ Monitorar logs de sucesso
3. ✅ Quando crescer, migrar para Railway/Vercel Pro se needed
4. ✅ Adicionar Slack/Discord notification (opcional)

---

**Criado**: 9 de dezembro de 2025
**Status**: ✅ Pronto para produção
