#!/usr/bin/env node

/**
 * PHASE 2.4 - Instalação Multiplataforma
 * VisionVII 3.0 Enterprise Governance
 * 
 * Funciona em: Windows, macOS, Linux
 * Não necessita de .bat - puro JavaScript/Node
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execute(command, description) {
  try {
    log(`\n${description}...`, 'blue');
    execSync(command, { stdio: 'inherit', shell: true });
    log(`✅ ${description} concluído!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ERRO: ${description} falhou!`, 'red');
    process.exit(1);
  }
}

// ============================================================================
// MAIN
// ============================================================================

log('\n════════════════════════════════════════', 'bright');
log('PHASE 2.4 - Instalação Automatizada', 'bright');
log('VisionVII 3.0 Enterprise Governance', 'bright');
log('════════════════════════════════════════\n', 'bright');

// Step 1: Install dependencies
execute(
  'npm install sharp @supabase/supabase-js react-dropzone sonner',
  '[1/4] Instalando dependências'
);

// Step 2: Run Prisma migration
execute(
  'npx prisma migrate dev --name add_image_models',
  '[2/4] Executando migração do Prisma'
);

// Step 3: Generate Prisma Client
execute(
  'npx prisma generate',
  '[3/4] Gerando Prisma Client'
);

// Step 4: Run verification
execute(
  'node check-phase-2-setup.js',
  '[4/4] Verificando instalação'
);

log('\n════════════════════════════════════════', 'bright');
log('INSTALAÇÃO CONCLUÍDA!', 'green');
log('════════════════════════════════════════\n', 'bright');

log('Próximos passos:');
log('1. Verifique os buckets no Supabase Dashboard', 'yellow');
log('2. Execute: npm run dev', 'yellow');
log('3. Acesse: http://localhost:3000/admin', 'yellow');
log('4. Teste o upload de imagens', 'yellow');
log('');
