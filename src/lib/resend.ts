// Stub mínimo para evitar erro de importação e permitir mock em dev
export const resend = {
  emails: {
    send: async (opts: any) => {
      // Aqui você pode integrar com a API real do Resend ou mockar para dev
      console.log('[Resend Stub] Email enviado:', opts);
      return { id: 'mocked-email-id' };
    },
  },
};
