#!/usr/bin/env node

/**
 * 🔒 SecureOpsAI - CLI Entry Point
 *
 * Interface de linha de comando para o agente de segurança
 *
 * Uso:
 *   npm run ai:security                    # Scan completo
 *   npm run ai:security -- --quick         # Scan rápido
 *   npm run ai:security -- --file <path>   # Scan arquivo específico
 *   npm run ai:security -- --auto-fix      # Com auto-fix (experimental)
 */

import { SecurityScanner } from './scanner';
import { DEFAULT_SCAN_CONFIG } from './config';
import { ScanConfig, ScanResult } from './types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Parse CLI arguments
const args = process.argv.slice(2);
const flags = {
  quick: args.includes('--quick'),
  deep: args.includes('--deep'),
  autoFix: args.includes('--auto-fix'),
  file: args.find((arg, i) => args[i - 1] === '--file'),
  help: args.includes('--help') || args.includes('-h'),
};

// Help
if (flags.help) {
  console.log(`
🔒 SecureOpsAI - Agente de Segurança & Compliance

Uso:
  npm run ai:security [opções]

Opções:
  --quick              Scan rápido (apenas regras estáticas)
  --deep               Scan profundo (GPT-4 em todos arquivos)
  --file <caminho>     Escanear arquivo específico
  --auto-fix           Auto-aplicar correções (experimental)
  --help, -h           Mostra esta ajuda

Exemplos:
  npm run ai:security
  npm run ai:security -- --quick
  npm run ai:security -- --file src/app/api/admin/users/route.ts
  npm run ai:security -- --auto-fix

Variáveis de Ambiente:
  OPENAI_API_KEY       API key da OpenAI (obrigatório)
  AI_SCAN_DEPTH        quick | full | deep
  AI_AUTO_FIX          true | false
  AI_BLOCK_INSECURE    true | false

Desenvolvido por VisionVII - https://visionvii.com
  `);
  process.exit(0);
}

// Validar API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Erro: OPENAI_API_KEY não definida!');
  console.error('Configure em .env ou exporte: export OPENAI_API_KEY=sk-...\n');
  process.exit(1);
}

/**
 * Main function
 */
async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║              🔒 SecureOpsAI v1.0                          ║');
  console.log('║         Agente de Segurança & Compliance                   ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // Configurar scan
  const config: ScanConfig = {
    ...DEFAULT_SCAN_CONFIG,
    depth: flags.quick
      ? 'quick'
      : flags.deep
      ? 'deep'
      : DEFAULT_SCAN_CONFIG.depth,
    autoFix: flags.autoFix || DEFAULT_SCAN_CONFIG.autoFix,
  };

  console.log('⚙️  Configuração:');
  console.log(`   Modo: ${config.depth.toUpperCase()}`);
  console.log(`   Auto-fix: ${config.autoFix ? 'Ativo' : 'Inativo'}`);
  console.log(`   Bloquear inseguro: ${config.blockInsecure ? 'Sim' : 'Não'}`);
  console.log(`   Severidade mínima: ${config.minSeverity}`);
  console.log('');

  // Criar scanner
  const scanner = new SecurityScanner(config);

  // Executar scan
  const targetFiles = flags.file ? [flags.file] : undefined;
  const result: ScanResult = await scanner.scan(targetFiles);

  // Exibir resultado
  displayResult(result);

  // Salvar relatório
  await saveReport(result);

  // Exit code
  if (result.blocked) {
    console.error(
      '\n❌ SCAN BLOQUEADO: Corrija vulnerabilidades críticas antes de prosseguir!\n'
    );
    process.exit(1);
  } else if (result.summary.HIGH > 0) {
    console.warn(
      '\n⚠️  ATENÇÃO: Vulnerabilidades de alta severidade detectadas!\n'
    );
    process.exit(0);
  } else {
    console.log('\n✅ Scan concluído com sucesso!\n');
    process.exit(0);
  }
}

/**
 * Exibe resultado do scan no terminal
 */
function displayResult(result: ScanResult) {
  console.log(
    '\n═══════════════════════════════════════════════════════════\n'
  );
  console.log('📊 RESUMO DO SCAN\n');
  console.log(`   Arquivos escaneados: ${result.filesScanned}`);
  console.log(`   Duração: ${result.scanDuration}`);
  console.log(`   Issues encontradas: ${result.issuesFound}`);
  console.log(`   Compliance Score: ${result.complianceScore}/100`);
  console.log('');

  // Severidades
  console.log('📈 POR SEVERIDADE:\n');
  const { summary } = result;

  if (summary.CRITICAL > 0) {
    console.log(`   🔴 CRITICAL: ${summary.CRITICAL}`);
  }
  if (summary.HIGH > 0) {
    console.log(`   🟠 HIGH: ${summary.HIGH}`);
  }
  if (summary.MEDIUM > 0) {
    console.log(`   🟡 MEDIUM: ${summary.MEDIUM}`);
  }
  if (summary.LOW > 0) {
    console.log(`   🔵 LOW: ${summary.LOW}`);
  }
  if (summary.INFO > 0) {
    console.log(`   ⚪ INFO: ${summary.INFO}`);
  }

  if (result.issuesFound === 0) {
    console.log('   ✅ Nenhuma issue detectada!');
  }

  console.log('');

  // Top 5 issues
  if (result.issues.length > 0) {
    console.log('🔍 TOP ISSUES:\n');
    result.issues.slice(0, 5).forEach((issue, idx) => {
      const icon = getSeverityIcon(issue.severity);
      console.log(
        `   ${idx + 1}. ${icon} [${issue.severity}] ${issue.message}`
      );
      console.log(`      Arquivo: ${issue.file}:${issue.line}`);
      console.log(`      Sugestão: ${issue.suggestion}`);
      console.log('');
    });

    if (result.issues.length > 5) {
      console.log(`   ... e mais ${result.issues.length - 5} issues\n`);
    }
  }

  // Recomendações
  if (result.recommendations.length > 0) {
    console.log('💡 RECOMENDAÇÕES:\n');
    result.recommendations.forEach((rec) => {
      console.log(`   ${rec}`);
    });
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

/**
 * Salva relatório em arquivo JSON
 */
async function saveReport(result: ScanResult) {
  const reportDir = join(process.cwd(), 'salao-ia', 'reports', 'security');

  try {
    await mkdir(reportDir, { recursive: true });

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5);
    const fileName = `${timestamp}.json`;
    const filePath = join(reportDir, fileName);

    await writeFile(filePath, JSON.stringify(result, null, 2));

    // Também salvar como latest.json
    const latestPath = join(reportDir, 'latest.json');
    await writeFile(latestPath, JSON.stringify(result, null, 2));

    console.log(`📄 Relatório salvo: ${filePath}`);
  } catch (error) {
    console.error('⚠️  Erro ao salvar relatório:', error);
  }
}

/**
 * Retorna ícone baseado na severidade
 */
function getSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🔵',
    INFO: '⚪',
  };
  return icons[severity] || '⚪';
}

// Run
main().catch((error) => {
  console.error('\n❌ Erro fatal:', error.message);
  console.error(error.stack);
  process.exit(1);
});
