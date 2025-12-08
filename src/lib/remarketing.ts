import { prisma } from '@/lib/db';
import {
  sendPendingInvoiceEmail,
  sendSubscriptionRenewalEmail,
  sendPaymentFailedEmail,
} from '@/lib/emails';

/**
 * Envia emails de remarketing para faturas vencidas
 * Execute periodicamente (diariamente recomendado)
 */
export async function sendOverdueInvoiceReminders() {
  console.log('📧 Iniciando envio de emails para faturas vencidas...');

  try {
    // Buscar faturas vencidas que ainda não foram pagas
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'overdue',
        dueAt: {
          lte: new Date(), // Venceu há menos de 30 dias
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        payment: {
          select: { courseId: true },
        },
      },
    });

    console.log(`📋 ${overdueInvoices.length} faturas vencidas encontradas`);

    for (const invoice of overdueInvoices) {
      try {
        // Buscar nome do curso se houver
        let courseTitle = 'Seu pedido';
        if (invoice.payment.courseId) {
          const course = await prisma.course.findUnique({
            where: { id: invoice.payment.courseId },
            select: { title: true },
          });
          if (course) courseTitle = course.title;
        }

        // Enviar email
        await sendPendingInvoiceEmail({
          email: invoice.user.email,
          name: invoice.user.name,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          dueDate: invoice.dueAt,
          courseTitle,
        });

        // Log de sucesso
        await prisma.systemLog.create({
          data: {
            level: 'info',
            component: 'email',
            message: `Email de fatura pendente enviado`,
            description: `Fatura ${invoice.invoiceNumber} para ${invoice.user.email}`,
            userId: invoice.user.id,
          },
        });
      } catch (error) {
        console.error(
          `❌ Erro ao enviar email para fatura ${invoice.invoiceNumber}:`,
          error
        );

        await prisma.systemLog.create({
          data: {
            level: 'error',
            component: 'email',
            message: `Falha ao enviar email de fatura pendente`,
            description: `Fatura ${invoice.invoiceNumber}: ${
              error instanceof Error ? error.message : String(error)
            }`,
            userId: invoice.user.id,
          },
        });
      }
    }

    console.log(`✅ Processamento de faturas vencidas concluído`);
  } catch (error) {
    console.error('Erro ao processar faturas vencidas:', error);

    await prisma.systemLog.create({
      data: {
        level: 'error',
        component: 'remarketing',
        message: 'Erro ao processar emails de faturas vencidas',
        description: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Envia lembretes de renovação de subscrição (7 dias antes)
 */
export async function sendSubscriptionRenewalReminders() {
  console.log('📧 Iniciando envio de lembretes de renovação de subscrição...');

  try {
    // Datas: próximos 7-14 dias
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Subscrições de aluno
    const studentSubscriptions = await prisma.studentSubscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          gte: nextWeek,
          lte: twoWeeks,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log(
      `📋 ${studentSubscriptions.length} subscrições de alunos vencendo`
    );

    for (const sub of studentSubscriptions) {
      try {
        await sendSubscriptionRenewalEmail({
          email: sub.user.email,
          name: sub.user.name,
          plan: sub.plan,
          amount: sub.price,
          renewalDate: sub.currentPeriodEnd!,
        });

        await prisma.systemLog.create({
          data: {
            level: 'info',
            component: 'email',
            message: `Email de renovação de subscrição enviado (aluno)`,
            description: `Subscrição ${sub.id} para ${sub.user.email}`,
            userId: sub.user.id,
          },
        });
      } catch (error) {
        console.error(
          `❌ Erro ao enviar email para subscrição ${sub.id}:`,
          error
        );
      }
    }

    // Subscrições de professor
    const teacherSubscriptions = await prisma.teacherSubscription.findMany({
      where: {
        status: 'active',
        renewDate: {
          gte: nextWeek,
          lte: twoWeeks,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log(
      `📋 ${teacherSubscriptions.length} subscrições de professores vencendo`
    );

    for (const sub of teacherSubscriptions) {
      try {
        await sendSubscriptionRenewalEmail({
          email: sub.user.email,
          name: sub.user.name,
          plan: sub.plan,
          amount: sub.price || 0,
          renewalDate: sub.renewDate!,
        });

        await prisma.systemLog.create({
          data: {
            level: 'info',
            component: 'email',
            message: `Email de renovação de subscrição enviado (professor)`,
            description: `Subscrição ${sub.id} para ${sub.user.email}`,
            userId: sub.user.id,
          },
        });
      } catch (error) {
        console.error(
          `❌ Erro ao enviar email para subscrição ${sub.id}:`,
          error
        );
      }
    }

    console.log(`✅ Processamento de renovações concluído`);
  } catch (error) {
    console.error('Erro ao processar renovações:', error);

    await prisma.systemLog.create({
      data: {
        level: 'error',
        component: 'remarketing',
        message: 'Erro ao processar emails de renovação de subscrição',
        description: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Envia lembretes de pagamento falhado (retry)
 */
export async function sendFailedPaymentRetryEmails() {
  console.log('📧 Iniciando envio de lembretes de pagamento falhado...');

  try {
    // Pagamentos falhados nos últimos 7 dias
    const failedPayments = await prisma.payment.findMany({
      where: {
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        invoice: {
          select: { invoiceNumber: true, dueAt: true },
        },
      },
    });

    console.log(`📋 ${failedPayments.length} pagamentos falhados encontrados`);

    for (const payment of failedPayments) {
      if (!payment.invoice) continue;

      try {
        await sendPaymentFailedEmail({
          email: payment.user.email,
          name: payment.user.name,
          invoiceNumber: payment.invoice.invoiceNumber,
          amount: payment.amount,
          reason:
            'Seu cartão foi recusado. Tente novamente com outro método de pagamento.',
        });

        await prisma.systemLog.create({
          data: {
            level: 'info',
            component: 'email',
            message: `Email de pagamento falhado enviado`,
            description: `Pagamento ${payment.id} para ${payment.user.email}`,
            userId: payment.user.id,
          },
        });
      } catch (error) {
        console.error(
          `❌ Erro ao enviar email para pagamento ${payment.id}:`,
          error
        );
      }
    }

    console.log(`✅ Processamento de pagamentos falhados concluído`);
  } catch (error) {
    console.error('Erro ao processar pagamentos falhados:', error);

    await prisma.systemLog.create({
      data: {
        level: 'error',
        component: 'remarketing',
        message: 'Erro ao processar emails de pagamento falhado',
        description: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Executa todos os jobs de remarketing
 */
export async function runAllRemarketingJobs() {
  console.log('🚀 Iniciando suite de remarketing...');
  console.log('═'.repeat(50));

  try {
    await sendOverdueInvoiceReminders();
    console.log('─'.repeat(50));

    await sendSubscriptionRenewalReminders();
    console.log('─'.repeat(50));

    await sendFailedPaymentRetryEmails();

    console.log('═'.repeat(50));
    console.log('✅ Suite de remarketing concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro geral na suite de remarketing:', error);

    await prisma.systemLog.create({
      data: {
        level: 'error',
        component: 'remarketing',
        message: 'Erro crítico na suite de remarketing',
        description: error instanceof Error ? error.message : String(error),
      },
    });
  }
}
