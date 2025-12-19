const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDefaultConfig() {
  console.log('🔧 Criando systemConfig default...');

  const config = await prisma.systemConfig.upsert({
    where: { key: 'default' },
    update: {},
    create: {
      key: 'default',
      companyName: 'SM Educacional',
      systemName: 'SM Educa',
      companyEmail: 'contato@smeducacional.com',
      companyPhone: '(11) 1234-5678',
      companyAddress: 'São Paulo, SP',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      publicTheme: null, // Será preenchido quando admin selecionar
      metaTitle: 'SM Educa - Plataforma Educacional',
      metaDescription: 'Sistema moderno de gestão educacional',
      metaKeywords: 'educação, cursos, online',
      maintenanceMode: false,
      registrationEnabled: true,
    },
  });

  console.log('✅ systemConfig criado com ID:', config.id);
  console.log('📝 Key:', config.key);
  console.log('🏢 Company:', config.companyName);
  console.log('🎨 publicTheme:', config.publicTheme || 'null (ainda não configurado)');

  await prisma.$disconnect();
}

createDefaultConfig()
  .then(() => {
    console.log('\n✅ CONCLUÍDO! Agora você pode selecionar um tema em /admin/settings');
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
