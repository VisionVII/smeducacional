const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('='.repeat(60));
  console.log('DIAGNÓSTICO DO TEMA');
  console.log('='.repeat(60));

  const config = await prisma.systemConfig.findFirst({
    where: { key: 'default' },
  });

  if (!config) {
    console.log('❌ Nenhum systemConfig encontrado!');
    await prisma.$disconnect();
    return;
  }

  console.log('\n✅ systemConfig encontrado:');
  console.log('ID:', config.id);
  console.log('Key:', config.key);
  console.log('publicTheme tipo:', typeof config.publicTheme);
  console.log('publicTheme é null?', config.publicTheme === null);

  if (config.publicTheme) {
    console.log('\n📦 publicTheme:');
    console.log(JSON.stringify(config.publicTheme, null, 2));

    if (config.publicTheme.themeName) {
      console.log('\n✅ themeName:', config.publicTheme.themeName);
    }

    if (config.publicTheme.palette) {
      console.log('\n🎨 Palette colors:');
      Object.entries(config.publicTheme.palette).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
  } else {
    console.log('\n❌ publicTheme é NULL no banco de dados!');
    console.log('Isso significa que nenhum tema foi salvo ainda.');
  }

  await prisma.$disconnect();
}

diagnose().catch(console.error);
