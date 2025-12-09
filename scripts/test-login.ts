// Script para testar login localmente
// Execute: npx ts-node scripts/test-login.ts

import { prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function testLogin() {
  try {
    console.log('🔍 Verificando usuários no banco...\n');

    // Listar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco!');
      console.log(
        '\n📋 Execute seed para popular dados iniciais:\n npx prisma db seed'
      );
      return;
    }

    console.log(`✅ ${users.length} usuários encontrados:\n`);

    for (const user of users) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Nome: ${user.name}`);
      console.log(`🔐 Role: ${user.role}`);
      console.log(`🔒 Tem senha: ${user.password ? '✅ Sim' : '❌ Não'}`);

      // Testar se a senha padrão funciona
      if (user.password) {
        const testPasswords = ['admin123', 'prof123', 'aluno123', '123456'];

        for (const testPassword of testPasswords) {
          const isValid = await bcrypt.compare(testPassword, user.password);
          if (isValid) {
            console.log(`   └─ ✅ Senha testada: "${testPassword}" funciona!`);
            break;
          }
        }
      }

      console.log('');
    }

    console.log('\n🎯 Tente fazer login no http://localhost:3000/login');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
