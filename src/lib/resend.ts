// Stub mínimo para evitar erro de importação e permitir mock em dev
export const resend = {
  emails: {
    send: async (opts: Record<string, unknown>) => {
      // Aqui você pode integrar com a API real do Resend ou mockar para dev
      const safeLog = {
        to: (opts as { to?: unknown }).to,
        subject: (opts as { subject?: unknown }).subject,
      };
      console.log('[Resend Stub] Email enviado (stub):', safeLog);
      return { id: 'mocked-email-id' };
    },
  },
};
