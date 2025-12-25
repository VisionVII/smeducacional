# 💰 Sistema de Notificações de Pagamento - Dashboard Admin

## 📋 O que foi implementado

### 1. **Detecção de Ambiente (Teste vs Produção)**

Agora todos os pagamentos são marcados automaticamente como **teste** ou **produção** baseado no modo do Stripe:

```typescript
const isTest = session.livemode === false; // Detecta sk_test_ vs sk_live_
```

**No banco de dados** (`Payment` model):

- Campo: `isTest Boolean @default(false)`
- ✅ `true` = Pagamento de teste (ambiente de desenvolvimento)
- ✅ `false` = Pagamento de produção (ambiente real)

---

### 2. **Notificações Automáticas para Admins**

Quando um pagamento é confirmado, **TODOS os admins** recebem uma notificação instantânea:

**Notificação de Produção:**

```
💰 Novo Pagamento Confirmado
João Silva comprou o curso "React Avançado" por R$ 99,00
```

**Notificação de Teste:**

```
💳 Pagamento de Teste Recebido
Maria Santos comprou o curso "Node.js Básico" por R$ 49,00 (AMBIENTE DE TESTE)
```

**Implementação no webhook:**

```typescript
// src/app/api/webhooks/stripe/route.ts
const admins = await prisma.user.findMany({
  where: { role: 'ADMIN' },
  select: { id: true },
});

await Promise.all(
  admins.map((admin) =>
    prisma.notification.create({
      data: {
        userId: admin.id,
        title: isTest
          ? '💳 Pagamento de Teste Recebido'
          : '💰 Novo Pagamento Confirmado',
        message: `${user.name} comprou o curso "${
          course.title
        }" por R$ ${price}${isTest ? ' (AMBIENTE DE TESTE)' : ''}`,
        type: 'PAYMENT',
      },
    })
  )
);
```

---

### 3. **Dashboard Admin - Pagamentos Recentes**

**Componente:** `src/components/admin/recent-payments.tsx`

Exibe os últimos 10 pagamentos confirmados com:

- ✅ Avatar do comprador
- ✅ Nome e curso comprado
- ✅ Valor e data/hora
- ✅ Badge "TESTE" em amarelo para pagamentos de desenvolvimento
- ✅ Status "Confirmado" em verde

**API:** `GET /api/admin/payments/recent`

```json
{
  "data": [
    {
      "id": "clx...",
      "amount": 99.0,
      "currency": "BRL",
      "isTest": false,
      "createdAt": "2024-12-24T14:30:00Z",
      "user": { "name": "João Silva", "email": "joao@email.com" },
      "course": { "title": "React Avançado" }
    }
  ]
}
```

---

### 4. **Dashboard Admin - Estatísticas de Pagamento**

**Componente:** `src/components/admin/payment-stats.tsx`

Mostra 4 cards de estatísticas:

1. **Receita Total** (apenas produção)

   - Soma de todos pagamentos com `isTest = false`
   - Trend: pagamentos últimos 30 dias

2. **Últimas 24h**

   - Quantidade de pagamentos confirmados hoje
   - Trend: pagamentos últimos 7 dias

3. **Pagamentos Teste** (card amarelo)

   - Total de pagamentos com `isTest = true`
   - Indica ambiente de desenvolvimento

4. **Receita de Teste** (card amarelo)
   - Soma de pagamentos de teste
   - **NÃO contabiliza na receita real**

**API:** `GET /api/admin/payments/stats`

```json
{
  "data": {
    "totalRevenue": 12450.0, // Apenas produção
    "testRevenue": 548.0, // Apenas teste
    "paymentsLast24h": 3,
    "paymentsLast7days": 15,
    "paymentsLast30days": 42,
    "testPayments": 8
  }
}
```

---

## 📂 Arquivos Modificados/Criados

### Schema do Banco (Prisma)

- ✅ `prisma/schema.prisma` - Adicionado campo `isTest` em `Payment`

### APIs Backend

- ✅ `src/app/api/admin/payments/recent/route.ts` - Busca últimos pagamentos
- ✅ `src/app/api/admin/payments/stats/route.ts` - Estatísticas de pagamento
- ✅ `src/app/api/webhooks/stripe/route.ts` - Criar notificações + detectar modo teste

### Componentes Frontend

- ✅ `src/components/admin/recent-payments.tsx` - Lista de pagamentos recentes
- ✅ `src/components/admin/payment-stats.tsx` - Cards de estatísticas
- ✅ `src/app/admin/page.tsx` - Dashboard atualizado com novos componentes

---

## 🧪 Como Testar

### 1. Fazer um Pagamento de Teste

```bash
# 1. Servidor dev rodando
npm run dev

# 2. Stripe CLI rodando (em outro terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 3. Criar curso como TEACHER
# 4. Comprar curso como STUDENT
# 5. Usar cartão de teste: 4242 4242 4242 4242
```

### 2. Verificar Notificação

1. Login como **ADMIN** em http://localhost:3000/admin
2. Clique no ícone de 🔔 Bell
3. Você verá:
   ```
   💳 Pagamento de Teste Recebido
   Fulano comprou "Curso X" por R$ 99,00 (AMBIENTE DE TESTE)
   ```

### 3. Ver no Dashboard

- **Dashboard Admin** → Seção "Pagamentos Recentes"
- Pagamento aparecerá com badge **"TESTE"** em amarelo
- Estatísticas mostrarão:
  - **Pagamentos Teste**: 1
  - **Receita de Teste**: R$ 99,00

---

## 🚀 Produção

### Quando migrar para produção (chaves `sk_live_`):

1. **Pagamentos reais** terão `isTest = false`
2. **Notificações** NÃO terão "(AMBIENTE DE TESTE)"
3. **Receita Total** incluirá apenas pagamentos reais
4. **Cards amarelos** mostrarão apenas dados de teste (se houver)

---

## 🎯 Features Principais

✅ **Detecção automática** de ambiente (teste/produção)  
✅ **Notificações em tempo real** para todos os admins  
✅ **Dashboard visual** com últimos pagamentos  
✅ **Separação clara** entre receita real e teste  
✅ **Badge amarelo** para identificar pagamentos de teste  
✅ **Estatísticas detalhadas** (24h, 7 dias, 30 dias)

---

## 📊 Estrutura de Dados

### Payment (Banco de Dados)

```prisma
model Payment {
  id            String  @id @default(cuid())
  userId        String
  courseId      String?
  amount        Float
  currency      String  @default("BRL")
  status        String  @default("pending")
  isTest        Boolean @default(false) // 🆕 Novo campo
  createdAt     DateTime @default(now())

  user   User    @relation(...)
  course Course? @relation(...)
}
```

### Notification (Sistema de Notificações)

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String   // ID do admin que recebe
  title     String   // "💰 Novo Pagamento Confirmado"
  message   String   // Detalhes da compra
  type      NotificationType // "PAYMENT"
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 🔗 Endpoints Criados

### Pagamentos Recentes

```
GET /api/admin/payments/recent
Authorization: Admin only
Response: { data: Payment[] }
```

### Estatísticas de Pagamento

```
GET /api/admin/payments/stats
Authorization: Admin only
Response: {
  data: {
    totalRevenue: number,
    testRevenue: number,
    paymentsLast24h: number,
    paymentsLast7days: number,
    paymentsLast30days: number,
    testPayments: number
  }
}
```

---

**Desenvolvido com excelência pela VisionVII** 🚀
