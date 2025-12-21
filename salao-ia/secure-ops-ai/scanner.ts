/**
 * 🔒 SecureOpsAI - Security Scanner
 *
 * Motor principal de análise de segurança usando GPT-4
 */

import OpenAI from 'openai';
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { parse } from '@typescript-eslint/parser';
import {
  SecurityIssue,
  ScanResult,
  ScanConfig,
  GPTAnalysisRequest,
  GPTAnalysisResponse,
} from './types';
import { ALL_RULES } from './rules';
import {
  OPENAI_CONFIG,
  SECURITY_SYSTEM_PROMPT,
  ANALYSIS_PROMPT_TEMPLATE,
} from './config';

export class SecurityScanner {
  private openai: OpenAI;
  private config: ScanConfig;
  private issues: SecurityIssue[] = [];
  private filesScanned = 0;
  private startTime: number = 0;

  constructor(config: ScanConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: OPENAI_CONFIG.apiKey,
    });
  }

  /**
   * Executa scan completo do projeto
   */
  async scan(targetFiles?: string[]): Promise<ScanResult> {
    this.startTime = Date.now();
    this.issues = [];
    this.filesScanned = 0;

    console.log('🔒 SecureOpsAI - Iniciando scan de segurança...\n');

    // 1. Descobrir arquivos para scan
    const files = targetFiles || (await this.discoverFiles());
    console.log(`📁 Arquivos a escanear: ${files.length}\n`);

    // 2. Scan de regras estáticas (rápido)
    console.log('⚡ Fase 1: Análise estática...');
    await this.staticAnalysis(files);

    // 3. Scan com GPT-4 (profundo, apenas arquivos críticos)
    if (this.config.depth !== 'quick') {
      console.log('\n🧠 Fase 2: Análise com GPT-4...');
      await this.gptAnalysis(files);
    }

    // 4. Gerar relatório
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`\n✅ Scan completo em ${duration}s\n`);

    return this.generateReport(duration);
  }

  /**
   * Descobre arquivos para escanear
   */
  private async discoverFiles(): Promise<string[]> {
    const patterns = [
      'src/app/api/**/*.ts',
      'src/app/**/*.tsx',
      'src/lib/**/*.ts',
      'src/components/**/*.tsx',
      'middleware.ts',
      'next.config.ts',
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        ignore: this.config.ignorePaths,
      });
      files.push(...matches);
    }

    return [...new Set(files)];
  }

  /**
   * Análise estática com regras predefinidas
   */
  private async staticAnalysis(files: string[]): Promise<void> {
    for (const file of files) {
      this.filesScanned++;
      const code = await readFile(file, 'utf-8');

      // Aplicar cada regra
      for (const rule of ALL_RULES) {
        const matches = this.checkRule(code, file, rule);
        if (matches) {
          this.issues.push(...matches);
        }
      }

      // Progress
      if (this.filesScanned % 10 === 0) {
        process.stdout.write(
          `\r   ${this.filesScanned}/${files.length} arquivos escaneados...`
        );
      }
    }
  }

  /**
   * Verifica uma regra específica
   */
  private checkRule(
    code: string,
    filePath: string,
    rule: any
  ): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Regra com pattern regex
    if (rule.pattern && rule.pattern.test(code)) {
      // Se tem customCheck, verificar também
      if (rule.customCheck && !rule.customCheck(code, filePath)) {
        return issues;
      }

      // Encontrar linha do match
      const lines = code.split('\n');
      const lineNumber = lines.findIndex((line) => rule.pattern.test(line));

      if (lineNumber !== -1) {
        issues.push({
          id: `${rule.id}-${Date.now()}`,
          ruleId: rule.id,
          severity: rule.severity,
          category: rule.category,
          file: filePath,
          line: lineNumber + 1,
          message: rule.description,
          code: lines[lineNumber].trim(),
          suggestion: rule.suggestion,
          owaspReference: rule.owaspReference,
          timestamp: new Date().toISOString(),
        });
      }
    }
    // Regra apenas com customCheck
    else if (rule.customCheck && rule.customCheck(code, filePath)) {
      issues.push({
        id: `${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        severity: rule.severity,
        category: rule.category,
        file: filePath,
        line: 1,
        message: rule.description,
        code: '(Ver arquivo completo)',
        suggestion: rule.suggestion,
        owaspReference: rule.owaspReference,
        timestamp: new Date().toISOString(),
      });
    }

    return issues;
  }

  /**
   * Análise profunda com GPT-4
   */
  private async gptAnalysis(files: string[]): Promise<void> {
    // Apenas arquivos críticos (API routes)
    const criticalFiles = files.filter(
      (f) =>
        f.includes('/api/') &&
        !f.includes('/api/auth/[...nextauth]') &&
        !f.includes('.test.')
    );

    let analyzed = 0;
    for (const file of criticalFiles) {
      analyzed++;
      const code = await readFile(file, 'utf-8');

      // Contexto do arquivo
      const context = {
        isApiRoute: file.includes('/api/'),
        isComponent: file.endsWith('.tsx'),
        hasAuth: /await\s+auth\(\)/.test(code),
        hasValidation: /\.safeParse\(/.test(code),
      };

      try {
        const gptIssues = await this.analyzeWithGPT(code, file, context);
        this.issues.push(...gptIssues);
      } catch (error) {
        console.error(`   ⚠️ Erro ao analisar ${file}:`, error);
      }

      process.stdout.write(
        `\r   ${analyzed}/${criticalFiles.length} API routes analisadas com GPT...`
      );
    }
  }

  /**
   * Analisa código com GPT-4
   */
  private async analyzeWithGPT(
    code: string,
    filePath: string,
    context: any
  ): Promise<SecurityIssue[]> {
    const prompt = ANALYSIS_PROMPT_TEMPLATE(code, filePath, context);

    const completion = await this.openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        { role: 'system', content: SECURITY_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: OPENAI_CONFIG.maxTokens,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    if (!response) return [];

    const analysis: GPTAnalysisResponse = JSON.parse(response);

    return analysis.issues.map((issue, idx) => ({
      id: `GPT-${Date.now()}-${idx}`,
      ruleId: 'GPT-ANALYSIS',
      severity: issue.severity,
      category: issue.category,
      file: filePath,
      line: issue.line,
      message: issue.message,
      code: code.split('\n')[issue.line - 1]?.trim() || '',
      suggestion: issue.suggestion,
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Gera relatório final
   */
  private generateReport(duration: string): ScanResult {
    const summary = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0,
    };

    this.issues.forEach((issue) => {
      summary[issue.severity]++;
    });

    // Filtrar por severidade mínima
    const filteredIssues = this.issues.filter((issue) =>
      this.shouldIncludeIssue(issue)
    );

    // Determinar se deve bloquear
    const blocked =
      this.config.blockInsecure && (summary.CRITICAL > 0 || summary.HIGH > 0);

    return {
      timestamp: new Date().toISOString(),
      scanDuration: `${duration}s`,
      filesScanned: this.filesScanned,
      issuesFound: filteredIssues.length,
      blocked,
      summary,
      issues: filteredIssues,
      recommendations: this.generateRecommendations(summary),
      complianceScore: this.calculateComplianceScore(summary),
    };
  }

  /**
   * Determina se issue deve ser incluída
   */
  private shouldIncludeIssue(issue: SecurityIssue): boolean {
    const severityOrder = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const minIndex = severityOrder.indexOf(this.config.minSeverity);
    const issueIndex = severityOrder.indexOf(issue.severity);

    return issueIndex >= minIndex;
  }

  /**
   * Gera recomendações gerais
   */
  private generateRecommendations(summary: any): string[] {
    const recs: string[] = [];

    if (summary.CRITICAL > 0) {
      recs.push(
        '🚨 URGENTE: Corrija vulnerabilidades CRITICAL antes de deploy!'
      );
    }

    if (summary.HIGH > 0) {
      recs.push(
        '⚠️ Priorize correção de issues HIGH (autenticação e validação)'
      );
    }

    if (summary.MEDIUM > 5) {
      recs.push('📝 Considere refatorar código para reduzir issues MEDIUM');
    }

    recs.push('✅ Use pre-commit hook para scan automático');
    recs.push('📚 Consulte OWASP Top 10 para referências');

    return recs;
  }

  /**
   * Calcula score de compliance (0-100)
   */
  private calculateComplianceScore(summary: any): number {
    const weights = {
      CRITICAL: 10,
      HIGH: 5,
      MEDIUM: 2,
      LOW: 1,
      INFO: 0,
    };

    const totalPenalty =
      summary.CRITICAL * weights.CRITICAL +
      summary.HIGH * weights.HIGH +
      summary.MEDIUM * weights.MEDIUM +
      summary.LOW * weights.LOW;

    const maxScore = 100;
    const score = Math.max(0, maxScore - totalPenalty);

    return Math.round(score);
  }
}
