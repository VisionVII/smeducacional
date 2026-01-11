import { z } from 'zod';

// Schema para validação
export const cartItemSchema = z.object({
  courseId: z.string().min(1, 'ID do curso é obrigatório'),
  title: z.string().min(1, 'Título do curso é obrigatório'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  compareAtPrice: z
    .number()
    .min(0, 'Preço comparativo não pode ser negativo')
    .optional(),
  discount: z
    .number()
    .min(0)
    .max(100, 'Desconto não pode ser maior que 100%')
    .optional(),
  thumbnail: z.string().url('URL de thumbnail inválida').optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export interface CartState {
  items: CartItem[];
  total: number;
  discountedTotal: number;
}

const CART_STORAGE_KEY = 'sm-educa-cart';
const COMMISSION_RATE = 0.95; // 95% para o instrutor (5% de taxa na plataforma)

/**
 * CartService: Gerencia o carrinho de compras com localStorage
 */
class CartServiceClass {
  /**
   * Adiciona um curso ao carrinho
   */
  addToCart(item: CartItem): void {
    try {
      // Validar o item
      const validatedItem = cartItemSchema.parse(item);

      // Obter carrinho atual
      const cart = this.getCart();

      // Verificar se já existe
      const existingIndex = cart.items.findIndex(
        (i) => i.courseId === validatedItem.courseId
      );

      if (existingIndex >= 0) {
        // Curso já no carrinho - atualizar
        cart.items[existingIndex] = validatedItem;
      } else {
        // Novo curso - adicionar
        cart.items.push(validatedItem);
      }

      // Recalcular totais
      this.updateCartTotals(cart);

      // Salvar
      this.saveCart(cart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Erro ao adicionar item ao carrinho:', error.errors);
        throw new Error('Dados do item inválidos');
      }
      throw error;
    }
  }

  /**
   * Remove um curso do carrinho
   */
  removeFromCart(courseId: string): void {
    const cart = this.getCart();
    cart.items = cart.items.filter((item) => item.courseId !== courseId);
    this.updateCartTotals(cart);
    this.saveCart(cart);
  }

  /**
   * Retorna o carrinho completo com totais
   */
  getCart(): CartState {
    if (typeof window === 'undefined') {
      // Server-side - retornar carrinho vazio
      return { items: [], total: 0, discountedTotal: 0 };
    }

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) {
        return { items: [], total: 0, discountedTotal: 0 };
      }

      const parsed = JSON.parse(stored) as CartState;
      return parsed;
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      return { items: [], total: 0, discountedTotal: 0 };
    }
  }

  /**
   * Limpa o carrinho completamente
   */
  clearCart(): void {
    this.saveCart({ items: [], total: 0, discountedTotal: 0 });
  }

  /**
   * Calcula o total incluindo descontos
   */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      const finalPrice = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + finalPrice;
    }, 0);
  }

  /**
   * Calcula o total original (sem descontos)
   */
  calculateOriginalTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      const originalPrice = item.compareAtPrice || item.price;
      return total + originalPrice;
    }, 0);
  }

  /**
   * Calcula a comissão do instrutor (95% do preço final para plano FREE)
   * Nota: Instrutores com plano PAGO recebem 100%
   */
  calculateCommission(total: number): number {
    return total * COMMISSION_RATE;
  }

  /**
   * Retorna o desconço total em reais
   */
  calculateTotalDiscount(items: CartItem[]): number {
    return this.calculateOriginalTotal(items) - this.calculateTotal(items);
  }

  /**
   * Retorna quantidade de itens no carrinho
   */
  getCartCount(): number {
    const cart = this.getCart();
    return cart.items.length;
  }

  /**
   * Verifica se um curso está no carrinho
   */
  isInCart(courseId: string): boolean {
    const cart = this.getCart();
    return cart.items.some((item) => item.courseId === courseId);
  }

  /**
   * Cria um pedido (checkout) com os itens do carrinho
   * Este é um método mock que será expandido com API chamada
   */
  async checkout(
    items: CartItem[]
  ): Promise<{ orderId: string; total: number }> {
    if (items.length === 0) {
      throw new Error('Carrinho vazio');
    }

    try {
      // Chamar API de checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            courseId: item.courseId,
            price: item.price,
            discount: item.discount || 0,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar checkout');
      }

      const data = await response.json();

      // Limpar carrinho após sucesso
      this.clearCart();

      return data;
    } catch (error) {
      console.error('Erro no checkout:', error);
      throw error;
    }
  }

  /**
   * PRIVADO: Atualiza os totais do carrinho
   */
  private updateCartTotals(cart: CartState): void {
    cart.total = this.calculateOriginalTotal(cart.items);
    cart.discountedTotal = this.calculateTotal(cart.items);
  }

  /**
   * PRIVADO: Salva o carrinho no localStorage
   */
  private saveCart(cart: CartState): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      // Disparar evento de mudança
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }
}

// Exportar singleton
export const CartService = new CartServiceClass();
