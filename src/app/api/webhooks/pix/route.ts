import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Ajuste conforme provedor (Stripe/Outro). Este é um placeholder de webhook Pix.
const pixWebhookSchema = z.object({
  sessionId: z.string(),
  status: z.enum(['paid', 'failed', 'expired']),
  amount: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = pixWebhookSchema.safeParse(body);
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
      await prisma.payment.create({
        data: {
          userId: session.userId,
          courseId: session.courseId,
          amount,
          status: 'COMPLETED',
          paymentMethod: 'pix',
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
    console.error('[Webhook PIX]', error);
    return NextResponse.json({ error: 'Erro no webhook PIX' }, { status: 500 });
  }
}
