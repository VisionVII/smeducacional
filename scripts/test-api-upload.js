/**
 * Testa a API de upload-branding simulando uma requisição real do browser
 */

const API_URL = 'http://localhost:3000/api/admin/upload-branding';

async function testUpload() {
  console.log('\n🧪 TESTANDO API DE UPLOAD\n');
  console.log('═'.repeat(70));

  try {
    // Cria um arquivo de teste (PNG fake)
    const testFile = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82
    ]);

    // Cria FormData
    const FormData = (await import('formdata-node')).FormData;

    const formData = new FormData();
    const blob = new Blob([testFile], { type: 'image/png' });
    formData.append('file', blob, 'test-logo.png');
    formData.append('type', 'logo');

    console.log('\n📤 Enviando requisição...');
    console.log('   URL:', API_URL);
    console.log('   Tipo: logo');
    console.log('   Tamanho:', testFile.length, 'bytes');

    // Faz a requisição
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      // Note: Sem cookie de sessão, vai dar 401 (esperado para teste)
    });

    console.log('\n📥 Resposta recebida:');
    console.log('   Status:', response.status, response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log('   Body:', JSON.stringify(data, null, 2));

      if (response.status === 401) {
        console.log('\n⚠️  ESPERADO: Não autorizado (sem cookie de sessão)');
        console.log('   Isso é normal - você precisa estar logado como ADMIN no browser.');
      } else if (response.ok) {
        console.log('\n✅ SUCESSO! Upload funcionou!');
        console.log('   URL gerada:', data.data?.url);
      } else {
        console.log('\n❌ ERRO:', data.error);
      }
    } else {
      const text = await response.text();
      console.log('   Body (text):', text);
    }

  } catch (error) {
    console.error('\n❌ ERRO NA REQUISIÇÃO:', error.message);

    if (error.message.includes('fetch failed')) {
      console.log('\n⚠️  O servidor não está respondendo!');
      console.log('   Certifique-se que "npm run dev" está rodando.');
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n💡 PARA TESTAR COMPLETAMENTE:');
  console.log('   1. Certifique-se que o servidor está rodando');
  console.log('   2. Faça login como ADMIN no browser');
  console.log('   3. Vá em Admin → Settings → Branding');
  console.log('   4. Tente fazer upload de uma imagem');
  console.log('   5. Veja os logs no terminal onde o servidor está rodando\n');
}

testUpload().catch(console.error);
