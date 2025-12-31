import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import {
  processStudentMessage,
  logAIInteraction,
} from '@/lib/services/ai.service';

/**
 * Schema de validação para mensagens do Chat IA
 */
const MessageSchema = z.object({
  message: z.string().min(1, 'Mensagem não pode estar vazia').max(2000),
  enrolledCourses: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
      })
    )
    .optional(),
});

/**
 * POST /api/student/ai-chat/message
 * Processa mensagens do Chat IA com validação de matrícula
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Validar autenticação
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Validar body
    const body = await request.json();
    const validation = MessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { message, enrolledCourses = [] } = validation.data;

    // Verificar acesso à feature
    const hasFeatureAccess = await checkFeatureAccess(
      session.user.id,
      session.user.role as 'STUDENT' | 'TEACHER'
    );

    if (!hasFeatureAccess) {
      return NextResponse.json(
        { error: 'Você não tem acesso ao Chat IA' },
        { status: 403 }
      );
    }

    // Processar mensagem usando o service layer
    const response = await processStudentMessage(session.user.id, message);

    // Registrar interação (para analytics)
    const courseIds = enrolledCourses.map((c) => c.id);
    await logAIInteraction(session.user.id, message, response, courseIds);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erro ao processar mensagem do Chat IA:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}

/**
 * Verifica se usuário tem acesso à feature 'ai-assistant'
 */
async function checkFeatureAccess(
  userId: string,
  role: 'STUDENT' | 'TEACHER'
): Promise<boolean> {
  if (role === 'TEACHER') return true; // Teachers sempre têm acesso

  // Para estudantes, verificar FeaturePurchase ou StudentSubscription
  const [featurePurchase, subscription] = await Promise.all([
    prisma.featurePurchase.findUnique({
      where: {
        userId_featureId: {
          userId,
          featureId: 'ai-assistant',
        },
      },
    }),
    prisma.studentSubscription.findUnique({
      where: { userId },
    }),
  ]);

  const hasFeatureFromPurchase =
    featurePurchase && featurePurchase.status === 'active';

  const hasFeatureFromSubscription =
    subscription &&
    subscription.status === 'active' &&
    (subscription.plan === 'basic' || subscription.plan === 'premium');

  return hasFeatureFromPurchase || hasFeatureFromSubscription;
}
