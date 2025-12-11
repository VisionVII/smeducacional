/**
 * Script para resetar senha do aluno para 123456
 * Uso: node scripts/reset-password.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔐 Resetando senha do aluno@smeducacional.com...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'aluno@smeducacional.com' },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      process.exit(1);
    }

    // Gerar nova senha hash
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log('✅ Senha resetada com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log(`   Email: aluno@smeducacional.com`);
    console.log(`   Senha: ${newPassword}`);
    console.log(`   Role: ${user.role}\n`);

    console.log('🎯 Agora faça login em: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
