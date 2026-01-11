#!/usr/bin/env node

/**
 * Script para Resetar Senha de Usuário
 * Uso: node scripts/reset-user-password.mjs seu@email.com NovaSenha@123
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log('❌ Uso: node scripts/reset-user-password.mjs email@example.com NovaSenha@123\n');
    process.exit(1);
  }

  try {
    console.log(`🔐 Resetando senha de: ${email}\n`);

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      console.log(`❌ Usuário não encontrado: ${email}\n`);
      process.exit(1);
    }

    // Fazer hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar usuário
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        twoFactorEnabled: false, // Desativar 2FA para facilitar login
      },
    });

    console.log(`✅ Senha resetada com sucesso!\n`);
    console.log(`📋 Detalhes:`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nova senha: ${newPassword}`);
    console.log(`   2FA: Desativado (para facilitar login)`);
    console.log(`\n🎯 Próximos passos:`);
    console.log(`   1. Abra http://localhost:3000/login`);
    console.log(`   2. Faça login com:`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Senha: ${newPassword}`);
    console.log(`   3. Você será redirecionado ao dashboard\n`);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
