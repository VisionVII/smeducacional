/**
 * Script para verificar e corrigir usuário aluno no banco
 * Uso: node scripts/fix-student-user.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verificando usuário aluno@smeducacional.com...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'aluno@smeducacional.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      console.log('💡 Criando novo usuário...\n');

      const hashedPassword = await bcrypt.hash('123456', 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'aluno@smeducacional.com',
          name: 'Maria Santos',
          password: hashedPassword,
          role: 'STUDENT',
        },
      });

      console.log('✅ Usuário criado com sucesso:');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Nome: ${newUser.name}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Senha: 123456\n`);

      return;
    }

    console.log('📋 Dados atuais:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role || '⚠️  NULL/UNDEFINED'}`);
    console.log(`   Senha: ${user.password ? 'Existe' : '❌ NULL'}`);
    console.log(`   Criado em: ${user.createdAt.toLocaleString('pt-BR')}\n`);

    // Verificar se precisa corrigir
    const needsFix = !user.role || !user.password;

    if (needsFix) {
      console.log('🔧 Usuário precisa de correção!\n');

      const updates = {};

      if (!user.role) {
        updates.role = 'STUDENT';
        console.log('   → Definindo role como STUDENT');
      }

      if (!user.password) {
        updates.password = await bcrypt.hash('123456', 10);
        console.log('   → Definindo senha como 123456');
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });

      console.log('\n✅ Usuário atualizado com sucesso!');
      console.log(`   Role: ${updatedUser.role}`);
      console.log(`   Senha: ${updatedUser.password ? 'OK' : 'ERRO'}\n`);

      console.log('🎯 Agora você pode fazer login com:');
      console.log('   Email: aluno@smeducacional.com');
      console.log('   Senha: 123456\n');
    } else {
      console.log('✅ Usuário está OK! Não precisa de correção.\n');
      console.log('🎯 Credenciais de login:');
      console.log('   Email: aluno@smeducacional.com');
      console.log('   Senha: 123456 (ou a senha atual se foi alterada)\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
