# 🚀 Quick Start: Configuração Stripe Multi-País

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Acessar Configuração

```
Admin Dashboard → Configuração de Planos → Botão "Stripe & Pagamentos"
```

Ou direto: `/admin/plans/stripe`

---

### 2️⃣ Configurar Credenciais (Tab 1)

**Obter chaves do Stripe**:

1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie suas chaves:

```
Publishable Key: pk_test_51K...  (desenvolvimento)
Secret Key:      sk_test_51K...  (desenvolvimento)
```

3. Cole no sistema
4. Clique "Testar Conexão" ✅

**⚠️ Produção**: Use `pk_live_` e `sk_live_`

---

### 3️⃣ Configurar Moedas (Tab 2)

**Moeda Padrão**: `BRL` (Brasil)

**Habilitar moedas adicionais**:

- ✅ BRL (Real Brasileiro)
- ✅ USD (Dólar Americano)
- ✅ EUR (Euro)
- ✅ MXN (Peso Mexicano) - se atender América Latina

---

### 4️⃣ Definir Preços por País (Tab 3)

**Exemplo Brasil**:

```
País: BR
Moeda: BRL
Basic: 9900 (R$ 99,00/mês)
Pro: 19900 (R$ 199,00/mês)
Premium: 39900 (R$ 399,00/mês)
```

**Exemplo EUA**:

```
País: US
Moeda: USD
Basic: 1900 ($19,00/mês)
Pro: 3900 ($39,00/mês)
Premium: 7900 ($79,00/mês)
```

**💡 Dica**: Ajuste preços baseado no poder de compra local

---

### 5️⃣ Métodos de Pagamento (Tab 4)

**Brasil** 🇧🇷:

- ✅ Cartão de Crédito/Débito
- ✅ PIX
- ✅ Boleto Bancário

**Internacional** 🌎:

- ✅ Cartão de Crédito/Débito
- ⚙️ SEPA (Europa)
- ⚙️ iDEAL (Holanda)

---

### 6️⃣ Repasses Automáticos (Tab 5)

**Configuração Recomendada**:

```
Habilitar: ✅ ON
Frequência: Semanal
```

**Fluxo**:

1. Aluno compra → Pagamento processado
2. 7 dias de holding (garantia)
3. Comissão retida (15% plano Free)
4. Repasse automático para professor
5. 2-3 dias úteis até cair na conta

---

### 7️⃣ Configurar Webhook

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique "Add endpoint"
3. URL: `https://seudominio.com/api/webhooks/stripe`
4. Selecione eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
5. Copie `whsec_...`
6. Cole na Tab 1 do sistema

---

### 8️⃣ Testar Pagamento

**Cartão de teste Stripe**:

```
Número: 4242 4242 4242 4242
CVV: 123
Data: 12/28
```

**Testar**:

1. Acesse `/courses` como aluno
2. Tente comprar um curso
3. Use cartão de teste
4. Verifique no Stripe Dashboard

---

## 📋 Checklist Final

- [ ] Credenciais Stripe adicionadas
- [ ] Conexão testada com sucesso
- [ ] Moeda padrão definida
- [ ] Moedas adicionais habilitadas
- [ ] Preços por país configurados
- [ ] Métodos de pagamento habilitados
- [ ] Webhook configurado no Stripe
- [ ] Webhook secret adicionado
- [ ] Teste de pagamento realizado
- [ ] Sistema em produção (`pk_live_`)

---

## 🔥 Dicas Pro

### Performance

- Configure apenas países onde você tem alunos
- Não habilite moedas desnecessárias
- Use preços específicos ao invés de conversão automática

### Conversão

- Brasil: R$ 99 → USD $19 (não R$ 19!)
- Considere paridade de poder de compra (PPP)
- Pesquise concorrentes locais

### Impostos

- Configure `taxConfiguration` por país
- Stripe Tax automatiza cálculo de impostos
- Veja: https://stripe.com/tax

---

## 🆘 Problemas Comuns

**Erro: "Invalid API Key"**
→ Verifique se pk* e sk* são do mesmo ambiente (test ou live)

**Método de pagamento não aparece**
→ Verifique ativação no Stripe Dashboard

**Webhook não funciona**
→ Confirme URL e copie secret corretamente

---

## 📞 Suporte

**Documentação Completa**: `STRIPE_INTERNATIONAL_CONFIG.md`

**Stripe Support**: https://support.stripe.com

**Dashboard**: https://dashboard.stripe.com

---

✅ **Pronto!** Sistema configurado para vendas globais 🌎

---

**VisionVII** — Transformando educação através da tecnologia
