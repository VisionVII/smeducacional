#!/usr/bin/env node

/**
 * Script de Diagnóstico de Login
 * Verifica credenciais, usuários no banco e configuração NextAuth
 * 
 * Execute: node scripts/diagnose-login.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function diagnoseLogin() {
  console.log('🔍 DIAGNÓSTICO DE LOGIN\n');

  try {
    // 1. Verificar conexão com banco
    console.log('1️⃣ Testando conexão com banco...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Banco conectado (${userCount} usuários)\n`);

    // 2. Listar usuários
    console.log('2️⃣ Usuários no sistema:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        twoFactorEnabled: true,
      },
    });

    if (users.length === 0) {
      console.log('   ❌ NENHUM USUÁRIO ENCONTRADO!\n');
      console.log(
        '   ⚠️ Você precisa criar usuários antes de fazer login\n'
      );
    } else {
      users.forEach((u) => {
        console.log(`   • ${u.email}`);
        console.log(`     - Nome: ${u.name}`);
        console.log(`     - Role: ${u.role}`);
        console.log(`     - Tem senha: ${!!u.password ? '✅' : '❌'}`);
        console.log(`     - 2FA: ${u.twoFactorEnabled ? '🔐 Ativado' : 'Desativado'}`);
      });
      console.log();
    }

    // 3. Criar usuário de teste se não existir
    console.log('3️⃣ Criando usuário de teste...');
    const testEmail = 'teste@smeducacional.com';
    const testPassword = 'Teste@123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    let testUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Usuário Teste',
          password: hashedPassword,
          role: 'STUDENT',
          emailVerified: new Date(),
        },
      });
      console.log(`   ✅ Criado: ${testEmail}`);
      console.log(`   📝 Senha: ${testPassword}\n`);
    } else {
      console.log(`   ℹ️ Já existe: ${testEmail}\n`);
    }

    // 4. Testar validação de senha
    console.log('4️⃣ Testando validação de senha...');
    // password! é TypeScript; em JS puro usamos checagem explícita
    const isValid = await bcrypt.compare(testPassword, testUser.password || '');
    console.log(`   ${isValid ? '✅ Senha correta' : '❌ Senha incorreta'}\n`);

    // 5. Verificar variáveis de ambiente
    console.log('5️⃣ Verificando variáveis de ambiente:');
    console.log(
      `   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Definida' : '❌ Não definida'}`
    );
    console.log(
      `   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ Definida' : '❌ Não definida'}`
    );
    console.log(
      `   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Definida' : '❌ Não definida'}`
    );
    console.log(
      `   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? '✅ ' + process.env.NEXTAUTH_URL : '⚠️ Não definida'}`
    );
    console.log();

    // 6. Instruções de teste
    console.log('6️⃣ Próximos passos:');
    console.log(`   1. Abra http://localhost:3000/login`);
    console.log(`   2. Faça login com:`);
    console.log(`      Email: ${testEmail}`);
    console.log(`      Senha: ${testPassword}`);
    console.log(`   3. Você deve ser redirecionado para /student/dashboard\n`);

    console.log('✨ Diagnóstico completo!\n');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseLogin();
