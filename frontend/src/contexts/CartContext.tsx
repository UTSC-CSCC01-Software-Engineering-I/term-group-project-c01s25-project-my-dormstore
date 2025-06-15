import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types/Product';
import { sampleProducts } from '../data/sampleProducts';

// extend product type to include quantity for cart items
interface CartItem extends Product {
  quantity: number;
}

//? what our cart context will provide
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
}

//? create the context with undefined as initial value
const CartContext = createContext<CartContextType | undefined>(undefined);

//? component that will wrap our app
export function CartProvider({ children }: { children: ReactNode }) {
  //! Dummy Info for now, initialize with the first sample product for dev/testing
  const [items, setItems] = useState<CartItem[]>([
    { ...sampleProducts[0], quantity: 1 }
  ]);

  const addToCart = (product: Product) => {
    setItems(currentItems => {
      // Check if product already exists in cart
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // If it exists, increase quantity by 1
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // If it's a new item, add it with quantity 1
      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(currentItems => 
      currentItems.filter(item => item.id !== productId)
    );
  };

  // Update
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  //  total number of items
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  //  total price
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalPrice,
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