const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    console.log('\n📋 Usuários no banco:');
    console.log(JSON.stringify(users, null, 2));

    // Buscar especificamente o professor
    const teachers = users.filter(u => u.role === 'TEACHER');
    console.log(`\n👨‍🏫 Professores encontrados: ${teachers.length}`);
    if (teachers.length > 0) {
      console.log('IDs dos professores:');
      teachers.forEach(t => console.log(`  - ${t.id}: ${t.name} (${t.email})`));
    }
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
