/**
 * EmailService.ts
 * Abstrai toda a lógica de envio de e-mails via Resend
 *
 * Implementa o padrão Service definido em system-blueprint.md seção 6
 * Se mudarmos de Resend para outro gateway, mudamos apenas este arquivo
 */

import { Resend } from 'resend';
import { prisma } from '@/lib/db';

const getResendClient = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(key);
};

interface SendEmailInput {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  metadata?: Record<string, string>;
}

interface SendEmailWithLoggingInput extends SendEmailInput {
  userId?: string; // Para rastreamento de auditoria
  emailType?:
    | 'WELCOME'
    | 'RESET_PASSWORD'
    | 'PAYMENT_RECEIPT'
    | 'ENROLLMENT'
    | 'OTHER';
}

export type NotificationLogFailure = {
  id: string;
  emailAddress: string;
  emailType: string;
  status: string;
  error?: string | null;
  sentAt: Date;
};

/**
 * Envia e-mail simples
 */
export async function sendEmail(input: SendEmailInput): Promise<string> {
  // Em desenvolvimento, redirecionar para teste (Mailtrap ou similar)
  if (process.env.NODE_ENV !== 'production') {
    if (process.env.MAILTRAP_EMAIL) {
      console.log(
        '[EmailService] DEV: Redirecionando para',
        process.env.MAILTRAP_EMAIL
      );
      return simulateSendEmail(input);
    }
  }

  try {
    const resend = getResendClient();

    const emailOptions: {
      from: string;
      to: string;
      subject: string;
      html?: string;
      text?: string;
      replyTo?: string;
    } = {
      from: process.env.RESEND_FROM_EMAIL || 'noreply@visionvii.com',
      to: input.to,
      subject: input.subject,
    };

    if (input.html) emailOptions.html = input.html;
    if (input.text) emailOptions.text = input.text;
    if (input.replyTo) emailOptions.replyTo = input.replyTo;

    const response = await resend.emails.send(emailOptions as never);

    if (response.error) {
      throw new Error(`Resend error: ${response.error.message}`);
    }

    console.log('[EmailService] E-mail enviado:', response.data?.id);
    return response.data?.id || '';
  } catch (error) {
    console.error('[EmailService] Erro ao enviar e-mail:', error);
    throw error;
  }
}

/**
 * Envia e-mail com logging de auditoria (para e-mails críticos)
 * Registra em NotificationLogs para rastreamento
 */
