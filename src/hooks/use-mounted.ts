import { useEffect, useState } from 'react';

/**
 * Hook para detectar quando o componente está montado no cliente.
 * Útil para evitar erros de hidratação em componentes que dependem
 * de valores que mudam entre servidor e cliente (pathname, window, etc).
 *
 * @returns {boolean} true se o componente está montado no cliente
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mounted = useMounted();
 *   const pathname = usePathname();
 *
 *   const isActive = mounted && pathname === '/some-path';
 *
 *   return <div className={isActive ? 'active' : ''}> ... </div>;
 * }
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
