#!/usr/bin/env ts-node
/**
 * Script de teste para Feature Unlock System
 * Simula diferentes cenários de plano e verifica access control
 *
 * Executar: npx ts-node scripts/test-feature-unlock.ts
 */

import { prisma } from '../src/lib/db';
import {
  getTeacherAccessControl,
  canAccessFeature,
  hasActivePlan,
  activatePlan,
  activateTrial,
  cancelPlan,
} from '../src/lib/subscription';

async function main() {
  console.log('🧪 Iniciando testes de Feature Unlock System...\n');

  // Criar usuário de teste
  const testUserId = 'test-user-' + Date.now();
  console.log(`📝 Criando usuário de teste: ${testUserId}`);

  const user = await prisma.user.create({
    data: {
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      name: 'Test Professor',
      password: 'hashed-password',
      role: 'TEACHER',
      teacherFinancial: {
        create: {
          bank: 'Test Bank',
          agency: '0001',
          account: '123456',
          accountType: 'Corrente',
        },
      },
    },
  });

  console.log(`✅ Usuário criado: ${user.id}\n`);

  // Teste 1: Free Plan (padrão)
  console.log('📌 Teste 1: Verificar FREE PLAN (padrão)');
  let access = await getTeacherAccessControl(testUserId);
  console.log({
    plan: access.plan,
    isActive: access.isActive,
    canUploadLogo: access.canUploadLogo,
    canCustomizeDomain: access.canCustomizeDomain,
    maxStudents: access.maxStudents,
    maxStorageGB: access.maxStorageGB,
  });
  console.log(
    access.canUploadLogo === false
      ? '✅ PASS: Free plan não pode upload'
      : '❌ FAIL'
  );
  console.log();

  // Teste 2: Ativar Trial
  console.log('📌 Teste 2: Ativar TRIAL (7 dias)');
  access = await activateTrial(testUserId, 7);
  console.log({
    plan: access.plan,
    isTrial: access.isTrial,
    daysUntilExpiry: access.daysUntilExpiry,
  });
  console.log(access.isTrial ? '✅ PASS: Trial ativado' : '❌ FAIL');
  console.log();

  // Teste 3: Ativar Basic Plan
  console.log('📌 Teste 3: Ativar BASIC PLAN (30 dias)');
  access = await activatePlan(testUserId, 'basic', 30);
  console.log({
    plan: access.plan,
    isActive: access.isActive,
    canUploadLogo: access.canUploadLogo,
    canAccessAnalytics: access.canAccessAnalytics,
    maxStudents: access.maxStudents,
    maxStorageGB: access.maxStorageGB,
  });
  console.log(
    access.canUploadLogo === true
      ? '✅ PASS: Basic plan ativa upload'
      : '❌ FAIL'
  );
  console.log(
    access.canCustomizeDomain === false
      ? '✅ PASS: Basic plan não tem domínio'
      : '❌ FAIL'
  );
  console.log();

  // Teste 4: Upgrade para Premium
  console.log('📌 Teste 4: Fazer upgrade para PREMIUM PLAN');
  access = await activatePlan(testUserId, 'premium', 30);
  console.log({
    plan: access.plan,
    isActive: access.isActive,
    canUploadLogo: access.canUploadLogo,
    canCustomizeDomain: access.canCustomizeDomain,
    canAccessAnalytics: access.canAccessAnalytics,
    maxStudents: access.maxStudents,
    maxStorageGB: access.maxStorageGB,
  });
  console.log(
    access.canCustomizeDomain === true
      ? '✅ PASS: Premium plan ativa domínio'
      : '❌ FAIL'
  );
  console.log();

  // Teste 5: Verificar Feature Específica
  console.log('📌 Teste 5: canAccessFeature() para verificação granular');
  const canUpload = await canAccessFeature(testUserId, 'canUploadLogo');
  const canCustom = await canAccessFeature(testUserId, 'canCustomizeDomain');
  console.log({
    canUploadLogo: canUpload,
    canCustomizeDomain: canCustom,
  });
  console.log(
    canUpload && canCustom ? '✅ PASS: Features disponíveis' : '❌ FAIL'
  );
  console.log();

  // Teste 6: Verificar hasActivePlan()
  console.log('📌 Teste 6: hasActivePlan() para verificação rápida');
  const hasPlan = await hasActivePlan(testUserId);
  console.log({ hasActivePlan: hasPlan });
  console.log(hasPlan ? '✅ PASS: Plano ativo detectado' : '❌ FAIL');
  console.log();

  // Teste 7: Cancelar Plano
  console.log('📌 Teste 7: Cancelar PLANO');
  access = await cancelPlan(testUserId);
  console.log({
    plan: access.plan,
    subscriptionStatus: access.subscriptionStatus,
    isActive: access.isActive,
    canUploadLogo: access.canUploadLogo,
  });
  console.log(
    access.isActive === false ? '✅ PASS: Plano cancelado' : '❌ FAIL'
  );
  console.log();

  // Teste 8: Verificar Expiração
  console.log('📌 Teste 8: Simular PLANO EXPIRADO');
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await prisma.teacherFinancial.update({
    where: { userId: testUserId },
    data: {
      subscriptionStatus: 'active',
      plan: 'premium',
      subscriptionExpiresAt: yesterday, // Expirado ontem
    },
  });

  access = await getTeacherAccessControl(testUserId);
  console.log({
    isExpired: access.isExpired,
    isActive: access.isActive,
    canUploadLogo: access.canUploadLogo, // Deve ser false mesmo com premium
  });
  console.log(
    access.isExpired && !access.canUploadLogo
      ? '✅ PASS: Expiração bloqueia features'
      : '❌ FAIL'
  );
  console.log();

  // Limpeza
  console.log('🧹 Limpando dados de teste...');
  await prisma.user.delete({ where: { id: testUserId } });
  console.log('✅ Usuário de teste removido\n');

  console.log('✨ Todos os testes completados!');
}

main()
  .catch((error) => {
    console.error('❌ Erro durante testes:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
