import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed de Pagamentos e Cursos Pagos...\n');

  // ============================================
  // PARTE 1: USUÁRIOS ADICIONAIS PARA TESTE
  // ============================================
  console.log('👥 Criando usuários adicionais...');

  const testUsers = [
    {
      email: 'aluno.pago@test.com',
      name: 'Aluno Premium',
      role: 'STUDENT' as const,
    },
    {
      email: 'professor.pago@test.com',
      name: 'Professor Premium',
      role: 'TEACHER' as const,
    },
    {
      email: 'admin2@test.com',
      name: 'Admin 2',
      role: 'ADMIN' as const,
    },
  ];

  const hashedPassword = await bcrypt.hash('teste123', 10);

  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });
  }

  console.log('✅ 3 usuários de teste criados\n');

  // ============================================
  // PARTE 2: CURSOS PAGOS
  // ============================================
  console.log('💰 Criando cursos pagos...');

  // Buscar professor existente ou criar
  const teacher = await prisma.user.findUnique({
    where: { email: 'professor@smeducacional.com' },
  });

  if (!teacher) {
    throw new Error(
      'Professor padrão não encontrado. Execute seed-complete.ts primeiro.'
    );
  }

  // Buscar categorias
  const webDevCategory = await prisma.category.findUnique({
    where: { slug: 'desenvolvimento-web' },
  });

  if (!webDevCategory) {
    throw new Error('Categoria "desenvolvimento-web" não encontrada');
  }

  // Cursos pagos
  const paidCourses = [
    {
      title: 'Masterclass: Next.js Avançado',
      slug: 'nextjs-masterclass-avancado',
      description: 'Curso completo de Next.js com App Router, Stripe, e Deploy',
      price: 199.9,
      level: 'INTERMEDIATE',
      duration: 3600,
    },
    {
      title: 'Full Stack: React + Node.js + PostgreSQL',
      slug: 'fullstack-react-nodejs',
      description: 'Aprenda a construir aplicações full stack modernas',
      price: 249.9,
      level: 'ADVANCED',
      duration: 5400,
    },
    {
      title: 'Stripe Integration Masterclass',
      slug: 'stripe-integration-masterclass',
      description: 'Integre pagamentos Stripe em suas aplicações',
      price: 149.9,
      level: 'INTERMEDIATE',
      duration: 2400,
    },
    {
      title: 'TypeScript Profissional',
      slug: 'typescript-profissional',
      description: 'Domine TypeScript para desenvolvimento profissional',
      price: 129.9,
      level: 'BEGINNER',
      duration: 1800,
    },
  ];

  for (const courseData of paidCourses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: { price: courseData.price, isPaid: true },
      create: {
        ...courseData,
        isPaid: true,
        isPublished: true,
        instructorId: teacher.id,
        categoryId: webDevCategory.id,
        thumbnail:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      },
    });

    // Criar módulos para o curso pago
    const module1 = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        order: 1,
      },
    });

    if (!module1) {
      await prisma.module.create({
        data: {
          courseId: course.id,
          title: 'Fundamentos',
          description: 'Conceitos básicos e setup',
          order: 1,
        },
      });
    }

    const module2 = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        order: 2,
      },
    });

    if (!module2) {
      await prisma.module.create({
        data: {
          courseId: course.id,
          title: 'Projeto Prático',
          description: 'Aplicando o aprendizado',
          order: 2,
        },
      });
    }
  }

  console.log('✅ 4 cursos pagos criados\n');

  // ============================================
  // PARTE 3: PAYMENTS DE TESTE (SIMULADOS)
  // ============================================
  console.log('💳 Criando payments de teste...');

  const alunoPago = await prisma.user.findUnique({
    where: { email: 'aluno.pago@test.com' },
  });

  const courses = await prisma.course.findMany({
    where: { isPaid: true },
    take: 2,
  });

  if (alunoPago && courses.length > 0) {
    for (const course of courses) {
      // Criar enrollment
      await prisma.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: alunoPago.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          studentId: alunoPago.id,
          courseId: course.id,
          status: 'ACTIVE',
        },
      });

      // Criar payment
      const paymentId = `mock_payment_${Date.now()}_${Math.random()}`;
      await prisma.payment.create({
        data: {
          userId: alunoPago.id,
          courseId: course.id,
          amount: course.price || 99.9,
          currency: 'BRL',
          type: 'course',
          paymentMethod: 'credit_card',
          status: 'completed',
          stripePaymentId: `pi_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            courseTitle: course.title,
            studentEmail: alunoPago.email,
          },
        },
      });

      // Criar invoice
      const invoiceNumber = `INV-${Date.now()}-${course.id.slice(0, 6)}`;
      await prisma.invoice.create({
        data: {
          userId: alunoPago.id,
          invoiceNumber,
          amount: course.price || 99.9,
          status: 'paid',
          paidAt: new Date(),
          dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          description: `Compra do curso: ${course.title}`,
          paymentId: paymentId,
        },
      });
    }
  }

  console.log('✅ Payments e invoices de teste criados\n');

  // ============================================
  // PARTE 4: SUBSCRIPTIONS DE TESTE
  // ============================================
  console.log('🔄 Criando subscriptions de teste...');

  const professorPago = await prisma.user.findUnique({
    where: { email: 'professor.pago@test.com' },
  });

  if (professorPago) {
    // Criar subscription de professor
    await prisma.teacherSubscription.upsert({
      where: { userId: professorPago.id },
      update: {},
      create: {
        userId: professorPago.id,
        plan: 'premium',
        status: 'active',
        price: 99.9,
        startDate: new Date(),
        renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeSubId: `sub_${Math.random().toString(36).substr(2, 9)}`,
        stripePriceId: `price_${Math.random().toString(36).substr(2, 9)}`,
      },
    });

    // Criar payment da subscription
    await prisma.payment.create({
      data: {
        userId: professorPago.id,
        amount: 99.9,
        currency: 'BRL',
        type: 'teacher_subscription',
        paymentMethod: 'credit_card',
        status: 'completed',
        stripePaymentId: `pi_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          plan: 'premium',
          type: 'teacher_subscription',
        },
      },
    });
  }

  // Criar subscription de aluno
  if (alunoPago) {
    await prisma.studentSubscription.upsert({
      where: { userId: alunoPago.id },
      update: {},
      create: {
        userId: alunoPago.id,
        plan: 'basic',
        status: 'active',
        price: 29.9,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeSubId: `sub_${Math.random().toString(36).substr(2, 9)}`,
        stripePriceId: `price_${Math.random().toString(36).substr(2, 9)}`,
      },
    });
  }

  console.log('✅ Subscriptions de teste criadas\n');

  // ============================================
  // PARTE 5: SYSTEM LOGS
  // ============================================
  console.log('📋 Criando system logs...');

  await prisma.systemLog.create({
    data: {
      level: 'info',
      component: 'payment',
      message: 'Sistema de pagamentos inicializado',
      description: 'Seed de dados de pagamento executado com sucesso',
    },
  });

  await prisma.systemLog.create({
    data: {
      level: 'info',
      component: 'database',
      message: 'Cursos pagos criados',
      description: '4 cursos pagos foram adicionados ao catálogo',
    },
  });

  console.log('✅ System logs criados\n');

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   🎉 SEED DE PAGAMENTOS EXECUTADO COM SUCESSO  ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log('📊 RESUMO:');
  console.log('   👥 Usuários de teste: 3');
  console.log('   💰 Cursos pagos: 4');
  console.log('   💳 Payments: 2 (cursos pagos)');
  console.log('   📜 Invoices: 2');
  console.log('   🔄 Subscriptions: 2 (professor + aluno)');
  console.log('   📋 System Logs: 2\n');
  console.log('🔑 CREDENCIAIS DE TESTE:');
  console.log('   Aluno Premium: aluno.pago@test.com / teste123');
  console.log('   Professor Premium: professor.pago@test.com / teste123');
  console.log('   Admin 2: admin2@test.com / teste123\n');
  console.log('💡 Próximos passos:');
  console.log('   1. Configure as variáveis STRIPE_*_PRICE_ID no .env');
  console.log('   2. Configure STRIPE_SECRET_KEY e WEBHOOK_SECRET');
  console.log('   3. Acesse /admin/dashboard para ver os pagamentos');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed de pagamentos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
