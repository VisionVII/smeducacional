import { NextRequest, NextResponse } from 'next/server';
import { NotificationType } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { resend } from '@/lib/resend';
import { z } from 'zod';

const schema = z.object({
  reportId: z.string().uuid(),
  message: z.string().min(5),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }
  const { reportId, message } = result.data;
  const report = await prisma.auditReport.findUnique({
    where: { id: reportId },
    include: { user: true },
  });
  if (!report) {
    return NextResponse.json(
      { error: 'Relatório não encontrado' },
      { status: 404 }
    );
  }

  // Buscar todos os admins
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  const emails = admins.map((a) => a.email).filter(Boolean);

  // Criar notificação interna
  await Promise.all(
    admins.map((admin) =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          type: NotificationType.SYSTEM_MAINTENANCE,
          title: 'Alerta de Segurança: Auditoria Crítica',
          message,
        },
      })
    )
  );

  // Enviar email via Resend
  if (emails.length > 0) {
    await resend.emails.send({
      from: 'noreply@smeducacional.com',
      to: emails,
      subject: 'Alerta de Segurança: Auditoria Crítica',
      html: `<p>${message}</p><p><a href="${process.env.NEXTAUTH_URL}/admin/secureops/history?reportId=${reportId}">Ver relatório</a></p>`,
    });
  }

  return NextResponse.json({ message: 'Notificações enviadas' });
}
