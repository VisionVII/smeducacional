import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Obter informações de marca (público - para menus)
export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'system' },
      select: {
        companyName: true,
        systemName: true,
        logoUrl: true,
        faviconUrl: true,
        loginBgUrl: true,
        navbarBgUrl: true,
        primaryColor: true,
        secondaryColor: true,
        homeTitle: true,
        homeDescription: true,
        loginTitle: true,
        loginDescription: true,
        registerTitle: true,
        registerDescription: true,
        coursesTitle: true,
        coursesDescription: true,
        promotedCourse: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            slug: true,
            price: true,
            level: true,
            duration: true,
            category: {
              select: {
                name: true,
              },
            },
            instructor: {
              select: {
                name: true,
                avatar: true,
                bio: true,
              },
            },
            _count: {
              select: {
                modules: true,
                enrollments: true,
              },
            },
          },
        },
      },
    });

    // Buscar anúncios ativos
    const ads = await prisma.advertisement.findMany({
      where: {
        status: 'ACTIVE',
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        priority: 'desc',
      },
      take: 5,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            slug: true,
            price: true,
            level: true,
            duration: true,
            category: {
              select: {
                name: true,
              },
            },
            instructor: {
              select: {
                name: true,
                avatar: true,
                bio: true,
              },
            },
            _count: {
              select: {
                modules: true,
                enrollments: true,
              },
            },
          },
        },
      },
    });

    const advertisements = ads.map((ad) => ({
      ...ad.course,
      adId: ad.id,
    }));

    console.log(
      '[GET /api/system/branding] Anúncios encontrados:',
      advertisements.length
    );

    // Retornar valores padrão se não existir
    if (!config) {
      return NextResponse.json({
        companyName: 'SM Educacional',
        systemName: 'SM Educacional',
        logoUrl: null,
        faviconUrl: null,
        loginBgUrl: null,
        navbarBgUrl: null,
        primaryColor: null,
        secondaryColor: null,
        homeTitle: 'Bem-vindo ao SM Educacional',
        homeDescription: 'Transforme seu futuro com educação de qualidade',
        loginTitle: 'Bem-vindo de volta',
        loginDescription: 'Entre com suas credenciais para acessar sua conta',
        registerTitle: 'Crie sua conta',
        registerDescription: 'Comece sua jornada de aprendizado hoje',
        coursesTitle: 'Nossos Cursos',
        coursesDescription:
          'Descubra cursos incríveis para alavancar sua carreira',
        promotedCourse: null,
        advertisements,
      });
    }

    return NextResponse.json({ ...config, advertisements });
  } catch (error) {
    console.error('[GET /api/system/branding] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações de marca' },
      { status: 500 }
    );
  }
}
