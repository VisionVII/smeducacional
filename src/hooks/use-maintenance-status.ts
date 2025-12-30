'use client';

import { useState, useEffect } from 'react';

interface MaintenanceStatus {
  maintenance: boolean;
  estimatedReturn?: Date;
  message?: string;
}

/**
 * Hook: useMaintenanceStatus
 * Monitora estado de manutenção via SSE
 * Se voltou do modo manutenção, recarrega a página
 */
export function useMaintenanceStatus() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [estimatedReturn, setEstimatedReturn] = useState<Date | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Tenta conectar ao SSE
    const eventSource = new EventSource('/api/system/maintenance-stream');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: MaintenanceStatus = JSON.parse(event.data);

        // Atualiza estado
        setIsMaintenance(data.maintenance);
        setEstimatedReturn(
          data.estimatedReturn ? new Date(data.estimatedReturn) : null
        );
        setMessage(data.message || '');

        // Se voltou da manutenção, recarrega
        if (!data.maintenance && isMaintenance) {
          console.log('System back online, reloading...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to parse maintenance status:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      // Reconecta automaticamente (EventSource faz retry por padrão)
    };

    return () => {
      eventSource.close();
    };
  }, [isMaintenance]);

  return {
    isMaintenance,
    estimatedReturn,
    message,
    isConnected,
  };
}
