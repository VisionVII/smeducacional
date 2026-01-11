import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';
import { Resend } from 'resend';

// Lazy init do Resend para não quebrar o build quando a API key não existe
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
  sendEmail?: boolean;
}

interface NotificationEmailData {
  recipientEmail: string;
  recipientName: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  userRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

// Mock sendEmail - será implementado com Resend
async function sendEmail(input: SendEmailInput) {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        '[SendEmail] RESEND_API_KEY não configurada; pulando envio de email'
      );
      return { skipped: true } as any;
    }
    const response = await resend.emails.send({
      from: 'noreply@sm-educa.com',
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    return response;
  } catch (error) {
    console.error('[SendEmail] Erro:', error);
    throw error;
  }
}

export class NotificationService {
  /**
   * Criar notificação
   */
  static async createNotification(input: CreateNotificationInput) {
    const {
      userId,
      type,
      title,
      message,
      actionUrl,
      data,
      sendEmail: shouldSendEmail,
    } = input;

    // 1. Buscar preferências do usuário
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // 2. Verificar se deve enviar email baseado nas preferências
    const willSendEmail =
      shouldSendEmail !== false && preferences
        ? this.shouldSendEmail(type, preferences)
        : false;

    // 3. Criar notificação
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl,
        data: data ? JSON.parse(JSON.stringify(data)) : null,
      },
    });

    // 4. Enviar email se apropriado
    if (willSendEmail) {
      try {
        await this.sendNotificationEmail(userId, {
          type,
          title,
          message,
          actionUrl,
        });
      } catch (error) {
        console.error(`[NotificationService] Erro ao enviar email:`, error);
      }
    }

    // 5. Log para auditoria
    await this.logNotification(userId, type, 'CREATED', {
      notificationId: notification.id,
      title,
      actionUrl,
    });

    return notification;
  }

  /**
   * Criar notificação para múltiplos usuários
   */
  static async broadcastNotification(
    input: Omit<CreateNotificationInput, 'userId'>,
    userIds: string[]
  ) {
    const results = await Promise.all(
      userIds.map((userId) =>
        this.createNotification({
          ...input,
          userId,
          sendEmail: input.sendEmail,
        }).catch((error) => {
          console.error(
            `[NotificationService] Erro ao notificar usuário ${userId}:`,
            error
          );
          return null;
        })
      )
    );

    return results.filter((r) => r !== null);
  }

  /**
   * Buscar notificações do usuário
   */
  static async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      isRead?: boolean;
      type?: NotificationType;
    }
  ) {
    const { limit = 20, offset = 0, isRead, type } = options || {};

    const where: { userId: string; isRead?: boolean; type?: NotificationType } =
      { userId };
    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Contar notificações não lidas
   */
  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notificação não encontrada');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    await this.logNotification(userId, notification.type, 'READ', {
      notificationId,
    });

    return updated;
  }

  /**
   * Marcar todas as notificações como lidas
   */
  static async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result;
  }

  /**
   * Arquivar notificação (soft delete via data)
   */
  static async archiveNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notificação não encontrada');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        // Marcar como archived via data JSON
        data: {
          ...(typeof notification.data === 'object' &&
          notification.data !== null
            ? notification.data
            : {}),
          archived: true,
          archivedAt: new Date().toISOString(),
        },
      },
    });

    await this.logNotification(userId, notification.type, 'ARCHIVED', {
      notificationId,
    });

    return updated;
  }

  /**
   * Deletar notificação
   */
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notificação não encontrada');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    await this.logNotification(userId, notification.type, 'DELETED', {
      notificationId,
    });
  }

  /**
   * Atualizar preferências de notificação
   */
  static async updatePreferences(
    userId: string,
    preferences: Partial<Record<string, unknown>>
  ) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...preferences,
      },
      update: preferences,
    });
  }

  /**
   * Verificar se está em horário silencioso
   */
  static isInQuietHours(preference: Record<string, unknown>): boolean {
    if (!preference.quietHoursEnabled) return false;

    const now = new Date();
    const userTimezone = (preference.quietHoursTimezone as string) || 'UTC';

    // Obter hora atual no timezone do usuário
    const userTime = new Date(
      now.toLocaleString('en-US', { timeZone: userTimezone })
    );
    const currentHour = userTime.getHours().toString().padStart(2, '0');
    const currentMinute = userTime.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    const startTime = preference.quietHoursStart as string;
    const endTime = preference.quietHoursEnd as string;

    if (startTime < endTime) {
      // Horário normal (ex: 22:00 a 23:59)
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Atravessa meia-noite (ex: 22:00 a 07:00)
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * Decidir se deve enviar email baseado nas preferências
   */
  private static shouldSendEmail(
    type: NotificationType,
    preferences: Record<string, unknown>
  ): boolean {
    if (!preferences) return false;
    if (preferences.quietHoursEnabled && this.isInQuietHours(preferences)) {
      return false;
    }

    // Admin notifications
    if (
      type === NotificationType.SECURITY_ALERT &&
      preferences.emailSecurityAlerts
    )
      return true;
    if (
      type === NotificationType.USER_REPORTED &&
      preferences.emailSecurityAlerts
    )
      return true;
    if (
      type === NotificationType.PAYMENT_ISSUE &&
      preferences.emailSecurityAlerts
    )
      return true;

    // Teacher notifications
    if (
      type === NotificationType.NEW_ENROLLMENT &&
      preferences.emailEnrollments
    )
      return true;
    if (type === NotificationType.COURSE_REVIEW && preferences.emailReviews)
      return true;
    if (type === NotificationType.PAYOUT_READY && preferences.emailPayments)
      return true;
    if (
      type === NotificationType.LESSON_COMPLETED_BY_STUDENT &&
      preferences.emailReviews
    )
      return true;

    // Student notifications
    if (
      type === NotificationType.COURSE_PURCHASED &&
      preferences.emailCourseUpdates
    )
      return true;
    if (
      type === NotificationType.COURSE_UPDATE &&
      preferences.emailCourseUpdates
    )
      return true;
    if (
      type === NotificationType.LESSON_AVAILABLE &&
      preferences.emailCourseUpdates
    )
      return true;
    if (
      type === NotificationType.REMINDER_INCOMPLETE_COURSE &&
      preferences.emailReminders
    )
      return true;
    if (
      type === NotificationType.CERTIFICATE_EARNED &&
      preferences.emailCourseUpdates
    )
      return true;

    return false;
  }

  /**
   * Enviar email de notificação
   */
  private static async sendNotificationEmail(
    userId: string,
    emailData: Omit<
      NotificationEmailData,
      'recipientEmail' | 'recipientName' | 'userRole'
    >
  ) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      throw new Error('Usuário não encontrado ou sem email');
    }

    const emailContent = this.buildEmailContent({
      ...emailData,
      recipientEmail: user.email,
      recipientName: user.name || user.email,
      userRole: user.role as 'ADMIN' | 'TEACHER' | 'STUDENT',
    });

    await sendEmail({
      to: user.email,
      subject: emailData.title,
      html: emailContent,
    });
  }

  /**
   * Construir conteúdo do email
   */
  private static buildEmailContent(data: NotificationEmailData): string {
    const { title, message, actionUrl, recipientName } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { margin: 0; color: #0066cc; font-size: 24px; }
    .content { margin: 20px 0; line-height: 1.6; }
    .action-button { display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
    .footer { border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    
    <p>Olá <strong>${recipientName}</strong>,</p>
    
    <div class="content">
      ${message.replace(/\n/g, '<br>')}
    </div>
    
    ${
      actionUrl
        ? `
      <p style="text-align: center;">
        <a href="${actionUrl}" class="action-button">Ver Detalhes</a>
      </p>
    `
        : ''
    }
    
    <div class="footer">
      <p>
        Você está recebendo este email porque é um usuário ativo no SM Educa.
        <br>
        <a href="https://sm-educa.com/preferences" style="color: #0066cc;">Gerenciar preferências de notificação</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Log para auditoria
   */
  private static async logNotification(
    userId: string,
    type: NotificationType,
    action: string,
    details?: Record<string, unknown>
  ) {
    try {
      await prisma.notificationLog.create({
        data: {
          userId,
          type,
          action,
          details: details ? JSON.parse(JSON.stringify(details)) : null,
        },
      });
    } catch (error) {
      console.error('[NotificationService] Erro ao fazer log:', error);
    }
  }
}
