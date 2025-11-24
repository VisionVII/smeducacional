import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Gerar código aleatório de 6 dígitos
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// HTML do email personalizado
function getEmailHTML(code: string, userName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Recuperação - SM Educacional</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header com gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                SM Educacional
              </h1>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">
                Olá, ${userName}!
              </h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para continuar:
              </p>

              <!-- Código de verificação -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
                <p style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Seu Código de Verificação
                </p>
                <div style="background-color: #ffffff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; display: inline-block;">
                  <p style="margin: 0; color: #1e3a8a; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${code}
                  </p>
                </div>
                <p style="margin: 16px 0 0; color: #6b7280; font-size: 14px;">
                  Este código expira em <strong>15 minutos</strong>
                </p>
              </div>

              <!-- Alerta de segurança -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Importante:</strong> Se você não solicitou esta redefinição de senha, ignore este email. Sua senha permanecerá inalterada.
                </p>
              </div>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Dúvidas? Entre em contato com nosso suporte em 
                <a href="mailto:contato@smeducacional.com.br" style="color: #3b82f6; text-decoration: none;">contato@smeducacional.com.br</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} SM Educacional. Todos os direitos reservados.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                São Paulo, SP - Brasil
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email não encontrado' },
        { status: 404 }
      );
    }

    // Gerar código
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salvar código no banco (você pode criar uma tabela PasswordReset se preferir)
    // Por enquanto, vou usar uma abordagem simples salvando em um campo temporário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Vamos adicionar esses campos no schema depois
        resetCode: code,
        resetCodeExpires: expiresAt,
      },
    });

    // Enviar email
    if (process.env.RESEND_API_KEY) {
      try {
        const result = await resend.emails.send({
          from: 'SM Educacional <onboarding@resend.dev>',
          to: user.email,
          subject: 'Código de Recuperação de Senha - SM Educacional',
          html: getEmailHTML(code, user.name || 'Usuário'),
        });
        
        console.log('Email enviado com sucesso:', result);
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Em desenvolvimento, vamos retornar o código mesmo que o email falhe
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({ 
            message: 'Código gerado (dev mode)',
            code // Apenas em dev
          });
        }
        throw emailError;
      }
    } else {
      // Modo desenvolvimento sem RESEND_API_KEY
      console.log('Código de recuperação:', code);
      return NextResponse.json({ 
        message: 'Código gerado (dev mode - check console)',
        code // Apenas em dev
      });
    }

    return NextResponse.json({ 
      message: 'Código enviado para seu email' 
    });

  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
