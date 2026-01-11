# 💰 Configurar Taxa da Plataforma (Platform Fee)

## 🎯 Sistema Implementado

**Taxa por tipo de plano:**

- 🆓 **Plano FREE:** 5% de taxa (Instrutor recebe 95%)
- 💎 **Plano PAGO:** 0% de taxa (Instrutor recebe 100%)

**Exemplo com curso de R$ 20.99:**

**Plano FREE:**

- 🏢 Taxa da plataforma (5%): R$ 1,05
- 👨‍🏫 Instrutor recebe (95%): R$ 19,94

**Plano PAGO:**

- 🏢 Taxa da plataforma (0%): R$ 0,00
- 👨‍🏫 Instrutor recebe (100%): R$ 20,99

---

## ✅ Como Funciona

### Sistema Automático de Taxa Diferenciada

O sistema detecta automaticamente o tipo de plano do instrutor:

1. **Instrutor com Plano FREE:**
   - Taxa: 5% sobre cada venda
   - Instrutor recebe: 95% do valor
2. **Instrutor com Plano PAGO (Assinatura):**
   - Taxa: 0% sobre vendas
   - Instrutor recebe: 100% do valor
   - Já paga mensalidade pela plataforma

### Configuração

A taxa para plano FREE pode ser ajustada no arquivo `.env`:

```bash
# Taxa da plataforma para plano FREE (5% = 0.05)
PLATFORM_FEE_PERCENT=0.05
```

**Resultado com 5% (Plano FREE):**

- Curso de R$ 20.99
- 🏢 Taxa da plataforma (5%): R$ 1,05
- 👨‍🏫 Instrutor recebe (95%): R$ 19,94

**Resultado com 0% (Plano PAGO):**

- Curso de R$ 20.99
- 🏢 Taxa da plataforma (0%): R$ 0,00
- 👨‍🏫 Instrutor recebe (100%): R$ 20,99

---

## 🎁 Incentivo ao Upgrade

Este modelo incentiva instrutores a assinarem o plano pago:

**Plano FREE (5% por venda):**

- Ideal para começar
- Sem custo fixo
- Plataforma cobra apenas quando vende

**Plano PAGO (0% por venda + mensalidade):**

- Melhor para quem vende muito
- 100% do valor das vendas
- Mensalidade fixa (ex: R$ 99/mês)

**Exemplo de Breakeven:**

- Mensalidade R$ 99
- Curso R$ 20.99
- 5% de taxa = R$ 1,05 por venda
- Breakeven: ~95 vendas/mês

Acima de 95 vendas, o plano pago compensa!

---

## 📊 Comparação de Taxas

| Plano do Instrutor | Curso R$ 20.99 | Plataforma | Instrutor Recebe |
| :----------------- | :------------- | :--------- | :--------------- |
| **FREE (5%)**      | R$ 20.99       | R$ 1,05    | R$ 19,94 (95%)   |
| **PAGO (0%)**      | R$ 20.99       | R$ 0,00    | R$ 20,99 (100%)  |

---

## 🏆 Benchmark do Mercado

| Plataforma    | Taxa da Plataforma               |
| :------------ | :------------------------------- |
| **Udemy**     | 50% a 97% (depende de marketing) |
| **Hotmart**   | 9.9% + R$ 1,00                   |
| **Teachable** | 5% a 10% + taxa processamento    |
| **Thinkific** | 0% (plano pago) ou 10% (free)    |
| **Coursera**  | 50%                              |
| **Eduzz**     | 8% + R$ 1,00                     |
| **Monetizze** | 9.9% + R$ 1,00                   |

**Sua proposta de 5% é MUITO competitiva!** 🚀

---

## ⚙️ Configuração Completa

### 1. Adicione no `.env`:

```bash
# ============================================
# CONFIGURAÇÕES DE PAGAMENTO E TAXAS
# ============================================

# Taxa da plataforma sobre cada venda (5% = 0.05)
PLATFORM_FEE_PERCENT=0.05

# Stripe (já configurado)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Reinicie o servidor:

```bash
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### 3. Teste o cálculo:

Crie um curso de R$ 20.99 e simule uma venda. No console você verá:

```
✅ Divisão de receita:
   Total: R$ 20.99
   Taxa (5%): R$ 1.05
   Instrutor (95%): R$ 19.94
```

---

## 🔒 Segurança

- ✅ A taxa é calculada no **servidor** (não pode ser alterada pelo cliente)
- ✅ Registrada no **AuditLog** para cada venda
- ✅ Armazenada na tabela `Payout` para transparência

---

## 📝 Onde a Taxa é Aplicada

1. **Webhook Stripe** (`/api/webhooks/stripe`):

   - Quando uma venda é confirmada
   - Calcula automaticamente a divisão
   - Cria registro de Payout para o instrutor

2. **PaymentService** (`src/lib/payment.service.ts`):

   - Função `calculateRevenueSplit(amount)`
   - Usada em todas as vendas

3. **Exibição** (opcional):
   - Você pode mostrar ao instrutor quanto ele receberá
   - Adicionar no dashboard do professor

---

## 💡 Modelo de Negócio Implementado

**Sistema de Taxa Dupla:**

```bash
PLATFORM_FEE_PERCENT=0.05  # 5% para plano FREE
```

**Receita da Plataforma:**

1. **Instrutores FREE:** 5% de cada venda
2. **Instrutores PAGOS:** Mensalidade (ex: R$ 99/mês)

**Vantagens deste modelo:**

- ✅ Instrutores iniciantes podem começar sem investimento
- ✅ Instrutores de sucesso pagam mensalidade e ficam com 100%
- ✅ Plataforma sempre tem receita (taxas ou mensalidades)
- ✅ Incentiva crescimento e profissionalização

**Exemplo de Receita Mensal da Plataforma:**

- 100 instrutores FREE vendendo R$ 1.000/mês cada = R$ 5.000 (5% de R$ 100k)
- 50 instrutores PAGOS pagando R$ 99/mês = R$ 4.950
- **Total:** R$ 9.950/mês

---

Desenvolvido pela **VisionVII** - Transformação Digital com Excelência 🚀
