import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAnimationsSupport() {
  try {
    console.log('🔧 Adding animations column via raw SQL...');

    // Try to add the column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."teacher_themes" 
      ADD COLUMN IF NOT EXISTS "animations" jsonb 
      DEFAULT '{"enabled":true,"duration":"normal","easing":"ease-in-out","transitions":["all"],"hover":true,"focus":true,"pageTransitions":true}';
    `);

    console.log('✅ Animations column added/verified!');

    // Verify columns
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'teacher_themes' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 teacher_themes columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('ADD COLUMN') || err.message.includes('already exists')) {
      console.log('ℹ️  Column may already exist, continuing...');
    } else {
      throw err;
    }
  } finally {
    await prisma.$disconnect();
  }
}

addAnimationsSupport().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
