#!/usr/bin/env node

/**
 * Script para Criar Usuários de Teste
 * Cria automaticamente 3 usuários (Student, Teacher, Admin) para testes rápidos
 * 
 * Uso: node scripts/create-test-users.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testUsers = [
  {
    email: 'aluno@teste.com',
    name: 'João Aluno',
    password: 'Aluno@123456',
    role: 'STUDENT',
  },
  {
    email: 'professor@teste.com',
    name: 'Maria Professor',
    password: 'Professor@123456',
    role: 'TEACHER',
  },
  {
    email: 'admin@teste.com',
    name: 'Admin Teste',
    password: 'Admin@123456',
    role: 'ADMIN',
  },
];

async function createTestUsers() {
  console.log('🧪 CRIANDO USUÁRIOS DE TESTE\n');

  try {
    for (const testUser of testUsers) {
      // Verificar se já existe
      const existing = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      if (existing) {
        console.log(`⚠️  ${testUser.email} já existe (pulando)`);
        continue;
      }

      // Fazer hash da senha
      const hashedPassword = await bcrypt.hash(testUser.password, 10);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          name: testUser.name,
          password: hashedPassword,
          role: testUser.role,
          emailVerified: new Date(),
          twoFactorEnabled: false,
        },
      });

      console.log(`✅ ${testUser.email}`);
      console.log(`   Nome: ${testUser.name}`);
      console.log(`   Senha: ${testUser.password}`);
      console.log(`   Role: ${testUser.role}\n`);
    }

    console.log('✨ Usuários criados com sucesso!\n');
    console.log('🎯 Próximos passos:\n');
    console.log('   1. Abra http://localhost:3000/login');
    console.log('   2. Teste os logins acima');
    console.log('   3. Você será redirecionado automaticamente ao dashboard\n');
    console.log('📋 Credenciais de Teste:\n');

    testUsers.forEach((u) => {
      console.log(`   ${u.role}:`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Senha: ${u.password}\n`);
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
