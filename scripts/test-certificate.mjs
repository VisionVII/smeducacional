/**
 * Script para criar enrollment completo e emitir certificado de teste
 * Uso: node scripts/test-certificate.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Buscando aluno e curso para teste...\n');

    // Buscar primeiro aluno STUDENT
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, email: true },
    });

    if (!student) {
      console.error('❌ Nenhum aluno encontrado no banco.');
      console.log('💡 Crie um aluno primeiro ou rode o seed: npm run db:seed');
      process.exit(1);
    }

    console.log(`✅ Aluno encontrado: ${student.name} (${student.email})`);

    // Buscar primeiro curso publicado
    const course = await prisma.course.findFirst({
      where: { isPublished: true },
      select: { id: true, title: true, duration: true },
    });

    if (!course) {
      console.error('❌ Nenhum curso publicado encontrado.');
      console.log('💡 Publique um curso ou rode o seed: npm run db:seed');
      process.exit(1);
    }

    console.log(`✅ Curso encontrado: ${course.title}`);
    console.log(`   Duração: ${course.duration ? Math.ceil(course.duration / 60) : 0} horas\n`);

    // Verificar se já existe enrollment
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id,
        },
      },
    });

    if (enrollment) {
      console.log('📝 Enrollment já existe. Atualizando para COMPLETED...');

      enrollment = await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
        },
      });

      console.log('✅ Enrollment atualizado para COMPLETED (100%)');
    } else {
      console.log('📝 Criando novo enrollment como COMPLETED...');

      enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
        },
      });

      console.log('✅ Enrollment criado como COMPLETED (100%)');
    }

    // Verificar se já existe certificado
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        studentId: student.id,
        courseId: course.id,
      },
    });

    if (existingCertificate) {
      console.log('\n⚠️  Certificado já existe para este aluno/curso!');
      console.log(`   ID: ${existingCertificate.id}`);
      console.log(`   Número: ${existingCertificate.certificateNumber}`);
      console.log(`   Emitido em: ${existingCertificate.issuedAt.toLocaleString('pt-BR')}\n`);

      console.log('🔗 Você pode testar o download em:');
      console.log(`   GET /api/student/certificates/${existingCertificate.id}/download`);
      console.log('\n🔗 Ou verificar em:');
      console.log(`   /verify-certificate/${existingCertificate.certificateNumber}\n`);
    } else {
      console.log('\n📜 Emitindo certificado...');

      // Gerar número único
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const certificateNumber = `CERT-${timestamp}-${random}`;

      const certificate = await prisma.certificate.create({
        data: {
          certificateNumber,
          studentId: student.id,
          courseId: course.id,
        },
      });

      console.log('✅ Certificado emitido com sucesso!\n');
      console.log('📋 Detalhes:');
      console.log(`   ID: ${certificate.id}`);
      console.log(`   Número: ${certificate.certificateNumber}`);
      console.log(`   Aluno: ${student.name}`);
      console.log(`   Curso: ${course.title}`);
      console.log(`   Emitido em: ${certificate.issuedAt.toLocaleString('pt-BR')}\n`);

      console.log('🔗 Teste o download em:');
      console.log(`   GET /api/student/certificates/${certificate.id}/download`);
      console.log('\n🔗 Ou verifique em:');
      console.log(`   /verify-certificate/${certificate.certificateNumber}\n`);
    }

    console.log('✅ Script concluído com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Faça login como aluno na aplicação');
    console.log(`   2. Acesse /student/certificates`);
    console.log('   3. Clique em "Baixar PDF"');
    console.log('   4. Escaneie o QR Code no PDF para verificar autenticidade\n');

  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
