# Checkout & Payouts — VisionVII (Enterprise)

Este guia cobre passo a passo a integração de múltiplos meios de pagamento (Stripe cartão, Stripe Pix, MBWay), configuração de webhooks, e o fluxo de repasses (payouts) aos professores. Também aborda o caso de mensalidades dos professores (subscriptions) pagas ao sistema.

---

## 1. Visão Geral

- Checkout unificado: `POST /api/checkout/session` com `provider` (`stripe`, `stripe_pix`, `mbay`).
- Providers:
  - `stripe`: cartão (checkout session padrão)
  - `stripe_pix`: Pix via Stripe (payment_method Pix)
  - `mbay`: MBWay via provider externo (placeholder com URL de checkout)
- Webhooks:
  - Stripe: `/api/webhooks/stripe` (já existente)
  - Pix: `/api/webhooks/pix` (placeholder seguro)
  - MBWay: `/api/webhooks/mbay` (placeholder seguro)
- Payouts aos professores: recomendado Stripe Connect para repasses automáticos.
- Mensalidades dos professores: subscriptions Stripe ou PSP local, cobradas pelo sistema.

---

## 2. Variáveis de Ambiente

- Gerais:
  - `NEXT_PUBLIC_URL` — URL pública do app (ex.: https://app.seudominio.com)
- Stripe:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- MBWay (PSP local):
  - `MBAY_API_URL` — base da API
  - `MBAY_API_KEY` — token/chave (se necessário)
- Azure Translator (opcional, tradutor IA):
  - `AZURE_TRANSLATOR_KEY`
  - `AZURE_TRANSLATOR_REGION`

Adicione no Vercel/ambiente de produção e em `.env.local` para desenvolvimento.

---

## 3. Fluxo — Checkout (Aluno → Compra de Curso)

1. Cliente inicia checkout:
   - Endpoint: `POST /api/checkout/session`
   - Body:
     - Cartão Stripe: `{ "courseId": "COURSE_ID", "provider": "stripe" }`
     - Pix Stripe: `{ "courseId": "COURSE_ID", "provider": "stripe_pix" }`
     - MBWay: `{ "courseId": "COURSE_ID", "provider": "mbay" }`
2. API valida com Zod, exige `auth()`, bloqueia curso grátis e duplicidade de matrícula.
3. Provider cria sessão (link) e responde `{ sessionId, url }`.
4. Cliente redireciona para `url`.
5. Após pagamento, webhook do provider atualiza `Payment`, `Enrollment` e `CheckoutSession.status`.

Arquivos-chave:
- `src/app/api/checkout/session/route.ts`
- `src/lib/payments/*` (providers)
- `src/app/api/webhooks/*` (confirmations)

---

## 4. Stripe Cartão (Recomendado)

- Vantagens: antifraude, 3DS, suporte e escalabilidade.
- Passos:
  1. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
  2. Use provider `stripe` no endpoint unificado.
  3. Webhook oficial `/api/webhooks/stripe` já está no projeto (verifique assinatura).

---

## 5. Stripe Pix (Brasil)

- Habilita Pix dentro do Stripe.
- Passos:
  1. Habilite Pix na conta Stripe.
  2. Use provider `stripe_pix` (enforce `payment_method_types: ['pix']`).
  3. Preferir webhook `/api/webhooks/stripe` para confirmação.
  4. Opcional: `/api/webhooks/pix` (placeholder) se usar outro PSP.

---

## 6. MBWay (Portugal/EU)

- Integração via PSP local com API REST.
- Passos:
  1. Obtenha credenciais e docs do PSP.
  2. Configure `MBAY_API_URL`, `MBAY_API_KEY`.
  3. Provider `mbay` cria link de pagamento (implementar chamadas reais no `src/lib/payments/mbay.ts`).
  4. Configure webhook do PSP para `/api/webhooks/mbay` e valide assinatura.

---

## 7. Webhooks — Confirmação de Pagamento

- Objetivo: consolidar `Payment`, criar `Enrollment` e atualizar `CheckoutSession`.
- Implementações:
  - Stripe: `/api/webhooks/stripe` (existente)
  - Pix/MBWay: placeholders em `/api/webhooks/pix`, `/api/webhooks/mbay` (ajuste conforme PSP real).
- Boas práticas:
  - Validar assinatura do provedor.
  - Idempotência (evitar criar matrícula duplicada).
  - Logging seguro, sem dados sensíveis.

---

## 8. Payouts — Repasses aos Professores

### Opção A: Stripe Connect (Recomendado)

- Passos:
  1. Habilite Connect na conta Stripe.
  2. Onboard professores criando `connected accounts` (KYC).
  3. Defina regra de divisão (ex.: 70% professor, 30% sistema) por curso.
  4. Após `payment_intent.succeeded` no webhook Stripe, crie `Transfer` para a conta do professor.
  5. (Opcional) Registre `Payout` interno para relatórios.

Vantagens: compliance, automação de repasses, relatórios claros.

### Opção B: Payout Pix via PSP local

- Passos:
  1. Armazene conta bancária/Pix do professor.
  2. Use SDK/API do PSP para transferências Pix.
  3. Agende conciliação e repasses (cron diário/semanal).

---

## 9. Mensalidades dos Professores (Subscriptions)

- Caso: o sistema cobra uma mensalidade dos professores (para acesso/plano).
- Recomendado: Stripe Subscriptions.
- Passos:
  1. Crie `Products` e `Prices` no Stripe para planos de professor.
  2. Endpoint: `POST /api/teacher/subscriptions/create` (a implementar).
  3. Webhook Stripe (evento `invoice.payment_succeeded`) atualiza status de assinatura.
  4. Feature gating via `src/lib/subscription.ts`.

Alternativa: PSP local com contratos de débito direto/MBWay.

---

## 10. Segurança (VisionVII)

- Auth obrigatório nas rotas protegidas (`auth()`).
- Validação Zod em todos os inputs.
- Nunca expor `id` interno em rotas públicas (usar `slug`).
- Webhooks com assinatura e idempotência.
- Logging sem dados sensíveis.
- Rate limiting em endpoints públicos.

---

## 11. Testes Rápidos

```bash
# Criar sessão Stripe (cartão)
curl -X POST $NEXT_PUBLIC_URL/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{ "courseId": "COURSE_ID", "provider": "stripe" }'

# Criar sessão Stripe (Pix)
curl -X POST $NEXT_PUBLIC_URL/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{ "courseId": "COURSE_ID", "provider": "stripe_pix" }'

# Criar sessão MBWay
curl -X POST $NEXT_PUBLIC_URL/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{ "courseId": "COURSE_ID", "provider": "mbay" }'
```

---

## 12. Próximos Passos

- Implementar endpoints de subscriptions para professores.
- Adicionar entidades `Payout`/`TeacherBalance` no Prisma (se necessário).
- Integrar assinatura de webhooks para MBWay/PSP.
- Monitorar logs e dashboards de pagamentos.
