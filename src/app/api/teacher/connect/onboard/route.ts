import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  try {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar ou criar TeacherFinancial
    let teacherFinancial = await prisma.teacherFinancial.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherFinancial) {
      teacherFinancial = await prisma.teacherFinancial.create({
        data: {
          userId: session.user.id,
          bank: '',
          agency: '',
          account: '',
          accountType: 'checking',
        },
      });
    }

    // Já tem conta Connect?
    if (
      teacherFinancial.stripeConnectAccountId &&
      teacherFinancial.connectOnboardingComplete
    ) {
      return NextResponse.json({
        data: {
          accountId: teacherFinancial.stripeConnectAccountId,
          onboardingComplete: true,
        },
      });
    }

    // Criar conta Connect se não existe
    let accountId = teacherFinancial.stripeConnectAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR',
        email: session.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      await prisma.teacherFinancial.update({
        where: { userId: session.user.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    // Criar link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_URL}/teacher/connect/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_URL}/teacher/connect/return`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ data: { url: accountLink.url, accountId } });
  } catch (error) {
    console.error('[API /teacher/connect/onboard]', error);
    return NextResponse.json(
      { error: 'Erro ao criar onboarding Connect' },
      { status: 500 }
    );
  }
}
