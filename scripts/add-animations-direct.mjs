import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

async function addAnimationsColumn() {
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if column exists
    const checkQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teacher_themes' AND column_name = 'animations'
      );
    `;

    const result = await client.query(checkQuery);
    const columnExists = result.rows[0].exists;

    if (columnExists) {
      console.log('ℹ️  Animations column already exists');
    } else {
      console.log('🔧 Adding animations column...');

      const sql = `
        ALTER TABLE "public"."teacher_themes" 
        ADD COLUMN "animations" jsonb DEFAULT '{"enabled":true,"duration":"normal","easing":"ease-in-out","transitions":["all"],"hover":true,"focus":true,"pageTransitions":true}';
      `;

      await client.query(sql);
      console.log('✅ Animations column added successfully!');
    }

    // Verify all columns
    const verifyQuery = `
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'teacher_themes' 
      ORDER BY ordinal_position;
    `;

    const verifyResult = await client.query(verifyQuery);
    console.log('\n📋 teacher_themes columns:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addAnimationsColumn();
