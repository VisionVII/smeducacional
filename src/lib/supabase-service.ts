import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Missing Supabase service role environment variables');
}

// Client de serviço: NÃO usar no cliente. Apenas em rotas/edge functions seguras.
export const supabaseService = createClient(supabaseUrl, supabaseServiceRole);
