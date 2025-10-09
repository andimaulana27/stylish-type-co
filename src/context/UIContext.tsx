// src/context/UIContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import toast from 'react-hot-toast';

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  slug: string; // <-- PROPERTI BARU DITAMBAHKAN DI SINI
  imageUrl: string;
  price: number;
  originalPrice?: number;
  license: {
    id: string;
    name: string;
  };
  type: 'font' | 'bundle';
  quantity: number;
};

type UIContextType = {
  isCartSidebarOpen: boolean;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartOriginalTotal: number;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isCartSidebarOpen, setCartSidebarOpen] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('timeless-type-cart');
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (error) {
        console.error("Gagal membaca keranjang dari localStorage", error);
        return [];
      }
    }
    return [];
  });
  
  const [lastAddedItemId, setLastAddedItemId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('timeless-type-cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Gagal menyimpan keranjang ke localStorage", error);
    }
  }, [cart]);

  useEffect(() => {
    if (lastAddedItemId) {
      const item = cart.find(i => i.id === lastAddedItemId);
      if (item) {
        toast.success(`${item.name} added to cart!`);
      }
      setLastAddedItemId(null);
    }
  }, [lastAddedItemId, cart]);

  const openCartSidebar = () => setCartSidebarOpen(true);
  const closeCartSidebar = () => setCartSidebarOpen(false);

  const addToCart = (newItem: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === newItem.id);
      
      if (existingItem) {
        toast.error(`${newItem.name} is already in your cart.`);
        return prevCart;
      }
      
      setLastAddedItemId(newItem.id); 
      
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    toast.success("Item removed from cart.");
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.length;
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);
  const cartOriginalTotal = cart.reduce((total, item) => total + (item.originalPrice || item.price), 0);

  return (
    <UIContext.Provider value={{
      isCartSidebarOpen,
      openCartSidebar,
      closeCartSidebar,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      cartOriginalTotal,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};