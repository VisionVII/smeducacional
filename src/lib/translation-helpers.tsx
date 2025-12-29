import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook para usar toasts traduzidos
 * Exemplo:
 * const toast = useTranslatedToast();
 * toast.success('saved');
 */
export function useTranslatedToast() {
  const { t, mounted } = useTranslations();
  const { toast } = useToast();

  return {
    success: (
      key: keyof typeof t.toasts.success,
      variables?: Record<string, string>
    ) => {
      if (!mounted) return;
      let message = t.toasts.success[key] || 'Success';

      if (variables) {
        Object.entries(variables).forEach(([k, v]) => {
          message = message.replace(`{${k}}`, v);
        });
      }

      toast({
        title: t.common.success,
        description: message,
        variant: 'default',
        className: 'bg-green-500 text-white border-none',
      });
    },
    error: (
      key: keyof typeof t.toasts.error,
      variables?: Record<string, string>
    ) => {
      if (!mounted) return;
      let message = t.toasts.error[key] || 'Error';

      if (variables) {
        Object.entries(variables).forEach(([k, v]) => {
          message = message.replace(`{${k}}`, v);
        });
      }

      toast({
        title: t.common.error,
        description: message,
        variant: 'destructive',
      });
    },
    upload: (
      key: keyof typeof t.toasts.upload,
      variables?: Record<string, string>
    ) => {
      if (!mounted) return;
      let message = t.toasts.upload[key] || 'Upload';

      if (variables) {
        Object.entries(variables).forEach(([k, v]) => {
          message = message.replace(`{${k}}`, v);
        });
      }

      toast({
        title: t.common.info,
        description: message,
      });
    },
  };
}

/**
 * Função para interpolar variáveis em strings de tradução
 * Exemplo: format("Olá {name}", { name: "João" }) -> "Olá João"
 */
export function format(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/{(\w+)}/g, (_, key) => String(values[key] || ''));
}

/**
 * Componente para renderizar texto traduzido inline (útil para partes de texto)
 */
export function T({ k }: { k: string }) {
  const { t, mounted } = useTranslations();
  if (!mounted) return null;

  // Navegação profunda no objeto t usando string path (ex: "home.hero.title")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = k.split('.').reduce((obj: any, key) => obj?.[key], t);

  return <>{value || k}</>;
}
