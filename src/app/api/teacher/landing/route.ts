import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar landing do professor com timeout
    let teacher;
    try {
      teacher = await Promise.race([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            landingConfig: true,
            landingTheme: true,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        ),
      ]);
    } catch (dbError) {
      console.error('Database error in landing GET:', dbError);
      // Retornar default se banco falhar
      teacher = null;
    }

    if (!teacher || !teacher.landingConfig) {
      return NextResponse.json(
        {
          heroTitle: 'Transforme conhecimento em impacto real',
          heroSubtitle:
            'Apresente seus cursos com uma página persuasiva e alinhada ao seu tema visual.',
          heroImage: '',
          ctaLabel: 'Quero me inscrever',
          ctaLink: '#',
          ctaColor: 'primary',
          highlightOne: 'Aulas estruturadas e certificação ao concluir',
          highlightOneIcon: '✓',
          highlightTwo: 'Mentorias ao vivo e suporte dedicado',
          highlightTwoIcon: '♦',
          highlightThree: 'Comunidade ativa de alunos',
          highlightThreeIcon: '◆',
          testimonial:
            '"As aulas são claras e objetivas, finalmente aprendi de verdade." — Estudante satisfeito',
          testimonialAuthor: 'Estudante satisfeito',
          modules: [
            'Módulo 1: Fundamentos',
            'Módulo 2: Projetos práticos',
            'Módulo 3: Certificação',
          ],
          faqItems: [
            {
              question: 'Preciso de experiência anterior?',
              answer: 'Não! O curso é pensado para iniciantes e avançados.',
            },
            {
              question: 'Há suporte durante o curso?',
              answer:
                'Sim, oferecemos mentorias semanais e acesso ao chat exclusivo.',
            },
          ],
          sectionOrder: [
            'hero',
            'highlights',
            'modules',
            'testimonial',
            'faq',
            'cta',
          ],
          backgroundColor: 'background',
          textColor: 'foreground',
          showSocialProof: true,
          showModules: true,
          showTestimonial: true,
          showFaq: true,
          theme: teacher?.landingTheme ?? null,
        },
        { status: 200 }
      );
    }

    const landing = teacher.landingConfig as any;
    const merged = {
      ...(landing ?? {}),
      theme: teacher.landingTheme ?? landing?.theme ?? null,
    };

    return NextResponse.json(merged, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar landing:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Atualizar landing do professor com timeout
    let updated;
    try {
      updated = await Promise.race([
        prisma.user.update({
          where: { id: session.user.id },
          data: {
            landingConfig: body,
          },
          select: {
            landingConfig: true,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        ),
      ]);
    } catch (dbError) {
      console.error('Database error in landing PUT:', dbError);
      throw dbError;
    }

    return NextResponse.json(updated.landingConfig, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar landing:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resetar landing do professor com timeout
    try {
      await Promise.race([
        prisma.user.update({
          where: { id: session.user.id },
          data: {
            landingConfig: Prisma.JsonNull,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        ),
      ]);
    } catch (dbError) {
      console.error('Database error in landing DELETE:', dbError);
      throw dbError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao resetar landing:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
