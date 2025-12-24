import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getProvider } from '@/lib/payments';

const schema = z.object({
  courseId: z.string().min(1),
  provider: z.enum(['stripe', 'stripe_pix', 'mbay']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseId, provider } = parsed.data;

    // Buscar curso
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, slug: true, title: true, price: true },
    });
    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }
    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { error: 'Este curso é gratuito' },
        { status: 400 }
      );
    }

    // Evitar checkout duplicado para matriculados
    const already = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.user.id, courseId } },
    });
    if (already) {
      return NextResponse.json(
        { error: 'Você já está matriculado neste curso' },
        { status: 400 }
      );
    }

    const successUrl = `${process.env.NEXT_PUBLIC_URL}/checkout/success?courseId=${courseId}`;
    const cancelUrl = course.slug
      ? `${process.env.NEXT_PUBLIC_URL}/courses/${course.slug}`
      : `${process.env.NEXT_PUBLIC_URL}/courses`;

    const paymentProvider = getProvider(provider);
    const sessionData = await paymentProvider.createSession({
      userId: session.user.id,
      courseId,
      courseTitle: course.title,
      coursePrice: course.price!,
      userEmail: session.user.email,
      successUrl,
      cancelUrl,
    });

    // Persistir sessão
    await prisma.checkoutSession.create({
      data: {
        userId: session.user.id,
        courseId,
        stripeSessionId: sessionData.id, // manter campo para compatibilidade
        url: sessionData.url,
        status: 'pending',
        mode: 'payment',
        amount: course.price!,
      },
    });

    return NextResponse.json({
      sessionId: sessionData.id,
      url: sessionData.url,
    });
  } catch (error) {
    console.error('[API /checkout/session POST]', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    );
  }
}
