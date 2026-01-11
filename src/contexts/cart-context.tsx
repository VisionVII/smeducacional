'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface CartItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  compareAtPrice: number | null;
  instructor: {
    name: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  hasItem: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sm-educa-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Carregar do localStorage no mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }
    setMounted(true);
  }, []);

  // Salvar no localStorage quando items mudar
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // Verificar se já existe
      const alreadyExists = prev.find((i) => i.id === item.id);

      if (alreadyExists) {
        // Toast será disparado após o setState
        setTimeout(() => {
          toast({
            title: 'Curso já no carrinho',
            description: `${item.title} já está no seu carrinho.`,
            variant: 'default',
          });
        }, 0);
        return prev;
      }

      // Toast será disparado após o setState
      setTimeout(() => {
        toast({
          title: 'Adicionado ao carrinho! 🛒',
          description: `${item.title} foi adicionado ao carrinho.`,
        });
      }, 0);

      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);

      if (item) {
        // Toast será disparado após o setState
        setTimeout(() => {
          toast({
            title: 'Removido do carrinho',
            description: `${item.title} foi removido.`,
          });
        }, 0);
      }

      return prev.filter((i) => i.id !== id);
    });
  };

  const clearCart = () => {
    setItems([]);

    // Toast será disparado após o setState
    setTimeout(() => {
      toast({
        title: 'Carrinho limpo',
        description: 'Todos os itens foram removidos.',
      });
    }, 0);
  };

  const hasItem = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        total,
        itemCount,
        hasItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
}
