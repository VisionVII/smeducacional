import { NextRequest } from 'next/server';
import { getSystemStatus } from '@/lib/services/system.service';

/**
 * GET /api/system/maintenance-stream
 * Server-Sent Events (SSE) para notificações em tempo real
 *
 * Clients podem usar EventSource API para receber atualizações
 * sobre estado de manutenção do sistema
 *
 * Exemplo cliente:
 * const es = new EventSource('/api/system/maintenance-stream');
 * es.onmessage = (e) => {
 *   const { maintenance, estimatedReturn } = JSON.parse(e.data);
 *   if (!maintenance) window.location.reload();
 * };
 */

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1️⃣ ENVIA STATUS INICIAL
      const initial = await getSystemStatus();
      const initialData = {
        maintenance: initial?.maintenanceMode ?? false,
        estimatedReturn: initial?.estimatedReturnTime,
        message: initial?.maintenanceMessage,
      };

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
      );

      // 2️⃣ POLLING (simula push em intervalos)
      const interval = setInterval(async () => {
        try {
          const current = await getSystemStatus();
          const data = {
            maintenance: current?.maintenanceMode ?? false,
            estimatedReturn: current?.estimatedReturnTime,
            message: current?.maintenanceMessage,
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          console.error('SSE polling error:', error);
        }
      }, 3000); // Check a cada 3 segundos

      // 3️⃣ CLEANUP on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Para nginx/reverse proxy
    },
  });
}
