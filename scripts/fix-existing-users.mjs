#!/usr/bin/env node

/**
 * Script para Corrigir Usuários Existentes
 * 
 * Este script:
 * 1. Desativa 2FA de todos os usuários
 * 2. Reseta senhas para padrões conhecidos
 * 3. Atualiza apenas admin, professor e aluno (baseado no email)
 * 
 * Uso: node scripts/fix-existing-users.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Mapeamento de usuários conhecidos → novas senhas
const userFixes = [
  {
    email: 'admin@teste.com',
    newPassword: 'Admin@123456',
    name: 'Admin Teste',
    role: 'ADMIN',
  },
  {
    email: 'professor@teste.com',
    newPassword: 'Professor@123456',
    name: 'Maria Professor',
    role: 'TEACHER',
  },
  {
    email: 'aluno@teste.com',
    newPassword: 'Aluno@123456',
    name: 'João Aluno',
    role: 'STUDENT',
  },
];

async function fixExistingUsers() {
  console.log('🔧 CORRIGINDO USUÁRIOS EXISTENTES\n');
  console.log('Este script vai:');
  console.log('  ✓ Desativar 2FA de todos os usuários');
  console.log('  ✓ Resetar senhas para valores conhecidos');
  console.log('  ✓ Garantir que emailVerified está ativo\n');

  try {
    // 1. Desativar 2FA de TODOS os usuários
    console.log('🔓 Desativando 2FA de todos os usuários...');
    const disabledCount = await prisma.user.updateMany({
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
    console.log(`✅ 2FA desativado em ${disabledCount.count} usuários\n`);

    // 2. Resetar senhas dos usuários conhecidos
    console.log('🔑 Resetando senhas dos usuários conhecidos:\n');

    for (const userFix of userFixes) {
      const user = await prisma.user.findUnique({
        where: { email: userFix.email },
      });

      if (!user) {
        console.log(`⚠️  ${userFix.email} não encontrado (pulando)`);
        continue;
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(userFix.newPassword, 10);

      // Atualizar usuário
      await prisma.user.update({
        where: { email: userFix.email },
        data: {
          password: hashedPassword,
          name: userFix.name,
          role: userFix.role,
          emailVerified: new Date(),
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      console.log(`✅ ${userFix.email}`);
      console.log(`   Nome: ${userFix.name}`);
      console.log(`   Senha: ${userFix.newPassword}`);
      console.log(`   Role: ${userFix.role}`);
      console.log(`   2FA: Desativado\n`);
    }

    console.log('✨ Usuários corrigidos com sucesso!\n');
    console.log('📋 CREDENCIAIS ATUALIZADAS:\n');

    userFixes.forEach((u) => {
      console.log(`   ${u.role}:`);
      console.log(`   📧 Email: ${u.email}`);
      console.log(`   🔑 Senha: ${u.newPassword}`);
      console.log(`   🔓 2FA: Desativado\n`);
    });

    console.log('🎯 PRÓXIMOS PASSOS:\n');
    console.log('   1. Abra http://localhost:3000/login');
    console.log('   2. Use as credenciais acima');
    console.log('   3. Você será redirecionado automaticamente\n');

    console.log('💡 DICA: Se ainda não funcionar, execute:');
    console.log('   node scripts/diagnose-login.mjs\n');
  } catch (error) {
    console.error('❌ Erro ao corrigir usuários:', error);

    if (error.code === 'P1001') {
      console.error('\n🔴 ERRO DE CONEXÃO COM O BANCO DE DADOS');
      console.error('   Verifique:');
      console.error('   1. DATABASE_URL está correto no .env');
      console.error('   2. Banco de dados está rodando');
      console.error('   3. Credenciais estão corretas\n');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 🚨 AVISO ANTES DE EXECUTAR
console.log('⚠️  AVISO: Este script vai modificar senhas de usuários!\n');
console.log('Usuários afetados:');
userFixes.forEach((u) => console.log(`   - ${u.email}`));
console.log('\nContinuando em 3 segundos...\n');

setTimeout(() => {
  fixExistingUsers();
}, 3000);
