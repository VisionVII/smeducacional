const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'aluno@smeducacional.com';
    const newPassword = 'student123';

    // Verificar usuário atual
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      console.error('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:', user.email);
    console.log('🔑 Tem senha no banco?', !!user.password);

    // Gerar nova senha hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('\n✅ Senha resetada com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔐 Nova senha:', newPassword);

    // Testar a senha
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    const isValid = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('✅ Validação da senha:', isValid ? 'OK' : 'FALHOU');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
