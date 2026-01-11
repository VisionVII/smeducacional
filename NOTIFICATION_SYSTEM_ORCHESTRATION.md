# 🔔 Sistema de Notificações VisionVII - Orquestração Completa

**Versão:** VisionVII 3.0 Enterprise Governance  
**Data:** Janeiro 2026  
**Status:** 🟢 Pronto para Implementação  
**Responsável:** Orquestrador Central (ArchitectAI + SecureOpsAI)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Análise de Usuários](#análise-de-usuários)
3. [Tipos de Notificações](#tipos-de-notificações)
4. [Matriz de Notificações](#matriz-de-notificações)
5. [Arquitetura Técnica](#arquitetura-técnica)
6. [Implementação](#implementação)
7. [Segurança](#segurança)

---

## 🎯 Visão Geral

### Objetivos Gerais

✅ **Engajamento:** Manter usuários informados sobre eventos relevantes  
✅ **Retenção:** Lembretes sobre ações importantes (vencimentos, progresso)  
✅ **Conversão:** Notificações de vendas e oportunidades  
✅ **Relacionamento:** Comunicação bidirecional eficaz

### Canais de Entrega

- 📱 **Internas:** Sistema de notificações interno (Bell Icon + Dashboard)
- 📧 **Email:** Resend API (em tempo real + digest)
- 🔔 **Push (Futuro):** Web Push notifications via Service Workers

---

## 👥 Análise de Usuários

### 1️⃣ ADMINISTRADOR

**Objetivo Primário:** Supervisão, auditoria e monitoramento da plataforma

**Necessidades:**

- Alertas de segurança e anomalias
- Relatórios de usuários e receita
- Avisos de manutenção do sistema
- Aprovações de conteúdo
- Monitoramento de compliance

**Exemplo de Email:**

```
To: admin@smeducacional.com
Subject: ⚠️ [URGENTE] Tentativa de acesso suspeito detectada

Olá Administrador,

Detectamos atividade suspeita no sistema:
- IP: 192.168.1.100
- Usuário: professor123
- Hora: 2026-01-05 14:30:22
- Ação: 5 tentativas de login falhadas

Ação recomendada: Revisar logs de segurança no painel.
```

**Frequência de Emails:**

- Alertas críticos: Imediato
- Relatórios diários: 09:00 (segunda-sexta)
- Relatórios semanais: Sexta-feira 16:00

---

### 2️⃣ PROFESSOR / INSTRUTOR

**Objetivo Primário:** Gestão de aulas, relacionamento com alunos e receita

**Necessidades:**

- Novos alunos matriculados no curso
- Mensagens e dúvidas de alunos
- Lembretes de conteúdo pendente
- Avisos de vencimento de subscrição
- Relatórios de receita e análises
- Feedback de alunos (reviews/avaliações)

**Exemplo de Email:**

```
To: professor@smeducacional.com
Subject: 🎉 5 novos alunos no seu curso "JavaScript Avançado"

Olá Professor João,

Excelente notícia! Seus cursos continuam atraindo alunos:

📊 Resumo da Última Semana:
- Novos alunos: 5
- Receita gerada: R$ 125,00
- Total ganho este mês: R$ 1.250,00
- Taxa da plataforma: 5% (R$ 62,50)

🎓 Próximos Alunos:
1. Maria Silva (maria@email.com) - "JavaScript Avançado"
2. João Santos (joao@email.com) - "React Básico"

👉 Acesse seu painel para mais detalhes e interagir com os alunos.
```

**Frequência de Emails:**

- Novo aluno: Imediato (após inscrição)
- Nova mensagem: 30 min (digest se múltiplas)
- Relatório diário: 08:00 (segunda-sexta)
- Lembretes de conteúdo: 2x por semana

---

### 3️⃣ ALUNO / ESTUDANTE

**Objetivo Primário:** Aprendizado, progresso e suporte

**Necessidades:**

- Confirmação de matrícula
- Lembretes de novo conteúdo
- Avisos de prazos (atividades, certificados)
- Recomendações de cursos similares
- Mensagens de professores
- Avisos de pagamento/fatura
- Lembretes de progresso/acompanhamento

**Exemplo de Email:**

```
To: aluno@smeducacional.com
Subject: 🎓 Novo conteúdo disponível: "Introdução ao React"

Olá Maria,

Um novo módulo foi publicado no curso que você está fazendo!

📚 Novo Conteúdo:
Curso: "Desenvolvimento Frontend Completo"
Módulo: "Introdução ao React"
Aulas: 3
Tempo estimado: 45 minutos

🔗 Comece agora: https://smeducacional.com/course/...

Seu progresso atual: 30% ✅

👉 Não perca! Acesse e continue aprendendo.
```

**Frequência de Emails:**

- Confirmação de matrícula: Imediato
- Novo conteúdo: Imediato
- Mensagem de professor: Imediato
- Recomendações: 1x por semana (quinta-feira 19:00)
- Lembretes de progresso: 2x por semana (segunda/quarta 18:00)

---

## 🔔 Tipos de Notificações

### Categorias Principais

#### 1. **AUTHENTICATION** (Autenticação)

- Login de novo dispositivo
- Falha de login (3+ tentativas)
- Alteração de senha
- Reset de 2FA

#### 2. **COURSE** (Cursos)

- Nova matrícula
- Novo módulo publicado
- Novo conteúdo publicado
- Curso arquivado/excluído
- Certificado disponível

#### 3. **ACTIVITY** (Atividades)

- Nova atividade adicionada
- Prazos de atividade se aproximando
- Feedback do professor sobre atividade
- Atividade corrigida

#### 4. **PAYMENT** (Pagamento)

- Pagamento bem-sucedido
- Falha no pagamento
- Fatura pendente
- Reembolso processado
- Subscrição renovada
- Subscrição vencendo (7 dias)

#### 5. **MESSAGE** (Mensagens)

- Nova mensagem recebida
- Resposta a mensagem enviada
- Convite para grupo

#### 6. **FINANCIAL** (Financeiro)

- Nova receita (professor)
- Relatório de ganhos
- Pagamento processado
- Taxa cobrada

#### 7. **SYSTEM** (Sistema)

- Manutenção agendada
- Atualização de segurança
- Alerta de fraude
- Violação de política

#### 8. **CONTENT** (Conteúdo)

- Conteúdo solicitado para revisão (admin)
- Conteúdo aprovado/rejeitado
- Comentário no conteúdo

#### 9. **RECOMMENDATION** (Recomendação)

- Curso recomendado
- Oferta especial
- Conteúdo gratuito disponível

#### 10. **REMINDER** (Lembrete)

- Lembrete de atividade
- Lembrete de progresso
- Lembrete de certificado

---

## 📊 Matriz de Notificações

### ADMINISTRADOR

| Tipo           | Evento                         | Interno | Email | Prioridade | Frequência    |
| -------------- | ------------------------------ | ------- | ----- | ---------- | ------------- |
| SYSTEM         | Acesso suspeito detectado      | ✅      | ✅    | 🔴 CRÍTICA | Imediato      |
| SYSTEM         | Tentativa de fraude            | ✅      | ✅    | 🔴 CRÍTICA | Imediato      |
| SYSTEM         | Erro no servidor               | ✅      | ✅    | 🔴 CRÍTICA | Imediato      |
| SYSTEM         | Manutenção agendada            | ✅      | ✅    | 🟡 ALTA    | 48h antes     |
| CONTENT        | Novo conteúdo para revisar     | ✅      | ✅    | 🟡 ALTA    | Imediato      |
| SYSTEM         | Relatório diário de sistema    | ✅      | ✅    | 🟢 MÉDIA   | 09:00 daily   |
| SYSTEM         | Relatório semanal de usuários  | ✅      | ✅    | 🟢 MÉDIA   | Sexta 16:00   |
| FINANCIAL      | Total de receita da plataforma | ✅      | ✅    | 🟢 MÉDIA   | Seg-sex 09:00 |
| SYSTEM         | Violação de política detectada | ✅      | ✅    | 🔴 CRÍTICA | Imediato      |
| AUTHENTICATION | Login admin realizado          | ✅      | ❌    | 🔵 BAIXA   | N/A           |

### PROFESSOR / INSTRUTOR

| Tipo           | Evento                              | Interno | Email | Prioridade | Frequência     |
| -------------- | ----------------------------------- | ------- | ----- | ---------- | -------------- |
| COURSE         | Novo aluno matriculado              | ✅      | ✅    | 🟡 ALTA    | Imediato       |
| MESSAGE        | Nova mensagem de aluno              | ✅      | ✅    | 🟡 ALTA    | 30min (digest) |
| ACTIVITY       | Nova dúvida em atividade            | ✅      | ✅    | 🟡 ALTA    | Imediato       |
| COURSE         | Novo módulo pode ser publicado      | ✅      | ✅    | 🟢 MÉDIA   | Imediato       |
| PAYMENT        | Subscrição vencendo em 7 dias       | ✅      | ✅    | 🟡 ALTA    | 7 dias antes   |
| FINANCIAL      | Receita recebida                    | ✅      | ✅    | 🟡 ALTA    | Imediato       |
| FINANCIAL      | Relatório de ganhos                 | ✅      | ✅    | 🟢 MÉDIA   | Seg-sex 08:00  |
| CONTENT        | Feedback do aluno (review)          | ✅      | ✅    | 🟢 MÉDIA   | Imediato       |
| COURSE         | Certificado disponível para emissão | ✅      | ✅    | 🟢 MÉDIA   | Imediato       |
| RECOMMENDATION | Oportunidade de parceria            | ✅      | ✅    | 🟢 MÉDIA   | 1x por mês     |

### ALUNO / ESTUDANTE

| Tipo           | Evento                            | Interno | Email | Prioridade | Frequência             |
| -------------- | --------------------------------- | ------- | ----- | ---------- | ---------------------- |
| COURSE         | Confirmação de matrícula          | ✅      | ✅    | 🟡 ALTA    | Imediato               |
| COURSE         | Novo conteúdo disponível          | ✅      | ✅    | 🟡 ALTA    | Imediato               |
| MESSAGE        | Mensagem do professor             | ✅      | ✅    | 🟡 ALTA    | Imediato               |
| ACTIVITY       | Nova atividade adicionada         | ✅      | ✅    | 🟡 ALTA    | Imediato               |
| ACTIVITY       | Prazo da atividade se aproximando | ✅      | ✅    | 🟡 ALTA    | 24h antes              |
| ACTIVITY       | Atividade corrigida/feedback      | ✅      | ✅    | 🟡 ALTA    | Imediato               |
| PAYMENT        | Confirmação de pagamento          | ✅      | ✅    | 🟡 ALTA    | Imediato               |
| PAYMENT        | Fatura pendente                   | ✅      | ✅    | 🟡 ALTA    | 3 dias antes           |
| COURSE         | Certificado disponível            | ✅      | ✅    | 🟡 ALTA    | Imediato               |
| REMINDER       | Lembrete de progresso             | ✅      | ✅    | 🟢 MÉDIA   | 2x/sem (seg/qua 18:00) |
| RECOMMENDATION | Cursos recomendados               | ✅      | ✅    | 🟢 MÉDIA   | 1x/sem (quinta 19:00)  |
| SYSTEM         | Manutenção agendada               | ✅      | ✅    | 🟢 MÉDIA   | 48h antes              |
| AUTHENTICATION | Login de novo dispositivo         | ✅      | ✅    | 🟢 MÉDIA   | Imediato               |

---

## 🏗️ Arquitetura Técnica

### Schema Prisma (Novo Modelo)

```prisma
model Notification {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Tipo e Conteúdo
  type          NotificationType  // AUTHENTICATION, COURSE, ACTIVITY, PAYMENT, MESSAGE, FINANCIAL, SYSTEM, CONTENT, RECOMMENDATION, REMINDER
  title         String
  message       String
  description   String?
  icon          String?            // lucide-react icon name
  color         String?            // tailwind color: red, blue, green, etc

  // Links e Metadados
  actionUrl     String?            // Link para ação: /course/123, /payment/456
  metadata      Json?              // Dados adicionais: courseId, amount, etc

  // Status
  isRead        Boolean   @default(false)
  readAt        DateTime?
  isDeleted     Boolean   @default(false)

  // Preferências de Entrega
  sendEmail     Boolean   @default(true)
  emailSent     Boolean   @default(false)
  emailSentAt   DateTime?
  emailError    String?

  // Timestamps
  scheduledFor  DateTime?          // Para notificações agendadas
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId, isRead, createdAt])
  @@index([type, createdAt])
}

model NotificationPreference {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Por tipo
  authentication Boolean @default(true)
  course        Boolean @default(true)
  activity      Boolean @default(true)
  payment       Boolean @default(true)
  message       Boolean @default(true)
  financial     Boolean @default(true)
  system        Boolean @default(true)
  content       Boolean @default(true)
  recommendation Boolean @default(false)  // Desativado por padrão
  reminder      Boolean @default(true)

  // Frequência de Email
  emailFrequency String @default("IMMEDIATE")  // IMMEDIATE, DIGEST_DAILY, DIGEST_WEEKLY, NEVER

  // Horários
  quietHoursStart String @default("22:00")    // Formato HH:mm
  quietHoursEnd   String @default("08:00")
  quietHoursEnabled Boolean @default(false)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model NotificationLog {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type          NotificationType
  status        String    // SENT, FAILED, PENDING, SCHEDULED
  channel       String    // EMAIL, INTERNAL, PUSH

  provider      String?   // resend, sendgrid, etc
  externalId    String?   // ID do email/mensagem no provider

  error         String?

  createdAt     DateTime  @default(now())

  @@index([userId, type, createdAt])
  @@index([status, createdAt])
}

enum NotificationType {
  AUTHENTICATION
  COURSE
  ACTIVITY
  PAYMENT
  MESSAGE
  FINANCIAL
  SYSTEM
  CONTENT
  RECOMMENDATION
  REMINDER
}
```

### Serviço de Notificações

**Arquivo:** `src/lib/services/notification.service.ts`

```typescript
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/emails';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  description?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  icon?: string;
  color?: string;
  sendEmail?: boolean;
  scheduledFor?: Date;
}

export class NotificationService {
  /**
   * Criar e enviar notificação
   */
  static async createNotification(params: CreateNotificationParams) {
    // 1️⃣ Validar preferências do usuário
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: params.userId },
    });

    const isTypeEnabled = preferences?.[params.type.toLowerCase()] ?? true;

    if (!isTypeEnabled) {
      console.log(
        `Notificação ${params.type} desativada para usuário ${params.userId}`
      );
      return null;
    }

    // 2️⃣ Criar notificação interna
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        description: params.description,
        actionUrl: params.actionUrl,
        metadata: params.metadata,
        icon: params.icon,
        color: params.color,
        sendEmail: params.sendEmail ?? true,
        scheduledFor: params.scheduledFor,
      },
    });

    // 3️⃣ Enviar email se habilitado
    if (params.sendEmail !== false && !params.scheduledFor) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: params.userId },
        });

        if (user?.email) {
          // Aguardar preferências de quiet hours
          const shouldQuiet = this.isInQuietHours(preferences);

          if (!shouldQuiet) {
            await sendNotificationEmail({
              email: user.email,
              name: user.name,
              title: params.title,
              message: params.message,
              description: params.description,
              actionUrl: params.actionUrl,
              type: params.type,
            });

            await prisma.notification.update({
              where: { id: notification.id },
              data: {
                emailSent: true,
                emailSentAt: new Date(),
              },
            });
          }
        }
      } catch (error) {
        console.error(
          `Erro ao enviar email para notificação ${notification.id}:`,
          error
        );

        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            emailError: (error as Error).message,
          },
        });
      }
    }

    return notification;
  }

  /**
   * Criar notificação para vários usuários
   */
  static async broadcastNotification(
    userIds: string[],
    params: Omit<CreateNotificationParams, 'userId'>
  ) {
    return Promise.all(
      userIds.map((userId) => this.createNotification({ ...params, userId }))
    );
  }

  /**
   * Verificar se está em horário silencioso
   */
  private static isInQuietHours(preferences: any): boolean {
    if (!preferences?.quietHoursEnabled) return false;

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMin}`;

    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    // Se fim < início (ex: 22:00 a 08:00), cruza meia-noite
    if (end < start) {
      return currentTime >= start || currentTime < end;
    }

    return currentTime >= start && currentTime < end;
  }

  /**
   * Buscar notificações do usuário
   */
  static async getUserNotifications(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Marcar como lida
   */
  static async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Deletar notificação
   */
  static async deleteNotification(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isDeleted: true },
    });
  }

  /**
   * Atualizar preferências
   */
  static async updatePreferences(userId: string, data: any) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
```

---

## 🔧 Implementação

### Fase 1: Schema e Serviço (2-3h)

```bash
# 1. Atualizar Prisma
npx prisma migrate dev --name add_notification_system

# 2. Criar NotificationService
# Arquivo: src/lib/services/notification.service.ts

# 3. Adicionar funções de email
# Arquivo: src/lib/emails.ts - adicionar sendNotificationEmail()
```

### Fase 2: APIs REST (2-3h)

**GET** `/api/notifications` - Listar notificações  
**PATCH** `/api/notifications/[id]/read` - Marcar como lida  
**DELETE** `/api/notifications/[id]` - Deletar  
**GET** `/api/notifications/preferences` - Obter preferências  
**POST** `/api/notifications/preferences` - Atualizar preferências

### Fase 3: UI Components (2h)

- Bell Icon com contador
- Dropdown de notificações
- Página de histórico
- Modal de preferências

### Fase 4: Triggers (3-4h)

Integrar NotificationService em:

- ✅ `/api/courses/[id]/enroll` - Nova matrícula
- ✅ `/api/messages` - Nova mensagem
- ✅ `/api/activities` - Nova atividade
- `/api/modules/[id]` - Novo conteúdo
- `/api/checkout` - Confirmação de pagamento
- `/api/admin/users` - Criação de usuário

---

## 🔐 Segurança

### Red Lines (Nunca Negociáveis)

```typescript
❌ Enviar senha em notificações
❌ Logar email de usuário em notificações
❌ Permitir notificações não solicitadas sem consentimento
❌ Usar notificações para phishing
❌ Enviar dados sensíveis em emails
✅ Validar userId antes de criar
✅ Respeitar preferências do usuário
✅ Hash de tokens sensíveis
✅ Logs de auditoria em NotificationLog
```

### Validação

```typescript
// Em cada endpoint que cria notificação:
const validated = notificationSchema.safeParse(data);
if (!validated.success) {
  return 400 "Validação falhou";
}

// Garantir ownership
const user = await auth();
if (!user) return 401;
```

### Rate Limiting

```typescript
// Máximo 100 notificações por usuário por hora
const recentCount = await prisma.notification.count({
  where: {
    userId,
    createdAt: { gte: new Date(Date.now() - 3600000) },
  },
});

if (recentCount >= 100) {
  return 429 "Too many notifications";
}
```

---

## 📧 Templates de Email

### Template: Nova Matrícula (Professor)

```html
<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
  <div
    style="background: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6;"
  >
    <h1 style="color: #1e40af; margin: 0;">🎉 Novo Aluno Matriculado!</h1>
  </div>

  <div style="padding: 20px; background: white;">
    <p>Olá <strong>Professor</strong>,</p>

    <p>Um novo aluno se matriculou em um dos seus cursos!</p>

    <div
      style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;"
    >
      <p><strong>📚 Curso:</strong> JavaScript Avançado</p>
      <p><strong>👤 Aluno:</strong> Maria Silva (maria@email.com)</p>
      <p><strong>📅 Data:</strong> 05 de janeiro de 2026</p>
      <p><strong>💰 Receita:</strong> R$ 25,00 (5% da plataforma)</p>
    </div>

    <p>
      <a
        href="https://smeducacional.com/dashboard/students/maria-silva"
        style="background: #3b82f6; color: white; padding: 10px 20px; 
                text-decoration: none; border-radius: 5px; display: inline-block;"
      >
        Ver Perfil do Aluno
      </a>
    </p>
  </div>

  <div
    style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;"
  >
    <p>
      Você recebeu esse email porque tem notificações habilitadas para novas
      matrículas.
    </p>
    <a href="https://smeducacional.com/settings/notifications"
      >Gerenciar Preferências</a
    >
  </div>
</div>
```

### Template: Confirmação de Matrícula (Aluno)

```html
<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
  <div
    style="background: #f0fdf4; padding: 20px; border-left: 4px solid #22c55e;"
  >
    <h1 style="color: #15803d; margin: 0;">
      ✅ Parabéns! Matrícula Confirmada
    </h1>
  </div>

  <div style="padding: 20px; background: white;">
    <p>Olá <strong>Maria</strong>,</p>

    <p>Sua matrícula foi confirmada com sucesso! 🎓</p>

    <div
      style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;"
    >
      <p><strong>📚 Curso:</strong> Desenvolvimento Frontend Completo</p>
      <p><strong>👨‍🏫 Instrutor:</strong> Professor João Silva</p>
      <p><strong>⏱️ Duração:</strong> 20 horas</p>
      <p><strong>📊 Módulos:</strong> 4 (com 12 aulas)</p>
      <p><strong>💰 Valor Pago:</strong> R$ 100,00</p>
    </div>

    <p>
      <a
        href="https://smeducacional.com/course/desenvolvimento-frontend"
        style="background: #22c55e; color: white; padding: 10px 20px; 
                text-decoration: none; border-radius: 5px; display: inline-block;"
      >
        Começar Curso Agora
      </a>
    </p>

    <p>Você receberá notificações quando novo conteúdo for adicionado.</p>
  </div>
</div>
```

---

## 📊 Relatórios e Métricas

### Dashboard de Notificações (Admin)

```
📊 Métricas de Notificação (Últimos 7 dias)

Total Enviadas:        1.450
├─ Entregues:         1.420 (97.9%)
├─ Falhas:              30 (2.1%)
└─ Bounces:              0 (0%)

Por Tipo:
├─ COURSE:             420 (29%)
├─ MESSAGE:            320 (22%)
├─ PAYMENT:            250 (17%)
├─ ACTIVITY:           200 (14%)
├─ REMINDER:           150 (10%)
└─ Outros:              60 (8%)

Taxa de Abertura: 45% (média do setor: 25%)
Taxa de Clique:   18% (média do setor: 12%)

⚠️ Alertas:
- 3 usuários com email inválido
- 5 usuários com unsubscribe request
- 1 spam report (verificar conteúdo)
```

---

## ✅ Checklist de Implementação

### Fase 1: Schema & Serviço

- [ ] Criar migration do Prisma
- [ ] Implementar NotificationService
- [ ] Adicionar envio de email
- [ ] Criar seed de preferências

### Fase 2: APIs

- [ ] GET `/api/notifications`
- [ ] PATCH `/api/notifications/[id]/read`
- [ ] DELETE `/api/notifications/[id]`
- [ ] GET/POST `/api/notifications/preferences`

### Fase 3: UI

- [ ] Bell Icon com contador
- [ ] Dropdown de notificações
- [ ] Página de histórico
- [ ] Modal de preferências

### Fase 4: Triggers

- [ ] Curso: Nova matrícula
- [ ] Mensagens: Nova mensagem
- [ ] Atividades: Nova atividade
- [ ] Pagamentos: Confirmação
- [ ] Admin: Alertas de segurança

### Fase 5: Testes

- [ ] Testes unitários do serviço
- [ ] Testes de email
- [ ] Testes de preferências
- [ ] Teste completo end-to-end

---

## 🚀 Próximos Passos

1. **Imediato:** Implementar Schema + NotificationService
2. **24h:** APIs REST
3. **48h:** UI Components
4. **72h:** Triggers em APIs existentes
5. **96h:** Testes completos

---

**Versão:** VisionVII 3.0 Enterprise Governance | Janeiro 2026
"Desenvolvido com excelência pela VisionVII — Inovação e Transformação Digital."
