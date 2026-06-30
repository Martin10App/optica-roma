'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  cartItemId: string;
  modelo: string;
  marca: string;
  precio: number;
  imagen_url: string;
  cantidad: number;
  opciones?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cantidad' | 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, cantidad: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('opticaRomaCart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('opticaRomaCart', JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addToCart = (product: Omit<CartItem, 'cantidad' | 'cartItemId'>) => {
    setItems((prevItems) => {
      const cartItemId = `${product.id}-${product.opciones || 'default'}`;
      const existingItem = prevItems.find((item) => item.cartItemId === cartItemId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.cartItemId === cartItemId ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prevItems, { ...product, cartItemId, cantidad: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, cantidad: number) => {
    if (cantidad < 1) return;
    setItems((prevItems) =>
      prevItems.map((item) => (item.cartItemId === cartItemId ? { ...item, cantidad } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);
  const cartCount = items.reduce((count, item) => count + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
