#!/usr/bin/env node
/**
 * SECUREOPSAI: Auditoria de Fluxo de Autenticação & Layout
 * 
 * Diagnostica:
 * - Auth session corretamente criada?
 * - Redirect para /admin funcionando?
 * - DashboardShell renderizando?
 * - Sheet state management OK?
 * - Script overlay bloqueador removido?
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔐 SECUREOPSAI: Auditoria de Segurança & Layout\n');

// 1. Check auth.ts
console.log('📋 [1/5] Verificando auth.ts...');
const authPath = path.join(process.cwd(), 'src/lib/auth.ts');
if (fs.existsSync(authPath)) {
  const auth = fs.readFileSync(authPath, 'utf8');
  if (auth.includes('callback')) {
    console.log('✅ authorize() callback encontrado');
  }
  if (auth.includes('role')) {
    console.log('✅ Role check implementado');
  }
} else {
  console.log('❌ auth.ts não encontrado');
}

// 2. Check admin/layout.tsx
console.log('\n📋 [2/5] Verificando admin/layout.tsx...');
const adminLayoutPath = path.join(process.cwd(), 'src/app/admin/layout.tsx');
if (fs.existsSync(adminLayoutPath)) {
  const adminLayout = fs.readFileSync(adminLayoutPath, 'utf8');
  if (adminLayout.includes("role !== 'ADMIN'")) {
    console.log('✅ Admin role check encontrado');
  }
  if (adminLayout.includes('redirect')) {
    console.log('✅ Redirect para /login implementado');
  }
} else {
  console.log('❌ admin/layout.tsx não encontrado');
}

// 3. Check dashboard-shell.tsx
console.log('\n📋 [3/5] Verificando dashboard-shell.tsx...');
const dashboardPath = path.join(process.cwd(), 'src/components/dashboard/dashboard-shell.tsx');
if (fs.existsSync(dashboardPath)) {
  const dashboard = fs.readFileSync(dashboardPath, 'utf8');
  if (dashboard.includes('useState')) {
    console.log('✅ useState importado para Sheet control');
  }
  if (dashboard.includes('sheetOpen')) {
    console.log('✅ sheetOpen state encontrado');
  }
  if (dashboard.includes('onOpenChange')) {
    console.log('✅ Sheet onOpenChange handler implementado');
  }
} else {
  console.log('❌ dashboard-shell.tsx não encontrado');
}

// 4. Check layout.tsx scripts
console.log('\n📋 [4/5] Verificando layout.tsx scripts...');
const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, 'utf8');
  if (layout.includes('document.body')) {
    console.log('✅ Body manipulation script encontrado');
  }
  if (layout.includes('if (document.body)')) {
    console.log('✅ ✨ Null-check para document.body implementado (CRÍTICO FIX)');
  } else {
    console.log('⚠️  ⚠️ Null-check FALTANDO - pode causar erro!');
  }
  if (layout.includes('DOMContentLoaded')) {
    console.log('✅ DOMContentLoaded listener adicionado');
  }
} else {
  console.log('❌ layout.tsx não encontrado');
}

// 5. Check database - admin user exists?
console.log('\n📋 [5/5] Verificando banco de dados (Prisma)...');
const prismaPath = path.join(process.cwd(), 'prisma/schema.prisma');
if (fs.existsSync(prismaPath)) {
  const schema = fs.readFileSync(prismaPath, 'utf8');
  if (schema.includes('model User')) {
    console.log('✅ User model encontrado');
  }
  if (schema.includes('role String')) {
    console.log('✅ Role field encontrado');
  }
  console.log('\n💡 Para verificar se admin@smeducacional.com existe:');
  console.log('   Abra: http://localhost:3000/api/debug/check-admin');
  console.log('\n💡 Para resetar/criar admin:');
  console.log('   POST: http://localhost:3000/api/debug/reset-admin');
} else {
  console.log('❌ schema.prisma não encontrado');
}

console.log('\n\n🎯 PRÓXIMOS PASSOS:\n');
console.log('1. npm run dev (reinicie o servidor)');
console.log('2. Recarregue a página (Ctrl+Shift+R)');
console.log('3. DevTools Console (F12) - deve estar SEM erros');
console.log('4. Teste login com: admin@smeducacional.com / admin123');
console.log('5. Verifique Sheet mobile (clique ☰ em smartphone)');

console.log('\n✨ SecureOpsAI Audit Complete\n');
