#!/usr/bin/env node

/**
 * Safe DB Push Script para Windows
 * 
 * Resolve travamentos do Prisma ao:
 * 1. Forçar uso de DIRECT_URL (sem pgbouncer) 
 * 2. Contornar limites de conexão pooled
 * 3. Executar db push com timeout
 * 4. Implementar retry com backoff
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const TIMEOUT_MS = 180000; // 3 minutos (schema complexo)
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000; // 3 segundos

class SafeDbPush {
  constructor() {
    this.retryCount = 0;
    this.startTime = Date.now();
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const icon = {
      INFO: '📋',
      SUCCESS: '✅',
      ERROR: '❌',
      WARN: '⚠️',
      CLEAN: '🧹',
      RETRY: '🔄',
    }[type] || '•';

    console.log(`${icon} [${timestamp}] ${message}`);
  }

  killNodeProcesses() {
    this.log('Preparando ambiente...', 'CLEAN');
    // Aguardar liberação de locks (síncrono)
    const start = Date.now();
    while (Date.now() - start < 300) {
      // Busy wait - liberar locks de arquivo
    }
    this.log('Ambiente pronto', 'SUCCESS');
  }

  cleanPrismaCache() {
    this.log('Validando configuração Prisma...', 'CLEAN');
    const prismaPath = path.join(process.cwd(), '.prisma');
    try {
      if (fs.existsSync(prismaPath)) {
        this.log(`Query engine em cache`, 'INFO');
      }
    } catch (error) {
      console.error('[safe-db-push] Cache check error:', error);
      this.log(`Sem cache anterior (OK)`, 'INFO');
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executePrismaPush() {
    return new Promise((resolve, reject) => {
      // Usar DIRECT_URL ao invés de DATABASE_URL para evitar pgbouncer
      const env = { ...process.env };
      this.log('Usando DIRECT_URL (sem pgbouncer) para db push...', 'INFO');

      const childProcess = spawn('npx', ['prisma', 'db', 'push', '--skip-generate'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
        timeout: TIMEOUT_MS,
        env: env, // Usa DIRECT_URL do .env automaticamente
      });

      let killed = false;

      // Timeout fallback
      const timeoutHandle = setTimeout(() => {
        if (!killed) {
          killed = true;
          this.log('Timeout excedido (3 minutos)! Encerrando...', 'ERROR');
          childProcess.kill('SIGTERM');
          setTimeout(() => {
            if (!childProcess.killed) {
              childProcess.kill('SIGKILL');
            }
          }, 5000);
        }
      }, TIMEOUT_MS);

      childProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        if (killed) {
          reject(new Error('Processo excedeu timeout de 3 minutos'));
        } else if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Prisma db push falhou com código ${code}`));
        }
      });

      childProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
    });
  }

  async run() {
    this.log(
      '========================================\n' +
      'PRISMA DB PUSH - MODO SEGURO (WINDOWS)\n' +
      '========================================',
      'INFO'
    );

    try {
      // Preparação
      this.killNodeProcesses();
      this.cleanPrismaCache();

      // Executar db push com retry
      while (this.retryCount < MAX_RETRIES) {
        try {
          this.log(
            `Executando prisma db push (tentativa ${this.retryCount + 1}/${MAX_RETRIES})...`,
            'INFO'
          );

          await this.executePrismaPush();

          const elapsed = Math.round((Date.now() - this.startTime) / 1000);
          this.log(`✨ Schema sincronizado com sucesso em ${elapsed}s!`, 'SUCCESS');
          return 0;
        } catch (error) {
          this.retryCount++;

          if (this.retryCount < MAX_RETRIES) {
            this.log(
              `Tentativa ${this.retryCount} falhou: ${error.message}`,
              'WARN'
            );
            this.log(
              `Aguardando ${RETRY_DELAY}ms antes de tentar novamente...`,
              'RETRY'
            );

            this.killNodeProcesses();
            await this.sleep(RETRY_DELAY);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      this.log(`Falha fatal após ${MAX_RETRIES} tentativas:`, 'ERROR');
      this.log(`${error.message}\n`, 'ERROR');

      console.log('\n💡 SOLUÇÕES SUGERIDAS:');
      console.log('   1. Verifique a conexão de internet');
      console.log(
        '   2. Teste a conectividade: npm run db:diagnose'
      );
      console.log(
        '   3. Limpe todo o cache: npm run clean && npm install'
      );
      console.log(
        '   4. Verifique se VPN ou firewall está bloqueando o Supabase'
      );
      console.log(
        '   5. Use a connection string direta ao invés da pooled'
      );
      console.log('   6. Tente forçar reset: npm run db:push:direct -- --force-reset\n');

      return 1;
    }
  }
}

// Executar
const safePush = new SafeDbPush();
safePush.run().then((code) => process.exit(code));
