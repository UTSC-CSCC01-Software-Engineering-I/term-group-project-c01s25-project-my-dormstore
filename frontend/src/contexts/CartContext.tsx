import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/Product';
import { productService } from '../services/productService';

// extend product type to include quantity for cart items
interface CartItem extends Product {
  quantity: number;
  backendId?: number;
  selectedSize?: string;
  selectedColor?: string;
  cartItemId?: string; // Unique identifier for cart operations
  isPackage?: boolean; // Flag to distinguish packages from products
}

// Package cart item interface
interface PackageCartItem {
  id: number;
  package_id: number;
  quantity: number;
  cartItemId?: string;
}

//? what our cart context will provide
interface CartContextType {
  items: CartItem[];
  addToCart: (item: Product | any, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
  cartReady: boolean;
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
  if (!saved) {
    return [];
  }
  const cartItems = JSON.parse(saved);
  // Ensure all items have cartItemId for backward compatibility
  const mapped = cartItems.map((item: any) => {
    if (!item.cartItemId) {
      item.cartItemId = `local_${item.id}_${item.selectedSize || 'nosize'}_${item.selectedColor || 'nocolor'}_${Date.now()}_${Math.random()}`;
    }
    return item;
  });
  
  return mapped;
};


// Backend API functions
const cartAPI = {
  // get cart items from backend
  async getCart() {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get cart');
    return response.json();
  },

  
  // add item to backend cart
  async addItem(product_id: number, quantity: number = 1, selected_size?: string, selected_color?: string) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {

      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id, quantity, selected_size, selected_color })
    });
    if (!response.ok) throw new Error('Failed to add item');
    return response.json();
  },

  // update quantity of a cart item
  async updateItem(itemId: number, quantity: number) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity })
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.json();
  },

  // remove a specific cart item
  async removeItem(itemId: number) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to remove item');
    return response.json();
  },

  // clear the entire cart
  async clearCart() {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
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
  const [cartReady, setCartReady] = useState(false);

  // Helper function to get product by ID
  const getProductById = async (productId: number): Promise<Product | null> => {
    try {
      return await productService.getProductById(productId);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  useEffect(() => {
    async function loadCart() {
      if (isUserLoggedIn()) {
        try {
          const data = await cartAPI.getCart();
          const cartItems = await Promise.all(
            data.cartItems.map(async (item: any) => {
              if (item.item_type === 'package') {
                // Handle package - fetch package data
                try {
                  const packageResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/packages/${item.package_id}`);
                  if (packageResponse.ok) {
                    const packageData = await packageResponse.json();
                    return {
                      ...packageData,
                      quantity: item.quantity,
                      backendId: item.id,
                      cartItemId: `backend_${item.id}`,
                      isPackage: true
                    };
                  }
                } catch (error) {
                  console.error('Error fetching package:', error);
                }
                return null;
              } else {
                // Handle product
                const product = await getProductById(item.product_id);
                if (product) {
                  return {
                    ...product,
                    quantity: item.quantity,
                    backendId: item.id,
                    selectedSize: item.selected_size,
                    selectedColor: item.selected_color,
                    cartItemId: `backend_${item.id}` // Unique identifier for cart operations
                  };
                }
              }
              return null;
            })
          );
          setItems(cartItems.filter(Boolean));
        } catch (err) {
          setItems([]);
        } finally {
          setCartReady(true); // ✅ set after async load finishes
        }
      } else {
        const savedCart = loadCartFromStorage();
        setItems(savedCart);
        setCartReady(true); // ✅ local cart is ready
      }
    }
    loadCart();
  }, []);

  const addToCart = (item: Product | any, quantity: number = 1, selectedSize?: string, selectedColor?: string) => {
    if (isUserLoggedIn()) {
      // Determine if it's a package or product
      const isPackage = item.isPackage || item.category === 'package';
      
      if (isPackage) {
        // Handle package - send package_id instead of product_id
        fetch(`${process.env.REACT_APP_API_URL}/cart`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ package_id: item.id, quantity })
        })
        .then(() => cartAPI.getCart())
        .then(async data => {
          const cartItems = await Promise.all(
            data.cartItems.map(async (cartItem: any) => {
              if (cartItem.item_type === 'package') {
                try {
                  const packageResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/packages/${cartItem.package_id}`);
                  if (packageResponse.ok) {
                    const packageData = await packageResponse.json();
                    return {
                      ...packageData,
                      quantity: cartItem.quantity,
                      backendId: cartItem.id,
                      cartItemId: `backend_${cartItem.id}`,
                      isPackage: true
                    };
                  }
                } catch (error) {
                  console.error('Error fetching package:', error);
                }
                return null;
              } else {
                const prod = await getProductById(cartItem.product_id);
                if (prod) {
                  return {
                    ...prod,
                    quantity: cartItem.quantity,
                    backendId: cartItem.id,
                    selectedSize: cartItem.selected_size,
                    selectedColor: cartItem.selected_color,
                    cartItemId: `backend_${cartItem.id}`
                  };
                }
              }
              return null;
            })
          );
          setItems(cartItems.filter(Boolean));
        })
        .catch(() => {
          alert('Failed to add package to cart. Please try again.');
        });
      } else {
        // Handle product - use existing logic
        cartAPI.addItem(item.id, quantity, selectedSize, selectedColor)
          .then(() => cartAPI.getCart())
          .then(async data => {
            const cartItems = await Promise.all(
              data.cartItems.map(async (cartItem: any) => {
                if (cartItem.item_type === 'package') {
                  try {
                    const packageResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/packages/${cartItem.package_id}`);
                    if (packageResponse.ok) {
                      const packageData = await packageResponse.json();
                      return {
                        ...packageData,
                        quantity: cartItem.quantity,
                        backendId: cartItem.id,
                        cartItemId: `backend_${cartItem.id}`,
                        isPackage: true
                      };
                    }
                  } catch (error) {
                    console.error('Error fetching package:', error);
                  }
                  return null;
                } else {
                  const prod = await getProductById(cartItem.product_id);
                  if (prod) {
                    return {
                      ...prod,
                      quantity: cartItem.quantity,
                      backendId: cartItem.id,
                      selectedSize: cartItem.selected_size,
                      selectedColor: cartItem.selected_color,
                      cartItemId: `backend_${cartItem.id}`
                    };
                  }
                }
                return null;
              })
            );
            setItems(cartItems.filter(Boolean));
          })
          .catch(() => {
            alert('Failed to add item to cart. Please try again.');
          });
      }
    } else {
      // Not logged in: use local state
      setItems(currentItems => {
        const isPackage = item.isPackage || item.category === 'package';
        const existingItem = currentItems.find(cartItem => 
          cartItem.id === item.id && 
          cartItem.selectedSize === selectedSize && 
          cartItem.selectedColor === selectedColor &&
          cartItem.isPackage === isPackage
        );
        
        let newItems;
        if (existingItem) {
          newItems = currentItems.map(cartItem =>
            cartItem.cartItemId === existingItem.cartItemId
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
        } else {
          const cartItemId = `local_${item.id}_${selectedSize || 'nosize'}_${selectedColor || 'nocolor'}_${Date.now()}`;
          newItems = [...currentItems, { ...item, quantity, selectedSize, selectedColor, isPackage, cartItemId }];
        }
        saveCartToStorage(newItems);
        return newItems;
      });
    }
  };

  const removeFromCart = (cartItemId: string) => {
    if (isUserLoggedIn()) {
      // For logged-in users, extract backendId from cartItemId
      const backendId = parseInt(cartItemId.replace('backend_', ''));
      cartAPI.removeItem(backendId)
        .then(() => cartAPI.getCart())
        .then(async data => {
          const cartItems = await Promise.all(
            data.cartItems.map(async (item: any) => {
              const prod = await getProductById(item.product_id);
              if (prod) {
                return {
                  ...prod,
                  quantity: item.quantity,
                  backendId: item.id,
                  selectedSize: item.selected_size,
                  selectedColor: item.selected_color,
                  cartItemId: `backend_${item.id}`
                };
              }
              return null;
            })
          );
          setItems(cartItems.filter(Boolean));
        })
        .catch(() => {
          // fallback
        });
    } else {
      // Not logged in: use local state and save to localStorage
      setItems(currentItems => {
        const newItems = currentItems.filter(item => item.cartItemId !== cartItemId);
        saveCartToStorage(newItems);
        return newItems;
      });
    }
  };

  // Update by cartItemId
  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (isUserLoggedIn()) {
      // find the backend cart item id for this cartItemId
      const item = items.find(i => i.cartItemId === cartItemId);
      if (!item || !item.backendId) return;
      if (quantity < 1) {
        removeFromCart(cartItemId);
        return;
      }
      cartAPI.updateItem(item.backendId, quantity)
        .then(() => cartAPI.getCart())
        .then(async data => {
          const cartItems = await Promise.all(
            data.cartItems.map(async (item: any) => {
              const prod = await getProductById(item.product_id);
              if (prod) {
                return {
                  ...prod,
                  quantity: item.quantity,
                  backendId: item.id,
                  selectedSize: item.selected_size,
                  selectedColor: item.selected_color,
                  cartItemId: `backend_${item.id}`
                };
              }
              return null;
            })
          );
          setItems(cartItems.filter(Boolean));
        })
        .catch(() => {
          // fallback
        });
    } else {
      if (quantity < 1) {
        removeFromCart(cartItemId);
        return;
      }
      setItems(currentItems => {
        const newItems = currentItems.map(item =>
          item.cartItemId === cartItemId
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
        .then(async data => {
          const cartItems = await Promise.all(
            data.cartItems.map(async (item: any) => {
              const prod = await getProductById(item.product_id);
              if (prod) {
                return {
                  ...prod,
                  quantity: item.quantity,
                  backendId: item.id,
                  selectedSize: item.selected_size,
                  selectedColor: item.selected_color,
                  cartItemId: `backend_${item.id}`
                };
              }
              return null;
            })
          );
          setItems(cartItems.filter(Boolean));
        })
        .catch(() => {
          // fallback
        });
    } else {
      // Not logged in: use local state and save to localStorage
      setItems(() => {
        saveCartToStorage([]);
        return [];
      });
    }

  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      totalItems,
      totalPrice,
      clearCart,
      cartReady
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};