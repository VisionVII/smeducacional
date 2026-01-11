# 🔗 Guia de Integração - Sistema de Notificações

**Data:** Janeiro 2026  
**Status:** 🟢 Pronto para Integração nos Endpoints  
**Duração:** 2-3 horas para integrar em todos os endpoints

---

## 📋 Índice

1. [Arquivos Criados](#arquivos-criados)
2. [Como Usar NotificationService](#como-usar-notificationservice)
3. [Integração em Endpoints Específicos](#integração-em-endpoints-específicos)
4. [Integração no Layout (NotificationBell)](#integração-no-layout)
5. [Checklist de Integração](#checklist-de-integração)

---

## 📁 Arquivos Criados

### Schema & Banco

- `prisma/schema.prisma` - Models adicionados (Notification, NotificationPreference, NotificationLog)

### Service

- `src/lib/services/notification.service.ts` - Lógica de negócio central

### APIs

- `src/app/api/notifications/route.ts` - GET (listar) e POST (marcar tudo como lido)
- `src/app/api/notifications/[id]/route.ts` - PATCH (ler/arquivar) e DELETE
- `src/app/api/notifications/preferences/route.ts` - GET/PUT preferências
- `src/app/api/notifications/unread-count/route.ts` - GET contagem de não lidas

### Componentes UI

- `src/components/notifications/notification-bell.tsx` - Bell icon com dropdown
- `src/app/notifications/page.tsx` - Página completa de notificações

---

## 🚀 Como Usar NotificationService

### Importar o Service

```typescript
import { NotificationService } from '@/lib/services/notification.service';
```

### 1. Criar uma Notificação Simples

```typescript
await NotificationService.createNotification({
  userId: user.id,
  type: 'NEW_ENROLLMENT',
  title: 'Nova inscrição em seu curso',
  message: `${studentName} se inscreveu em ${courseName}`,
  actionUrl: `/teacher/courses/${courseId}`,
  sendEmail: true, // Enviará email se preferência permitir
});
```

### 2. Criar Notificação com Dados Estruturados

```typescript
await NotificationService.createNotification({
  userId: instructor.id,
  type: 'PAYOUT_READY',
  title: 'Pagamento disponível',
  message: `Você tem R$ ${amount.toFixed(2)} disponível para saque`,
  actionUrl: `/teacher/earnings`,
  data: {
    amount,
    transactionId: payout.id,
    accountType: 'bank',
  },
  sendEmail: true,
});
```

### 3. Notificação para Múltiplos Usuários

```typescript
// Notificar TODOS os admins sobre alerta de segurança
const adminIds = await prisma.user.findMany({
  where: { role: 'ADMIN' },
  select: { id: true },
});

await NotificationService.broadcastNotification(
  {
    type: 'SECURITY_ALERT',
    title: 'Alerta de segurança detectado',
    message: 'Múltiplas tentativas de login falhadas detectadas',
    actionUrl: '/admin/security',
    sendEmail: true,
  },
  adminIds.map((u) => u.id)
);
```

### 4. Marcar Como Lida (Frontend)

```typescript
await NotificationService.markAsRead(notificationId, userId);
```

### 5. Atualizar Preferências do Usuário

```typescript
await NotificationService.updatePreferences(userId, {
  emailEnrollments: true,
  emailPayments: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
});
```

---

## 🔌 Integração em Endpoints Específicos

### A. Quando Aluno Compra Curso

**Arquivo:** `src/app/api/checkout/course/route.ts`

**Adicionar após sucesso do checkout:**

```typescript
import { NotificationService } from '@/lib/services/notification.service';

// ... código existente ...

// Após criar o enrollment com sucesso
await Promise.all([
  // Notificar aluno
  NotificationService.createNotification({
    userId: student.id,
    type: 'COURSE_PURCHASED',
    title: 'Curso comprado com sucesso!',
    message: `Bem-vindo ao curso "${course.title}". Você pode começar agora!`,
    actionUrl: `/courses/${course.id}`,
    sendEmail: true,
  }),

  // Notificar professor
  NotificationService.createNotification({
    userId: course.instructorId,
    type: 'NEW_ENROLLMENT',
    title: 'Novo aluno inscrito',
    message: `${student.name} se inscreveu em "${course.title}"`,
    actionUrl: `/teacher/courses/${course.id}`,
    sendEmail: true,
  }),
]);
```

### B. Quando Professor Atualiza Aula

**Arquivo:** `src/app/api/lessons/[id]/route.ts`

**Adicionar após atualizar lição:**

```typescript
// Buscar todos os alunos que estão inscritos no curso
const enrollments = await prisma.enrollment.findMany({
  where: {
    courseId: lesson.module.courseId,
    status: 'COMPLETED', // ou status apropriado
  },
  select: { userId: true },
});

// Notificar todos os alunos
await NotificationService.broadcastNotification(
  {
    type: 'LESSON_AVAILABLE',
    title: 'Nova aula disponível!',
    message: `"${lesson.title}" está disponível no curso "${lesson.module.course.title}"`,
    actionUrl: `/courses/${lesson.module.courseId}`,
    sendEmail: true,
  },
  enrollments.map((e) => e.userId)
);
```

### C. Quando Webhook de Pagamento é Recebido

**Arquivo:** `src/app/api/webhooks/stripe/route.ts`

**Adicionar no caso `charge.succeeded`:**

```typescript
case 'charge.succeeded':
  const charge = event.data.object;

  // ... código existente ...

  // Notificar professor que pagamento foi processado
  await NotificationService.createNotification({
    userId: instructor.id,
    type: 'PAYOUT_READY',
    title: 'Novo pagamento recebido',
    message: `R$ ${(charge.amount / 100).toFixed(2)} foi depositado na sua conta`,
    actionUrl: '/teacher/earnings',
    data: { chargeId: charge.id, amount: charge.amount },
    sendEmail: true,
  });
  break;
```

### D. Quando Usuário Recebe Review

**Arquivo:** `src/app/api/reviews/route.ts`

**Adicionar após criar review:**

```typescript
// Notificar professor sobre novo review
await NotificationService.createNotification({
  userId: course.instructorId,
  type: 'COURSE_REVIEW',
  title: 'Novo review recebido',
  message: `${review.author} deu ${review.rating}⭐ para seu curso "${course.title}"`,
  actionUrl: `/teacher/courses/${course.id}/reviews`,
  sendEmail: true,
});
```

### E. Alerta de Segurança (Para Admin)

**Arquivo:** `src/lib/services/audit.service.ts`

**Adicionar quando detectar anomalia:**

```typescript
if (auditEntry.severity === 'HIGH') {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  await NotificationService.broadcastNotification(
    {
      type: 'SECURITY_ALERT',
      title: 'Alerta de segurança',
      message: `${auditEntry.action} por ${auditEntry.userId}`,
      actionUrl: '/admin/security',
      data: { auditId: auditEntry.id },
      sendEmail: true,
    },
    admins.map((a) => a.id)
  );
}
```

---

## 🎨 Integração no Layout (NotificationBell)

### Adicionar na Header/Navbar Principal

**Arquivo:** `src/components/header.tsx` (ou similar)

```typescript
import { NotificationBell } from '@/components/notifications/notification-bell';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      {/* Logo, Menu, etc */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        {/* Outros ícones de usuário, etc */}
      </div>
    </header>
  );
}
```

### Adicionar Link para Página de Notificações

**Na navbar/menu:**

```tsx
<a href="/notifications" className="flex items-center gap-2">
  <Bell className="h-5 w-5" />
  Notificações
</a>
```

---

## 📋 Checklist de Integração

### Fase 1: Setup (30 min)

- [ ] Executar migration: `npx prisma migrate dev --name add_notification_system`
- [ ] Verificar que schema foi atualizado
- [ ] Testar conexão com BD

### Fase 2: Criar Notificações (30-45 min)

- [ ] Integrar em checkout course
- [ ] Integrar em update lesson
- [ ] Integrar em webhook Stripe
- [ ] Integrar em create review
- [ ] Testar cada integração

### Fase 3: UI (30 min)

- [ ] Adicionar NotificationBell no layout principal
- [ ] Testar bell icon e dropdown
- [ ] Testar página `/notifications`
- [ ] Testar dark mode

### Fase 4: Teste End-to-End (30-45 min)

- [ ] Login como admin - verificar alertas
- [ ] Login como professor - verificar enrollments
- [ ] Login como aluno - comprar curso
- [ ] Verificar emails foram enviados
- [ ] Marcar como lido no bell
- [ ] Arquivar da página completa
- [ ] Verificar contagem de não lidas

### Fase 5: Ajustes (15-30 min)

- [ ] Ajustar templates de email se necessário
- [ ] Testar quiet hours
- [ ] Ajustar preferências por tipo de usuário

---

## 🧪 Exemplo Completo de Integração

### Integração em Nova Compra de Curso

**Arquivo:** `src/app/api/checkout/course/route.ts`

```typescript
import { NotificationService } from '@/lib/services/notification.service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // ... código existente de validação e checkout ...

    // Criar enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        enrolledAt: new Date(),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
            instructor: { select: { name: true, email: true } },
          },
        },
      },
    });

    // 🔔 NOTIFICAÇÕES
    await Promise.all([
      // 1. Notificar aluno
      NotificationService.createNotification({
        userId: session.user.id,
        type: 'COURSE_PURCHASED',
        title: 'Curso comprado com sucesso!',
        message: `Bem-vindo ao curso "${enrollment.course.title}". Você pode começar as aulas agora!`,
        actionUrl: `/courses/${course.id}`,
        data: {
          courseId: course.id,
          courseName: enrollment.course.title,
        },
        sendEmail: true,
      }),

      // 2. Notificar professor
      NotificationService.createNotification({
        userId: enrollment.course.instructorId,
        type: 'NEW_ENROLLMENT',
        title: 'Novo aluno inscrito',
        message: `${session.user.name || session.user.email} se inscreveu em "${
          enrollment.course.title
        }"`,
        actionUrl: `/teacher/courses/${course.id}`,
        data: {
          courseId: course.id,
          studentId: session.user.id,
          studentName: session.user.name,
        },
        sendEmail: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      enrollment,
      message: 'Inscrição realizada com sucesso!',
    });
  } catch (error) {
    console.error('[Checkout] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar compra' },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Próximos Passos

1. **Executar migration do banco**

   ```bash
   npx prisma migrate dev --name add_notification_system
   ```

2. **Implementar integrações** nos 5 endpoints principais (2-3 horas)

3. **Adicionar NotificationBell** no layout (30 min)

4. **Testar completamente** (1-2 horas)

5. **Deploy** 🚀

---

**Total de tempo: 5-6 horas para implementação e testes completos**
