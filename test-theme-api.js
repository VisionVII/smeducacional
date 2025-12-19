// Script para testar API do tema
fetch('http://localhost:3000/api/system/public-theme')
  .then(res => res.json())
  .then(data => {
    console.log('=== API /api/system/public-theme ===');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('Erro:', err));

fetch('http://localhost:3000/api/debug-theme')
  .then(res => res.json())
  .then(data => {
    console.log('\n=== API /api/debug-theme ===');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('Erro:', err));
