const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTheme() {
  const config = await prisma.systemConfig.findFirst({
    where: { key: 'default' },
  });

  console.log('=== SYSTEM CONFIG ===');
  console.log(JSON.stringify(config, null, 2));

  if (config?.publicTheme) {
    console.log('\n=== PUBLIC THEME ===');
    console.log(JSON.stringify(config.publicTheme, null, 2));
  }

  await prisma.$disconnect();
}

checkTheme().catch(console.error);
