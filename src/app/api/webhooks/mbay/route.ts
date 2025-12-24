import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const mbayWebhookSchema = z.object({
  sessionId: z.string(),
  status: z.enum(['paid', 'failed', 'expired']),
  amount: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = mbayWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const { sessionId, status, amount } = parsed.data;

    const session = await prisma.checkoutSession.findFirst({
      where: { stripeSessionId: sessionId },
    });
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    if (status === 'paid') {
      if (!session.courseId) {
        return NextResponse.json(
          { error: 'CourseId n\u00e3o encontrado na sess\u00e3o' },
          { status: 400 }
        );
      }

      await prisma.payment.create({
        data: {
          userId: session.userId,
          courseId: session.courseId,
          amount,
          status: 'COMPLETED',
          paymentMethod: 'mbway',
          type: 'course',
          currency: 'BRL',
        },
      });
      await prisma.enrollment.create({
        data: {
          studentId: session.userId,
          courseId: session.courseId,
          enrolledAt: new Date(),
        },
      });
      await prisma.checkoutSession.update({
        where: { id: session.id },
        data: { status: 'completed' },
      });
    } else if (status === 'failed' || status === 'expired') {
      await prisma.checkoutSession.update({
        where: { id: session.id },
        data: { status: 'canceled' },
      });
    }

    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    console.error('[Webhook MBAY]', error);
    return NextResponse.json(
      { error: 'Erro no webhook MBAY' },
      { status: 500 }
    );
  }
}
