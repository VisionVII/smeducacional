/**
 * VERIFICAÇÃO DE INSTALAÇÃO - Phase 2.4
 * Verifica se todas as dependências e arquivos estão corretos
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando instalação do Phase 2.4...\n');

let errors = 0;
let warnings = 0;

// ============================================================================
// 1. VERIFICAR DEPENDÊNCIAS NO package.json
// ============================================================================
console.log('📦 [1/6] Verificando dependências...');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
  );

  const requiredDeps = [
    'sharp',
    '@supabase/supabase-js',
    'react-dropzone',
    'sonner'
  ];

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  requiredDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`  ✅ ${dep}: ${allDeps[dep]}`);
    } else {
      console.log(`  ❌ ${dep}: NÃO INSTALADO`);
      errors++;
    }
  });
} catch (error) {
  console.log('  ❌ Erro ao ler package.json:', error.message);
  errors++;
}

console.log();

// ============================================================================
// 2. VERIFICAR ARQUIVOS DO IMAGESERVICE
// ============================================================================
console.log('📁 [2/6] Verificando arquivos criados...');
const requiredFiles = [
  'src/lib/services/ImageService.ts',
  'src/components/forms/ImageUploadForm.tsx',
  'src/components/admin/ImageGallery.tsx',
  'src/app/api/admin/images/route.ts',
  'src/app/api/admin/images/upload/route.ts',
  'src/app/api/admin/images/[id]/route.ts',
  'src/app/api/admin/images/[id]/signed-url/route.ts',
  'src/app/api/admin/images/orphaned/route.ts',
  'src/lib/utils/format.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file}: NÃO ENCONTRADO`);
    errors++;
  }
});

console.log();

// ============================================================================
// 3. VERIFICAR SCHEMA.PRISMA
// ============================================================================
console.log('🗄️  [3/6] Verificando Prisma schema...');
try {
  const schemaContent = fs.readFileSync(
    path.join(__dirname, 'prisma/schema.prisma'),
    'utf8'
  );

  const hasImageModel = schemaContent.includes('model Image {');
  const hasImageUsageModel = schemaContent.includes('model ImageUsage {');
  const hasUserRelation = schemaContent.includes('uploadedImages');

  if (hasImageModel) {
    console.log('  ✅ Model Image encontrado');
  } else {
    console.log('  ❌ Model Image NÃO encontrado');
    errors++;
  }

  if (hasImageUsageModel) {
    console.log('  ✅ Model ImageUsage encontrado');
  } else {
    console.log('  ❌ Model ImageUsage NÃO encontrado');
    errors++;
  }

  if (hasUserRelation) {
    console.log('  ✅ Relação User.uploadedImages encontrada');
  } else {
    console.log('  ⚠️  Relação User.uploadedImages NÃO encontrada');
    warnings++;
  }
} catch (error) {
  console.log('  ❌ Erro ao ler schema.prisma:', error.message);
  errors++;
}

console.log();

// ============================================================================
// 4. VERIFICAR VARIÁVEIS DE AMBIENTE
// ============================================================================
console.log('🔐 [4/6] Verificando variáveis de ambiente...');
try {
  const envContent = fs.readFileSync(
    path.join(__dirname, '.env'),
    'utf8'
  );

  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasServiceRoleKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=');

  if (hasSupabaseUrl) {
    console.log('  ✅ NEXT_PUBLIC_SUPABASE_URL configurada');
  } else {
    console.log('  ⚠️  NEXT_PUBLIC_SUPABASE_URL NÃO encontrada');
    warnings++;
  }

  if (hasServiceRoleKey) {
    console.log('  ✅ SUPABASE_SERVICE_ROLE_KEY configurada');
  } else {
    console.log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY NÃO encontrada');
    warnings++;
  }
} catch (error) {
  console.log('  ⚠️  Arquivo .env não encontrado');
  warnings++;
}

console.log();

// ============================================================================
// 5. VERIFICAR PRISMA CLIENT
// ============================================================================
console.log('⚙️  [5/6] Verificando Prisma Client...');
const prismaClientPath = path.join(__dirname, 'node_modules/.prisma/client');
if (fs.existsSync(prismaClientPath)) {
  console.log('  ✅ Prisma Client gerado');
} else {
  console.log('  ⚠️  Prisma Client não gerado (execute: npx prisma generate)');
  warnings++;
}

console.log();

// ============================================================================
// 6. VERIFICAR MIGRAÇÕES
// ============================================================================
console.log('🔄 [6/6] Verificando migrações...');
const migrationsPath = path.join(__dirname, 'prisma/migrations');
if (fs.existsSync(migrationsPath)) {
  const migrations = fs.readdirSync(migrationsPath)
    .filter(file => file.includes('add_image_models'));

  if (migrations.length > 0) {
    console.log(`  ✅ Migração encontrada: ${migrations[0]}`);
  } else {
    console.log('  ⚠️  Migração add_image_models não encontrada');
    console.log('  💡 Execute: npx prisma migrate dev --name add_image_models');
    warnings++;
  }
} else {
  console.log('  ⚠️  Pasta migrations não encontrada');
  warnings++;
}

console.log();

// ============================================================================
// SUMÁRIO
// ============================================================================
console.log('════════════════════════════════════════');
console.log('SUMÁRIO DA VERIFICAÇÃO');
console.log('════════════════════════════════════════');
console.log(`Erros: ${errors}`);
console.log(`Avisos: ${warnings}`);

if (errors === 0 && warnings === 0) {
  console.log('\n✅ TUDO OK! Phase 2.4 instalado corretamente.');
  console.log('\nPróximos passos:');
  console.log('1. Verifique os buckets no Supabase Dashboard');
  console.log('2. Execute: npm run dev');
  console.log('3. Acesse: http://localhost:3000/admin');
} else if (errors === 0) {
  console.log('\n⚠️  Instalação OK, mas há avisos. Verifique acima.');
} else {
  console.log('\n❌ Há erros que precisam ser corrigidos. Verifique acima.');
  process.exit(1);
}