export async function sendEmailWithLogging(
  input: SendEmailWithLoggingInput
): Promise<string> {
  const emailId = await sendEmail(input);

  // Log em NotificationLogs se tipo é crítico
  if (
    input.emailType &&
    ['WELCOME', 'RESET_PASSWORD', 'PAYMENT_RECEIPT'].includes(input.emailType)
  ) {
    try {
      await prisma.notificationLog.create({
        data: {
          emailAddress: input.to,
          emailType: input.emailType,
          status: 'SENT',
          resendMessageId: emailId,
          userId: input.userId || null,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error('[EmailService] Erro ao registrar log de e-mail:', error);
      // Não falha o envio se logging falhar
    }
  }

  return emailId;
}

/**
 * E-mail de boas-vindas após enrollment
 * NUNCA incluir senha em texto plano
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  courseTitle: string,
  courseUrl: string,
  userId?: string
): Promise<string> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; }
          .cta { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo ao VisionVII! 🎓</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            <p>Sua matrícula foi confirmada! Você agora tem acesso ao curso:</p>
            <h2>${courseTitle}</h2>
            <p>Clique abaixo para começar:</p>
            <a href="${courseUrl}" class="cta">Acessar Curso</a>
            <p>Se tiver dúvidas, entre em contato com nosso suporte.</p>
          </div>
          <div class="footer">
            <p>© 2025 VisionVII. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailWithLogging({
    to: userEmail,
    subject: `Bem-vindo ao curso: ${courseTitle}`,
    html,
    userId,
    emailType: 'WELCOME',
  });
}

/**
 * E-mail de recuperação de senha
 * Link deve expirar em <= 1 hora (validado no backend)
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetLink: string,
  userId?: string
): Promise<string> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .cta { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Recuperação de Senha</h1>
          <p>Olá <strong>${userName}</strong>,</p>
          <div class="alert">
            <p><strong>⚠️ Atenção:</strong> Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este e-mail.</p>
          </div>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="${resetLink}" class="cta">Redefinir Senha</a>
          <p style="font-size: 12px; color: #999;">Ou copie este link: <code>${resetLink}</code></p>
          <div class="footer">
            <p>© 2025 VisionVII. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailWithLogging({
    to: userEmail,
    subject: 'Recupere sua senha no VisionVII',
    html,
    userId,
    emailType: 'RESET_PASSWORD',
  });
}

/**
 * E-mail de recibo de pagamento
 * NUNCA incluir dados de cartão ou informações sensíveis
 * Usar apenas ID de transação e referência
 */
export async function sendPaymentReceiptEmail(
  userEmail: string,
  userName: string,
  courseName: string,
  transactionId: string,
  amount: number,
  userId?: string
): Promise<string> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .receipt { background: #f9f9f9; border: 1px solid #ddd; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .row.total { font-weight: bold; font-size: 16px; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Recibo de Pagamento ✓</h1>
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Seu pagamento foi confirmado com sucesso!</p>
          <div class="receipt">
            <div class="row">
              <span>Curso:</span>
              <strong>${courseName}</strong>
            </div>
            <div class="row">
              <span>ID da Transação:</span>
              <code>${transactionId}</code>
            </div>
            <div class="row">
              <span>Data:</span>
              <strong>${new Date().toLocaleDateString('pt-BR')}</strong>
            </div>
            <div class="row total">
              <span>Valor Pago:</span>
              <strong>R\$ ${(amount / 100).toFixed(2)}</strong>
            </div>
          </div>
          <p style="font-size: 12px; color: #999;">Para mais informações sobre seu pedido, acesse sua conta.</p>
          <div class="footer">
            <p>© 2025 VisionVII. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailWithLogging({
    to: userEmail,
    subject: `Recibo: ${courseName}`,
    html,
    userId,
    emailType: 'PAYMENT_RECEIPT',
  });
}

/**
 * E-mail de engajamento (notificação de inatividade > 7 dias)
 * Para futuro Cron Job
 */
export async function sendEngagementEmail(
  userEmail: string,
  userName: string,
  courseTitle: string,
  courseUrl: string
): Promise<string> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f0f4ff; padding: 20px; text-align: center; border-radius: 8px; }
          .cta { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Sentimos sua falta! 👋</h2>
          </div>
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Percebemos que você não acessava <strong>${courseTitle}</strong> há alguns dias.</p>
          <p>Vamos lá? Seu aprendizado continua te esperando:</p>
          <a href="${courseUrl}" class="cta">Retomar Curso</a>
          <p style="font-size: 12px; color: #999;">© 2025 VisionVII</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Retome seu aprendizado: ${courseTitle}`,
    html,
  });
}

export async function listFailedNotificationLogs(options?: {
  hours?: number;
  criticalOnly?: boolean;
  limit?: number;
}): Promise<NotificationLogFailure[]> {
  const hours = options?.hours ?? 24;
  const criticalOnly = options?.criticalOnly ?? true;
  const limit = options?.limit ?? 20;

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const failures = await prisma.notificationLog.findMany({
    where: {
      sentAt: { gte: since },
      ...(criticalOnly
        ? { emailType: { in: ['WELCOME', 'RESET_PASSWORD'] } }
        : {}),
      OR: [
        { status: { not: 'SENT' } },
        { status: 'FAILED' },
        { status: 'ERROR' },
      ],
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
    select: {
      id: true,
      emailAddress: true,
      emailType: true,
      status: true,
      error: true,
      sentAt: true,
    },
  });

  return failures;
}

/**
 * Simula envio de e-mail em desenvolvimento (sem realmente enviar)
 */
function simulateSendEmail(input: SendEmailInput): string {
  const mockId = `mock_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  console.log('[EmailService] DEV MODE - E-mail simulado:', {
    id: mockId,
    to: input.to,
    subject: input.subject,
  });
  return mockId;
}
