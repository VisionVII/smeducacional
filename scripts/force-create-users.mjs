#!/usr/bin/env node

/**
 * Script FORÇA BRUTA: Garante que os 3 usuários existam
 * Se existirem → Reseta senhas e desativa 2FA
 * Se não existirem → Cria do zero
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const USERS = [
  {
    email: 'admin@smeducacional.com',
    password: 'admin123',
    name: 'Admin',
    role: 'ADMIN',
  },
  {
    email: 'professor@smeducacional.com',
    password: 'teacher123',
    name: 'Professor',
    role: 'TEACHER',
  },
  {
    email: 'aluno@smeducacional.com',
    password: 'student123',
    name: 'Aluno',
    role: 'STUDENT',
  },
];

async function forceCreateUsers() {
  console.log('🚀 FORÇA BRUTA: GARANTINDO USUÁRIOS NO BANCO\n');

  try {
    // 1. Verificar usuários atuais
    console.log('📊 Verificando banco...');
    const allUsers = await prisma.user.findMany({
      select: { email: true, role: true, password: true },
    });
    console.log(`   Total de usuários: ${allUsers.length}\n`);

    // 2. Desativar 2FA de TODOS
    console.log('🔓 Desativando 2FA globalmente...');
    await prisma.user.updateMany({
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
    console.log('   ✅ 2FA desativado\n');

    // 3. Processar cada usuário
    console.log('👥 Processando usuários de teste:\n');

    for (const userData of USERS) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      if (existing) {
        // ATUALIZAR
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            emailVerified: new Date(),
            twoFactorEnabled: false,
            twoFactorSecret: null,
          },
        });
        console.log(`   🔄 ATUALIZADO: ${userData.email}`);
      } else {
        // CRIAR
        await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            emailVerified: new Date(),
            twoFactorEnabled: false,
          },
        });
        console.log(`   ✨ CRIADO: ${userData.email}`);
      }

      console.log(`      Nome: ${userData.name}`);
      console.log(`      Senha: ${userData.password}`);
      console.log(`      Role: ${userData.role}\n`);
    }

    // 4. Verificar resultado final
    console.log('✅ VERIFICAÇÃO FINAL:\n');
    const finalUsers = await prisma.user.findMany({
      where: {
        email: {
          in: USERS.map((u) => u.email),
        },
      },
      select: {
        email: true,
        name: true,
        role: true,
        twoFactorEnabled: true,
        emailVerified: true,
        password: true,
      },
    });

    finalUsers.forEach((user) => {
      console.log(`   • ${user.email}`);
      console.log(`     Nome: ${user.name}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Senha: ${user.password ? '✅ Hash OK' : '❌ SEM SENHA'}`);
      console.log(`     2FA: ${user.twoFactorEnabled ? '⚠️ ATIVO' : '✅ Desativado'}`);
      console.log(`     Email verificado: ${user.emailVerified ? '✅' : '❌'}\n`);
    });

    console.log('🎯 PRÓXIMOS PASSOS:\n');
    console.log('   1. Reinicie o servidor Next.js:');
    console.log('      Remove-Item -Recurse -Force .next');
    console.log('      npm run dev\n');
    console.log('   2. Abra http://localhost:3000/login\n');
    console.log('   3. Use uma dessas credenciais:\n');

    USERS.forEach((u) => {
      console.log(`      ${u.role}:`);
      console.log(`      Email: ${u.email}`);
      console.log(`      Senha: ${u.password}\n`);
    });

    console.log('✨ SUCESSO! Usuários garantidos no banco.\n');
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('\n🔴 Detalhes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

forceCreateUsers();
