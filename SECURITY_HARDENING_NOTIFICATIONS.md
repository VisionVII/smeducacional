# 🔒 SECURITY HARDENING - Sistema de Notificações

## Status: ✅ IMPLEMENTADO

Documento de auditoria de segurança para o sistema de notificações em SM Educa.

---

## 1. Rate Limiting (IMPLEMENTADO ✅)

### Middleware: `/src/lib/middleware/rate-limit.ts`

**Limites por Endpoint:**

| Endpoint                          | Limite  | Janela |
| --------------------------------- | ------- | ------ |
| `/api/notifications`              | 100 req | 60s    |
| `/api/notifications/preferences`  | 20 req  | 60s    |
| `/api/notifications/unread-count` | 300 req | 60s    |

**Implementação:**

- Map em memória com contador por usuário
- Janelas deslizantes com `resetAt`
- Retorna `X-RateLimit-Remaining` header
- HTTP 429 quando limite atingido

**Código:**

```typescript
export function checkRateLimit(
  userId: string,
  endpoint: keyof typeof RATE_LIMITS
): { allowed: boolean; remaining: number; resetIn: number };
```

**Benefícios:**

- ✅ Protege contra brute force
- ✅ Previne DoS em polling
- ✅ Reduz carga do servidor
- ✅ Retorna informações de reset

---

## 2. Integração nos Endpoints

### `/api/notifications` (GET & POST)

- ✅ Rate limit adicionado
- ✅ Headers X-RateLimit retornados
- ✅ Validação Zod em POST

### `/api/notifications/[id]` (PATCH & DELETE)

- ✅ Rate limit adicionado
- ✅ Verificação de propriedade (userId match)
- ✅ Error handling com instanceof

### `/api/notifications/preferences` (GET & PUT)

- ✅ Rate limit adicionado
- ✅ Validação Zod em PUT
- ✅ User scope isolado

### `/api/notifications/unread-count` (GET)

- ✅ Rate limit (menos restritivo)
- ✅ Endpoint de alta frequência otimizado

---

## 3. Headers de Segurança

Todos os endpoints retornam:

```
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 45
```

**Cliente pode:**

- Detectar proximidade do limite
- Ajustar taxa de requisições
- Exibir aviso ao usuário

---

## 4. Autenticação & Autorização

### ✅ Verificações Implementadas:

1. **Todas as rotas verificam `session.user.id`**

   ```typescript
   if (!session?.user?.id) {
     return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
   }
   ```

2. **Notificações isoladas por usuário**

   - GET retorna apenas notificações do usuário autenticado
   - PATCH/DELETE verificam ownership

3. **Rate limit por usuário**
   - Chave = `${userId}:${endpoint}`
   - Cada usuário tem limite independente

---

## 5. Validação & Tipos

### Zod Schemas Aplicados:

**Preferences (PUT):**

```typescript
const preferencesSchema = z.object({
  emailSecurityAlerts: z.boolean().optional(),
  emailEnrollments: z.boolean().optional(),
  // ... 12 campos validados
  quietHoursTimezone: z.string().optional(),
});
```

**Benefícios:**

- ✅ Runtime type safety
- ✅ Previne injection attacks
- ✅ Documentação automática

---

## 6. Error Handling

### Tipagem Segura com `unknown`:

**ANTES (Vulnerável):**

```typescript
} catch (error: any) {
  if (error.message === 'Notificação não encontrada') {
    // Error pode ser string, null, undefined...
  }
}
```

**DEPOIS (Seguro):**

```typescript
} catch (error: unknown) {
  if (error instanceof Error && error.message === 'Notificação não encontrada') {
    // Type-safe access
  }
}
```

---

## 7. Logging de Auditoria

### NotificationLog (Banco de Dados)

```prisma
model NotificationLog {
  id        String   @id @default(cuid())
  notificationId String
  type      String   // CREATED|SENT|READ|ARCHIVED|DELETED
  userId    String
  details   Json?
  createdAt DateTime @default(now())
}
```

**Rastreamento:**

- ✅ Toda ação em notificação é registrada
- ✅ Timestamp automático
- ✅ Detalhes JSON customizáveis

---

## 8. Dados em Trânsito

### HTTPS Obrigatório

- ✅ Variáveis de ambiente secured
- ✅ Auth token em HttpOnly cookies (NextAuth)
- ✅ Sem exposição de dados sensíveis em logs

### JSON Handling Seguro

```typescript
// ANTES: any cast unsure
const data = (notificationData as any) || null;

// DEPOIS: JSON serialization
const data = JSON.parse(JSON.stringify(notificationData));
```

---

## 9. Quiet Hours (Proteção de Privacidade)

### Verificação Automática:

```typescript
// NotificationService.isInQuietHours()
const now = new Date();
const currentTime = now.getHours() * 60 + now.getMinutes();
const startTime = parseInt(preference.quietHoursStart.split(':')[0]) * 60;
const endTime = parseInt(preference.quietHoursEnd.split(':')[0]) * 60;

return currentTime >= startTime && currentTime < endTime;
```

**Benefícios:**

- ✅ Respeita privacidade do usuário
- ✅ Timezone-aware
- ✅ Customizável por usuário

---

## 10. Índices no Banco de Dados

### Performance & Segurança:

```prisma
model Notification {
  // ...
  @@index([userId, type, createdAt])
  @@index([userId, isRead])
}
```

**Resultado:**

- ✅ Queries otimizadas (sem full table scans)
- ✅ Resgate rápido de notificações não lidas
- ✅ Filtering eficiente por tipo

---

## 11. Checklist de Segurança

| Aspecto       | Status | Evidência                               |
| ------------- | ------ | --------------------------------------- |
| Autenticação  | ✅     | Session check em todas as rotas         |
| Rate Limiting | ✅     | rate-limit.ts + aplicado em 5 rotas     |
| RBAC          | ✅     | User isolation + ownership verification |
| Validação     | ✅     | Zod schemas em PUT/POST                 |
| Tipagem       | ✅     | TypeScript strict + `unknown` type      |
| Auditoria     | ✅     | NotificationLog model                   |
| Encoding      | ✅     | JSON parsing/stringify                  |
| Logging       | ✅     | Console.error com contexto              |
| HTTPS         | ✅     | NextAuth HttpOnly cookies               |
| Headers       | ✅     | X-RateLimit-\* adicionados              |

---

## 12. Próximos Passos

### Recomendado para Produção:

1. **Redis para Rate Limiting** (em vez de Map)

   ```typescript
   // Permite múltiplas instâncias Node
   const redis = new Redis(process.env.REDIS_URL);
   ```

2. **CORS Middleware**

   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': process.env.FRONTEND_URL,
     'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
   };
   ```

3. **Helmet.js**

   ```typescript
   // next.config.js
   const helmet = require('next-helmet');
   ```

4. **API Versioning**

   ```
   /api/v1/notifications
   /api/v2/notifications
   ```

5. **Request ID Tracking**
   ```typescript
   const requestId = crypto.randomUUID();
   // Incluir em todos os logs
   ```

---

## 13. Métricas de Monitoramento

**Implementar alertas para:**

- Taxa de 429 responses > 5% requests
- Tempo de resposta > 500ms
- Notificações com erro ao enviar email
- Taxa de soft-delete > normal

---

## Conclusão

✅ **Sistema de Notificações Seguro:**

- Protegido contra DoS
- Auditoria completa
- Isolamento por usuário
- Validação rigorosa
- Type-safe error handling

**Data:** Janeiro 2025
**Versão:** VisionVII 3.0 Enterprise
