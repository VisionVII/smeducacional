import { NextResponse } from 'next/server';
import { runAllRemarketingJobs } from '@/lib/remarketing';

/**
 * POST /api/cron/remarketing
 *
 * Executa jobs de remarketing e envio de emails
 * Protegido por CRON_SECRET para evitar abuso
 *
 * Pode ser chamado por:
 * - Vercel Crons
 * - GitHub Actions
 * - Outras soluções de agendamento
 */
export async function POST(request: Request) {
  try {
    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedToken) {
      console.warn(
        '⚠️ Tentativa de acesso ao endpoint de cron sem autenticação válida'
      );
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔔 Iniciando job de cron de remarketing');

    // Executar jobs de remarketing
    await runAllRemarketingJobs();

    return NextResponse.json({
      success: true,
      message: 'Remarketing jobs executados com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao executar cron de remarketing:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/remarketing
 * Endpoint de status (apenas para verificação)
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/cron/remarketing',
    methods: ['POST'],
    description: 'Executa jobs de remarketing e envio de emails',
    lastUpdate: '2025-12-08',
  });
}
