'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { ShoppingCart, Check } from 'lucide-react';

interface AddToCartButtonProps {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    price: number;
    compareAtPrice: number | null;
    instructor: {
      name: string | null;
    };
  };
  disabled?: boolean;
}

export function AddToCartButton({ course, disabled }: AddToCartButtonProps) {
  const { addItem, hasItem } = useCart();
  const inCart = hasItem(course.id);

  const handleClick = () => {
    if (!inCart) {
      addItem(course);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || inCart}
      variant={inCart ? 'outline' : 'default'}
      className="w-full sm:w-auto"
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          No carrinho
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Adicionar ao carrinho
        </>
      )}
    </Button>
  );
}
