import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
} from './provider';

// Placeholder MBWay/MBay provider. Substitua com SDK/REST oficial.
export const mbayProvider: PaymentProvider = {
  id: 'mbay',
  async createSession(input: CheckoutRequest): Promise<CheckoutSession> {
    // Exemplo: criar link de pagamento via API externa
    // const resp = await fetch(process.env.MBAY_API_URL + '/payments', { ... })
    // return { id: resp.id, url: resp.checkout_url }

    if (!process.env.MBAY_API_URL) {
      throw new Error('MBAY_API_URL não configurada');
    }
    // Retorna URL genérica até a integração real
    return {
      id: `${input.courseId}-${Date.now()}`,
      url: `${process.env.MBAY_API_URL}/checkout?courseId=${input.courseId}&user=${input.userId}`,
    };
  },
};
