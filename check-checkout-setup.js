#!/usr/bin/env node

/**
 * Script de Setup Rápido do Checkout
 * Verifica configurações e fornece instruções passo a passo
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 SM Educa - Verificador de Setup do Checkout\n');
console.log('═'.repeat(60));

// Verificar .env.local
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('\n❌ Arquivo .env.local não encontrado!');
  console.log('\n📝 Passos:');
  console.log('1. Copie .env.example para .env.local');
  console.log('2. Preencha as variáveis obrigatórias\n');
  process.exit(1);
}

// Ler variáveis
const envContent = fs.readFileSync(envPath, 'utf-8');
const getEnvVar = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].replace(/['"]/g, '') : null;
};

console.log('\n📋 Status das Configurações:\n');

// Verificar Stripe
const stripePublic = getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
const stripeSecret = getEnvVar('STRIPE_SECRET_KEY');
const stripeWebhook = getEnvVar('STRIPE_WEBHOOK_SECRET');

console.log('🔐 Stripe:');
if (stripePublic && stripePublic.startsWith('pk_test_')) {
  console.log('  ✅ Publishable Key (Teste):', stripePublic.substring(0, 20) + '...');
} else if (stripePublic && stripePublic.startsWith('pk_live_')) {
  console.log('  ⚠️  Publishable Key (PRODUÇÃO!):', stripePublic.substring(0, 20) + '...');
} else {
  console.log('  ❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não configurada');
}

if (stripeSecret && stripeSecret.startsWith('sk_test_')) {
  console.log('  ✅ Secret Key (Teste):', stripeSecret.substring(0, 20) + '...');
} else if (stripeSecret && stripeSecret.startsWith('sk_live_')) {
  console.log('  ⚠️  Secret Key (PRODUÇÃO!):', stripeSecret.substring(0, 20) + '...');
} else {
  console.log('  ❌ STRIPE_SECRET_KEY não configurada');
}

if (stripeWebhook && stripeWebhook.startsWith('whsec_')) {
  console.log('  ✅ Webhook Secret configurado');
} else {
  console.log('  ⚠️  STRIPE_WEBHOOK_SECRET não configurado (necessário para webhooks)');
}

// Verificar NextAuth
const nextauthUrl = getEnvVar('NEXTAUTH_URL');
const nextauthSecret = getEnvVar('NEXTAUTH_SECRET');

console.log('\n🔑 NextAuth:');
if (nextauthUrl) {
  console.log('  ✅ NEXTAUTH_URL:', nextauthUrl);
} else {
  console.log('  ❌ NEXTAUTH_URL não configurada');
}

if (nextauthSecret && nextauthSecret.length >= 32) {
  console.log('  ✅ NEXTAUTH_SECRET configurado (seguro)');
} else if (nextauthSecret) {
  console.log('  ⚠️  NEXTAUTH_SECRET muito curto (min 32 caracteres)');
} else {
  console.log('  ❌ NEXTAUTH_SECRET não configurado');
}

// Verificar Database
const databaseUrl = getEnvVar('DATABASE_URL');

console.log('\n🗄️  Database:');
if (databaseUrl) {
  console.log('  ✅ DATABASE_URL configurada');
} else {
  console.log('  ❌ DATABASE_URL não configurada');
}

// Verificar Supabase
const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

console.log('\n☁️  Supabase Storage:');
if (supabaseUrl && supabaseKey) {
  console.log('  ✅ Configuração completa');
} else {
  console.log('  ⚠️  Configuração incompleta (upload de arquivos pode não funcionar)');
}

console.log('\n' + '═'.repeat(60));

// Resumo e próximos passos
const missingVars = [];
if (!stripePublic) missingVars.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
if (!stripeSecret) missingVars.push('STRIPE_SECRET_KEY');
if (!nextauthUrl) missingVars.push('NEXTAUTH_URL');
if (!nextauthSecret) missingVars.push('NEXTAUTH_SECRET');
if (!databaseUrl) missingVars.push('DATABASE_URL');

if (missingVars.length > 0) {
  console.log('\n❌ Variáveis faltando:', missingVars.join(', '));
  console.log('\n📖 Consulte CHECKOUT_SETUP_GUIDE.md para instruções completas\n');
  process.exit(1);
}

console.log('\n✅ Configuração básica OK!\n');

// Instruções de teste
if (!stripeWebhook) {
  console.log('📝 Próximos Passos:\n');
  console.log('1. Instalar Stripe CLI:');
  console.log('   Windows: scoop install stripe');
  console.log('   Mac: brew install stripe/stripe-cli/stripe');
  console.log('   Linux: Baixe de github.com/stripe/stripe-cli\n');

  console.log('2. Autenticar:');
  console.log('   stripe login\n');

  console.log('3. Iniciar webhook forwarding (em terminal separado):');
  console.log('   stripe listen --forward-to localhost:3000/api/webhooks/stripe\n');

  console.log('4. Copiar webhook secret (whsec_...) para .env.local');
  console.log('5. Reiniciar: npm run dev\n');
} else {
  console.log('🎯 Pronto para testar!\n');
  console.log('1. Inicie servidor: npm run dev');
  console.log('2. Em outro terminal: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
  console.log('3. Acesse: http://localhost:3000');
  console.log('4. Crie um curso como TEACHER');
  console.log('5. Compre como STUDENT com cartão: 4242 4242 4242 4242\n');
}

console.log('📚 Documentação completa: CHECKOUT_SETUP_GUIDE.md');
console.log('🧪 Cartões de teste: https://stripe.com/docs/testing#cards\n');
