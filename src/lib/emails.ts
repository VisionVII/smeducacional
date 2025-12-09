import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

function getResendClient() {
  if (!resendClient) {
    console.warn('RESEND_API_KEY não configurada; email não será enviado.');
    return null;
  }

  return resendClient;
}

/**
 * Email de sucesso de pagamento
 */
export async function sendPaymentSuccessEmail({
  email,
  name,
  courseTitle,
  amount,
  invoiceNumber,
}: {
  email: string;
  name: string;
  courseTitle?: string;
  amount: number;
  invoiceNumber: string;
}) {
  try {
    const subject = courseTitle
      ? `Pagamento Confirmado - ${courseTitle}`
      : 'Pagamento Confirmado!';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
          .content { padding: 20px 0; }
          .success { color: #28a745; font-size: 18px; font-weight: bold; }
          .details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMEducacional</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p class="success">✓ Seu pagamento foi processado com sucesso!</p>
            
            <div class="details">
              <div class="detail-row">
                <span>Descrição:</span>
                <strong>${courseTitle || 'Compra de curso'}</strong>
              </div>
              <div class="detail-row">
                <span>Valor:</span>
                <strong>R$ ${amount.toFixed(2)}</strong>
              </div>
              <div class="detail-row">
                <span>Número da Fatura:</span>
                <strong>${invoiceNumber}</strong>
              </div>
            </div>

            <p>Você agora tem acesso completo ao conteúdo! Comece a aprender agora.</p>

            <center>
              <a href="${
                process.env.NEXT_PUBLIC_URL
              }/student/dashboard" class="button">Acessar Plataforma</a>
            </center>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Se tiver dúvidas, entre em contato conosco em suporte@smeducacional.com
            </p>
          </div>
          <div class="footer">
            <p>© 2025 SMEducacional. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resend = getResendClient();
    if (!resend) return { skipped: true };

    const response = await resend.emails.send({
      from: 'SMEducacional <noreply@smeducacional.com>',
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`✉️ Email de sucesso enviado para ${email}`);
    return response;
  } catch (error) {
    console.error('Erro ao enviar email de sucesso:', error);
    throw error;
  }
}

/**
 * Email de fatura pendente / Remarketing
 */
export async function sendPendingInvoiceEmail({
  email,
  name,
  invoiceNumber,
  amount,
  dueDate,
  courseTitle,
}: {
  email: string;
  name: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  courseTitle: string;
}) {
  try {
    const dueDateFormatted = new Intl.DateTimeFormat('pt-BR').format(dueDate);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #ffc107; padding-bottom: 20px; }
          .alert { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMEducacional</h1>
          </div>
          <div class="alert">
            ⚠️ <strong>Fatura Pendente de Pagamento</strong>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>Identificamos que você possui uma fatura pendente de pagamento em nossa plataforma.</p>

            <div class="details">
              <div class="detail-row">
                <span>Curso/Serviço:</span>
                <strong>${courseTitle}</strong>
              </div>
              <div class="detail-row">
                <span>Número da Fatura:</span>
                <strong>${invoiceNumber}</strong>
              </div>
              <div class="detail-row">
                <span>Valor Devido:</span>
                <strong style="color: #d32f2f;">R$ ${amount.toFixed(2)}</strong>
              </div>
              <div class="detail-row">
                <span>Vencimento:</span>
                <strong>${dueDateFormatted}</strong>
              </div>
            </div>

            <p><strong>Por que recebeu este email?</strong></p>
            <p>Esta é uma fatura automática de cobrança. Completen o pagamento para manter seu acesso à plataforma.</p>

            <center>
              <a href="${
                process.env.NEXT_PUBLIC_URL
              }/student/invoices" class="button">Pagar Agora</a>
            </center>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>Precisa de ajuda?</strong> Entre em contato com nosso suporte: suporte@smeducacional.com
            </p>
          </div>
          <div class="footer">
            <p>© 2025 SMEducacional. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resend = getResendClient();
    if (!resend) return { skipped: true };

    const response = await resend.emails.send({
      from: 'SMEducacional <noreply@smeducacional.com>',
      to: email,
      subject: `⚠️ Fatura Pendente: ${invoiceNumber} - R$ ${amount.toFixed(2)}`,
      html: htmlContent,
    });

    console.log(`✉️ Email de fatura pendente enviado para ${email}`);
    return response;
  } catch (error) {
    console.error('Erro ao enviar email de fatura pendente:', error);
    throw error;
  }
}

/**
 * Email de renovação de subscrição
 */
export async function sendSubscriptionRenewalEmail({
  email,
  name,
  plan,
  amount,
  renewalDate,
}: {
  email: string;
  name: string;
  plan: string;
  amount: number;
  renewalDate: Date;
}) {
  try {
    const renewalDateFormatted = new Intl.DateTimeFormat('pt-BR').format(
      renewalDate
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #4caf50; padding-bottom: 20px; }
          .content { padding: 20px 0; }
          .info-box { background: #e8f5e9; border: 1px solid #4caf50; color: #2e7d32; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMEducacional</h1>
          </div>
          <div class="info-box">
            ✓ Sua subscrição será renovada em breve!
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>Gostaríamos de informar que sua subscrição será automaticamente renovada na data abaixo.</p>

            <div class="details">
              <div class="detail-row">
                <span>Plano:</span>
                <strong>${plan.toUpperCase()}</strong>
              </div>
              <div class="detail-row">
                <span>Próxima Renovação:</span>
                <strong>${renewalDateFormatted}</strong>
              </div>
              <div class="detail-row">
                <span>Valor a ser cobrado:</span>
                <strong>R$ ${amount.toFixed(2)}</strong>
              </div>
            </div>

            <p><strong>O que você continua tendo acesso:</strong></p>
            <ul>
              <li>✓ Todos os cursos do plano ${plan}</li>
              <li>✓ Acesso ilimitado aos materiais</li>
              <li>✓ Suporte prioritário</li>
              <li>✓ Certificados digitais</li>
            </ul>

            <center>
              <a href="${
                process.env.NEXT_PUBLIC_URL
              }/student/subscriptions" class="button">Gerenciar Subscrição</a>
            </center>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>Deseja cancelar?</strong> Você pode cancelar sua subscrição a qualquer momento em sua conta.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 SMEducacional. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resend = getResendClient();
    if (!resend) return { skipped: true };

    const response = await resend.emails.send({
      from: 'SMEducacional <noreply@smeducacional.com>',
      to: email,
      subject: `Renovação de Subscrição - ${plan} - ${renewalDateFormatted}`,
      html: htmlContent,
    });

    console.log(`✉️ Email de renovação enviado para ${email}`);
    return response;
  } catch (error) {
    console.error('Erro ao enviar email de renovação:', error);
    throw error;
  }
}

/**
 * Email de pagamento falhado / Recovery
 */
export async function sendPaymentFailedEmail({
  email,
  name,
  invoiceNumber,
  amount,
  reason,
}: {
  email: string;
  name: string;
  invoiceNumber: string;
  amount: number;
  reason: string;
}) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #d32f2f; padding-bottom: 20px; }
          .alert { background: #ffebee; border: 1px solid #d32f2f; color: #b71c1c; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMEducacional</h1>
          </div>
          <div class="alert">
            ✗ <strong>Falha no Processamento de Pagamento</strong>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>Tentamos processar seu pagamento, mas ocorreu um erro. Por favor, tente novamente.</p>

            <div class="details">
              <div class="detail-row">
                <span>Fatura:</span>
                <strong>${invoiceNumber}</strong>
              </div>
              <div class="detail-row">
                <span>Valor:</span>
                <strong>R$ ${amount.toFixed(2)}</strong>
              </div>
              <div class="detail-row">
                <span>Motivo:</span>
                <strong>${reason}</strong>
              </div>
            </div>

            <p><strong>O que fazer agora?</strong></p>
            <ol>
              <li>Verifique se seus dados de cartão estão corretos</li>
              <li>Tente um método de pagamento diferente</li>
              <li>Entre em contato com seu banco</li>
            </ol>

            <center>
              <a href="${
                process.env.NEXT_PUBLIC_URL
              }/student/invoices" class="button">Tentar Novamente</a>
            </center>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>Precisa de ajuda?</strong> Estamos aqui para ajudar: suporte@smeducacional.com
            </p>
          </div>
          <div class="footer">
            <p>© 2025 SMEducacional. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resend = getResendClient();
    if (!resend) return { skipped: true };

    const response = await resend.emails.send({
      from: 'SMEducacional <noreply@smeducacional.com>',
      to: email,
      subject: `❌ Falha no Pagamento: ${invoiceNumber}`,
      html: htmlContent,
    });

    console.log(`✉️ Email de falha enviado para ${email}`);
    return response;
  } catch (error) {
    console.error('Erro ao enviar email de falha:', error);
    throw error;
  }
}

