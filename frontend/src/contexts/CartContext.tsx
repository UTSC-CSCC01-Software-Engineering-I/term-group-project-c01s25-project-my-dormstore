import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/Product';
import { sampleProducts } from '../data/sampleProducts.ts';

// extend product type to include quantity for cart items
interface CartItem extends Product {
  quantity: number;
  backendId?: number;
}

//? what our cart context will provide
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
}

//? create the context with undefined as initial value
const CartContext = createContext<CartContextType | undefined>(undefined);

// user is logged in
const isUserLoggedIn = (): boolean => {
  return !!localStorage.getItem("token");
};

// auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// guest cart persistence
const saveCartToStorage = (cartItems: CartItem[]) => {
  localStorage.setItem('guestCart', JSON.stringify(cartItems));
};

const loadCartFromStorage = (): CartItem[] => {
  const saved = localStorage.getItem('guestCart');
  return saved ? JSON.parse(saved) : [];
};


// Backend API functions
const cartAPI = {
  // get cart items from backend
  async getCart() {
    const response = await fetch('http://localhost:5001/cart', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get cart');
    return response.json();
  },

  
  // add item to backend cart
  async addItem(product_id: number, quantity: number = 1) {
    const response = await fetch('http://localhost:5001/cart', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id, quantity })
    });
    if (!response.ok) throw new Error('Failed to add item');
    return response.json();
  },

  // update quantity of a cart item
  async updateItem(itemId: number, quantity: number) {
    const response = await fetch(`http://localhost:5001/cart/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity })
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.json();
  },

  // remove a specific cart item
  async removeItem(itemId: number) {
    const response = await fetch(`http://localhost:5001/cart/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to remove item');
    return response.json();
  },

  // clear the entire cart
  async clearCart() {
    const response = await fetch('http://localhost:5001/cart', {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to clear cart');
    return response.json();
  }
};

//? component that will wrap our app
export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize with empty cart no matter what
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    async function loadCart() {
      if (isUserLoggedIn()) {
        // Logged in
        try {
          const data = await cartAPI.getCart();
          setItems(
            data.cartItems.map((item: any) => ({
              ...sampleProducts.find(p => p.id === item.product_id),
              quantity: item.quantity,
              backendId: item.id
            })).filter(Boolean)
          );
        } catch (err) {
          setItems([]);
        }
      } else {
        // Not logged in
        const savedCart = loadCartFromStorage();
        setItems(savedCart);
      }
    }
    loadCart();
  }, []);

  const addToCart = (product: Product) => {
    if (isUserLoggedIn()) {
      // use backend
      cartAPI.addItem(product.id, 1)
        .then(() => cartAPI.getCart())
        .then(data => {
          setItems(
            data.cartItems.map((item: any) => ({
              ...sampleProducts.find(p => p.id === item.product_id),
              quantity: item.quantity,
              backendId: item.id
            })).filter(Boolean)
          );
        })
        .catch(() => {
          // fallback
        });
    } else {
      // Not logged in: use local state
      setItems(currentItems => {
        // if product already exists in cart
        const existingItem = currentItems.find(item => item.id === product.id);
        let newItems;
        if (existingItem) {
          // if exists increase quantity by 1
          newItems = currentItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // new item
          newItems = [...currentItems, { ...product, quantity: 1 }];
        }
        // Save to localStorage
        saveCartToStorage(newItems);
        return newItems;
      });
    }
  };

  const removeFromCart = (productId: number) => {
    if (isUserLoggedIn()) {
      // find the backend cart item id for this product
      const item = items.find(i => i.id === productId);
      if (!item || !item.backendId) return;
      cartAPI.removeItem(item.backendId)
        .then(() => cartAPI.getCart())
        .then(data => {
          setItems(
            data.cartItems.map((item: any) => ({
              ...sampleProducts.find(p => p.id === item.product_id),
              quantity: item.quantity,
              backendId: item.id
            })).filter(Boolean)
          );
        })
        .catch(() => {
          // fallback
        });
    } else {
      // Not logged in: use local state and save to localStorage
      setItems(currentItems => {
        const newItems = currentItems.filter(item => item.id !== productId);
        // Save to localStorage
        saveCartToStorage(newItems);
        return newItems;
      });
    }
  };

  // Update
  const updateQuantity = (productId: number, quantity: number) => {
    if (isUserLoggedIn()) {
      // find the backend cart item id for this product
      const item = items.find(i => i.id === productId);
      if (!item || !item.backendId) return;
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }
      cartAPI.updateItem(item.backendId, quantity)
        .then(() => cartAPI.getCart())
        .then(data => {
          setItems(
            data.cartItems.map((item: any) => ({
              ...sampleProducts.find(p => p.id === item.product_id),
              quantity: item.quantity,
              backendId: item.id
            })).filter(Boolean)
          );
        })
        .catch(() => {
          // fallback
        });
    } else {
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }
      setItems(currentItems => {
        const newItems = currentItems.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        );
        // Save to localStorage
        saveCartToStorage(newItems);
        return newItems;
      });
    }
  };

  //  total number of items
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  //  total price
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  //clear cart
  const clearCart = () => {
    if (isUserLoggedIn()) {
      cartAPI.clearCart()
        .then(() => cartAPI.getCart())
        .then(data => {
          setItems(
            data.cartItems.map((item: any) => ({
              ...sampleProducts.find(p => p.id === item.product_id),
              quantity: item.quantity,
              backendId: item.id
            })).filter(Boolean)
          );
        })
        .catch(() => {
          setItems([]);
        });
    } else {
      setItems([]);
      // Clear from localStorage too
      saveCartToStorage([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalPrice,
        clearCart,
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