import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAnimationsColumn() {
  try {
    console.log('🔧 Adding animations column to teacher_themes...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE "public"."teacher_themes" ADD COLUMN IF NOT EXISTS "animations" jsonb DEFAULT '{"enabled":true,"duration":"normal","easing":"ease-in-out","transitions":["all"],"hover":true,"focus":true,"pageTransitions":true}';`
    });

    if (error) {
      // Try direct SQL query instead
      console.log('⚠️  RPC method failed, attempting direct query...');

      // We'll use a direct approach via the API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({
          sql: `ALTER TABLE "public"."teacher_themes" ADD COLUMN IF NOT EXISTS "animations" jsonb DEFAULT '{"enabled":true,"duration":"normal","easing":"ease-in-out","transitions":["all"],"hover":true,"focus":true,"pageTransitions":true}';`
        })
      });

      if (!response.ok) {
        console.error('API Error:', await response.text());
        process.exit(1);
      }

      console.log('✅ Animations column added successfully via API!');
      return;
    }

    console.log('✅ Animations column added successfully!');
  } catch (err) {
    console.error('❌ Error adding column:', err);
    process.exit(1);
  }
}

addAnimationsColumn();