/**
 * Email de boas-vindas para novo usuário
 */
export async function sendWelcomeEmail({
  email,
  name,
  role,
}: {
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}) {
  try {
    const roleText =
      role === 'STUDENT'
        ? 'Aluno'
        : role === 'TEACHER'
        ? 'Professor'
        : 'Administrador';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
          .welcome { background: linear-gradient(135deg, #0066cc 0%, #004499 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
          .features { padding: 20px 0; }
          .feature { margin: 15px 0; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMEducacional</h1>
          </div>
          <div class="welcome">
            <h2>Bem-vindo à SMEducacional!</h2>
            <p>Sua conta de ${roleText} foi criada com sucesso.</p>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>Agradecemos por se juntar à nossa plataforma de educação online!</p>

            <div class="features">
              ${
                role === 'STUDENT'
                  ? `
              <div class="feature">
                <strong>🎓 Para Alunos:</strong>
                <p>Você agora pode acessar todos os cursos disponíveis, acompanhar seu progresso e obter certificados!</p>
              </div>
              `
                  : role === 'TEACHER'
                  ? `
              <div class="feature">
                <strong>👨‍🏫 Para Professores:</strong>
                <p>Você pode criar e gerenciar cursos, acompanhar seus alunos e ganhar com cada inscrição!</p>
              </div>
              `
                  : `
              <div class="feature">
                <strong>⚙️ Para Administradores:</strong>
                <p>Você tem acesso completo ao painel administrativo para gerenciar usuários e conteúdo.</p>
              </div>
              `
              }
            </div>

            <center>
              <a href="${
                process.env.NEXT_PUBLIC_URL
              }/login" class="button">Acessar Plataforma</a>
            </center>
          </div>
          <div class="footer">
            <p>© 2025 SMEducacional. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resend = getResendClient();
    if (!resend) return { skipped: true };

    const response = await resend.emails.send({
      from: 'SMEducacional <noreply@smeducacional.com>',
      to: email,
      subject: `Bem-vindo à SMEducacional, ${name}!`,
      html: htmlContent,
    });

    console.log(`✉️ Email de boas-vindas enviado para ${email}`);
    return response;
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    throw error;
  }
}
