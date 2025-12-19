/**
 * Testa acesso aos avatares
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

async function testAvatarAccess() {
  console.log('\n🔍 DIAGNÓSTICO DE AVATARES\n');
  console.log('═'.repeat(60));

  const avatarDir = join(process.cwd(), 'public', 'uploads', 'avatars');

  try {
    const files = await readdir(avatarDir);

    console.log(`\n✅ Diretório existe: ${avatarDir}`);
    console.log(`📁 Total de arquivos: ${files.length}\n`);

    if (files.length === 0) {
      console.log('⚠️ Nenhum avatar encontrado');
      return;
    }

    console.log('📋 Arquivos encontrados:\n');

    files.forEach((file, index) => {
      const url = `/uploads/avatars/${file}`;
      console.log(`${index + 1}. ${file}`);
      console.log(`   URL: http://localhost:3000${url}\n`);
    });

    console.log('═'.repeat(60));
    console.log('\n💡 COMO RESOLVER ERRO 404:\n');
    console.log('1. REINICIE o servidor Next.js:');
    console.log('   Ctrl+C → npm run dev\n');
    console.log('2. Aguarde "✓ Ready"');
    console.log('3. Recarregue o browser: Ctrl+Shift+R\n');
    console.log('Por que? Next.js cacheia arquivos estáticos do /public\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAvatarAccess();
