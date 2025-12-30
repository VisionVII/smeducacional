import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/health
 * Health check endpoint - sempre funciona mesmo durante manutenção
 * Monitora saúde da aplicação
 */

export async function GET() {
  try {
    // Testa conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
