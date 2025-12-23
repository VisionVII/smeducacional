import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdminTheme() {
  console.log('🔍 Verificando se modelo AdminTheme está disponível...');

  try {
    // Tenta acessar o modelo (vai dar erro se não existir)
    const test = await prisma.adminTheme.findMany({ take: 1 });
    console.log('✅ Modelo AdminTheme está disponível no Prisma Client!');
    console.log('📊 Registros encontrados:', test.length);

    // Verificar tabela no banco
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND table_name='admin_themes'
    `;
    console.log('📋 Tabela admin_themes existe:', tables);

  } catch (error) {
    console.error('❌ Erro:', error?.message || error);
    if (typeof error?.message === 'string' && error.message.includes('adminTheme')) {
      console.log('⚠️ O modelo AdminTheme ainda não está no Prisma Client.');
      console.log('➡️ Execute: npx prisma generate');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAdminTheme();
