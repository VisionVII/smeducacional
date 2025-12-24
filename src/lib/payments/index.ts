import type { CheckoutProvider, PaymentProvider } from './provider';
import { stripeProvider, stripePixProvider } from './stripe';
import { mbayProvider } from './mbay';

const providers: Record<CheckoutProvider, PaymentProvider> = {
  stripe: stripeProvider,
  stripe_pix: stripePixProvider,
  mbay: mbayProvider,
};

export function getProvider(id: CheckoutProvider): PaymentProvider {
  return providers[id];
}
