#!/usr/bin/env node

/**
 * Script para testar Cron Job de Remarketing
 * Uso: node scripts/test-cron.js
 */

const https = require('https');
const http = require('http');

// Configuração
const CRON_SECRET = process.env.CRON_SECRET || '6608c17e9f49886b0b469f4b9754c7dc74e4286cba82469bd48ebe2e9a0f1b43';
const VERCEL_URL = process.env.VERCEL_URL || 'https://smeducacional.vercel.app';
const ENDPOINT = '/api/cron/remarketing';

console.log('\n📊 === TESTE DE CRON JOB ===\n');
console.log(`🔗 URL: ${VERCEL_URL}${ENDPOINT}`);
console.log(`🔐 Secret: ${CRON_SECRET.substring(0, 10)}...${CRON_SECRET.substring(-10)}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

// Fazer request
const url = new URL(VERCEL_URL + ENDPOINT);
const protocol = url.protocol === 'https:' ? https : http;

const options = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Cron-Test-Script'
  }
};

console.log('📤 Enviando request...\n');

const req = protocol.request(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);

    try {
      const json = JSON.parse(data);
      console.log(`📄 Response:\n${JSON.stringify(json, null, 2)}`);

      if (res.statusCode === 200) {
        console.log('\n✅ ✅ ✅ SUCESSO! Cron job executado!\n');
        process.exit(0);
      } else {
        console.log(`\n⚠️ Status ${res.statusCode} - Verifique configuração\n`);
        process.exit(1);
      }
    } catch (e) {
      console.error('Erro ao parsear JSON da resposta:', e);
      console.log(`📝 Response (texto): ${data}\n`);
      process.exit(res.statusCode === 200 ? 0 : 1);
    }
  });
});

req.on('error', (error) => {
  console.error(`\n❌ ERRO: ${error.message}\n`);
  console.log('💡 Dicas:');
  console.log('  1. Site Vercel está online?');
  console.log('  2. CRON_SECRET está correto?');
  console.log('  3. Endpoint /api/cron/remarketing existe?\n');
  process.exit(1);
});

req.end();
