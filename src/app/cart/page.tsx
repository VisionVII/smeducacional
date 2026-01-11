'use client';

import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="mb-6">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/50" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-8">
              Explore nossa plataforma e adicione cursos ao carrinho!
            </p>
            <Link href="/courses">
              <Button size="lg">
                Explorar Cursos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    // Redirecionar para checkout com múltiplos cursos
    const courseIds = items.map((item) => item.id).join(',');
    router.push(`/checkout/multiple?courses=${courseIds}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="h-8 w-8" />
              Seu Carrinho ({items.length}{' '}
              {items.length === 1 ? 'curso' : 'cursos'})
            </h1>
            {items.length > 0 && (
              <Button
                variant="ghost"
                onClick={clearCart}
                className="text-muted-foreground hover:text-destructive"
              >
                Limpar carrinho
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de itens */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const hasDiscount =
                  item.compareAtPrice && item.compareAtPrice > item.price;
                const discount = hasDiscount
                  ? Math.round(
                      ((item.compareAtPrice! - item.price) /
                        item.compareAtPrice!) *
                        100
                    )
                  : 0;

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Link
                          href={`/courses/${item.slug}`}
                          className="flex-shrink-0"
                        >
                          <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                            {item.thumbnail ? (
                              <Image
                                src={item.thumbnail}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <span className="text-2xl">📚</span>
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/courses/${item.slug}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2 mb-1">
                              {item.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Por {item.instructor.name || 'Instrutor'}
                          </p>

                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex flex-col">
                              {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">
                                  R$ {item.compareAtPrice!.toFixed(2)}
                                </span>
                              )}
                              <span className="text-lg font-bold text-primary">
                                R$ {item.price.toFixed(2)}
                              </span>
                            </div>
                            {hasDiscount && (
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive flex-shrink-0"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Resumo do pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold">Resumo do Pedido</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">R$ {total.toFixed(2)}</span>
                    </div>

                    {items.some(
                      (i) => i.compareAtPrice && i.compareAtPrice > i.price
                    ) && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Economia</span>
                        <span className="font-semibold">
                          R${' '}
                          {items
                            .reduce((sum, i) => {
                              const saved = i.compareAtPrice
                                ? i.compareAtPrice - i.price
                                : 0;
                              return sum + saved;
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          R$ {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleCheckout} size="lg" className="w-full">
                    Finalizar Compra
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    ✓ Acesso vitalício aos cursos
                    <br />
                    ✓ Certificado de conclusão
                    <br />✓ 30 dias de garantia
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
