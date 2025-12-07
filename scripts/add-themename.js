const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addThemeNameColumn() {
  try {
    console.log('🔄 Adicionando coluna themeName...');

    // Adicionar coluna themeName
    await prisma.$executeRawUnsafe(`
      ALTER TABLE teacher_themes 
      ADD COLUMN IF NOT EXISTS "themeName" TEXT;
    `);

    console.log('✅ Coluna themeName adicionada com sucesso!');

    // Verificar se a coluna existe
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teacher_themes' 
      AND column_name = 'themeName';
    `);

    if (result.length > 0) {
      console.log('✅ Verificação: Coluna themeName existe:', result[0]);
    } else {
      console.log('❌ Erro: Coluna themeName não foi criada');
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addThemeNameColumn();
