import React, { useEffect, useState } from "react";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CartProvider, useCart } from "../contexts/CartContext";

// Mock the product service
jest.mock("../services/productService", () => ({
  productService: {
    getProductById: jest.fn()
  }
}));

// Mock window.alert globally
global.alert = jest.fn();

global.fetch = jest.fn();

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  jest.clearAllMocks();
});

// Test component that simulates cart screen functionality
function TestCartScreen() {
  const { items, addToCart, removeFromCart, updateQuantity, totalPrice, removedItems, clearRemovedItems } = useCart();
  
  return (
    <div>
      <h2>My Cart</h2>
      
      {/* Removed items notification */}
      {removedItems && removedItems.length > 0 && (
        <div data-testid="removed-items-notification">
          <span data-testid="removed-count">{removedItems.length}</span>
          <button onClick={clearRemovedItems} data-testid="clear-removed">Clear</button>
        </div>
      )}
      
      {/* Cart items */}
      <div className="cart-items-list">
        {items.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          items.map((item) => (
            <div key={item.cartItemId} data-testid="cart-item">
              <div data-testid="item-name">{item.name}</div>
              {item.selectedSize && <span data-testid="item-size">Size: {item.selectedSize}</span>}
              {item.selectedColor && <span data-testid="item-color">Color: {item.selectedColor}</span>}
              <div data-testid="item-quantity">{item.quantity}</div>
              <div data-testid="item-price">${(item.price * item.quantity).toFixed(2)}</div>
              <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} data-testid="increase-qty">+</button>
              <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} data-testid="decrease-qty">-</button>
              <button onClick={() => removeFromCart(item.cartItemId)} data-testid="remove-item">🗑️</button>
            </div>
          ))
        )}
      </div>
      
      {/* Order summary */}
      <div className="cart-summary">
        <h2>Order Summary</h2>
        <div>
          <span>Subtotal</span>
          <span data-testid="subtotal">${totalPrice.toFixed(2)}</span>
        </div>
        <div>
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div>
          <span>Tax</span>
          <span>Calculated at checkout</span>
        </div>
        <div>
          <span>Estimated Total</span>
          <span data-testid="total">${totalPrice.toFixed(2)}</span>
        </div>
        {items.length > 0 && <button data-testid="checkout-btn">CHECKOUT</button>}
      </div>
    </div>
  );
}

describe("CartScreen Functionality", () => {
  test("renders cart title", async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestCartScreen />
        </CartProvider>
      );
    });
    
    expect(screen.getByText("My Cart")).toBeInTheDocument();
  });

  test("shows empty cart message when no items", async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestCartScreen />
        </CartProvider>
      );
    });
    
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  test("renders cart items when items exist", async () => {
    const TestComponent = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart({ 
            id: 1, 
            name: "Test Product", 
            price: 10, 
            image: "test.jpg" 
          }, 1)}>
            Add Item
          </button>
          <TestCartScreen />
        </div>
      );
    };

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Item"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.queryByText("Your cart is empty.")).not.toBeInTheDocument();
  });

  test("displays item details correctly", async () => {
    const TestComponent = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart({ 
            id: 1, 
            name: "Test Product", 
            price: 15.99, 
            image: "test.jpg",
            category: "bedding"
          }, 2, "Twin XL", "Blue")}>
            Add Item
          </button>
          <TestCartScreen />
        </div>
      );
    };

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Item"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Size: Twin XL")).toBeInTheDocument();
    expect(screen.getByText("Color: Blue")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // quantity
    expect(screen.getByTestId("item-price")).toHaveTextContent("$31.98"); // price * quantity
  });

  test("quantity controls work properly", async () => {
    const TestComponent = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart({ 
            id: 1, 
            name: "Test Product", 
            price: 10, 
            image: "test.jpg" 
          }, 1)}>
            Add Item
          </button>
          <TestCartScreen />
        </div>
      );
    };

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Item"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Increase quantity
    await act(async () => {
      fireEvent.click(screen.getByTestId("increase-qty"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("2")).toBeInTheDocument(); // quantity should be 2

    // Decrease quantity
    await act(async () => {
      fireEvent.click(screen.getByTestId("decrease-qty"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("1")).toBeInTheDocument(); // quantity should be 1
  });

  test("remove item button works", async () => {
    const TestComponent = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart({ 
            id: 1, 
            name: "Test Product", 
            price: 10, 
            image: "test.jpg" 
          }, 1)}>
            Add Item
          </button>
          <TestCartScreen />
        </div>
      );
    };

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Item"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Test Product")).toBeInTheDocument();

    // Click remove button
    await act(async () => {
      fireEvent.click(screen.getByTestId("remove-item"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  test("checkout button exists when cart has items", async () => {
    const TestComponent = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart({ 
            id: 1, 
            name: "Test Product", 
            price: 10, 
            image: "test.jpg" 
          }, 1)}>
            Add Item
          </button>
          <TestCartScreen />
        </div>
      );
    };

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Item"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check that checkout button exists
    expect(screen.getByTestId("checkout-btn")).toBeInTheDocument();
  });

  test("displays order summary correctly", async () => {
    const TestComponent = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart({ 
            id: 1, 
            name: "Test Product", 
            price: 20, 
            image: "test.jpg" 
          }, 2)}>
            Add Item
          </button>
          <TestCartScreen />
        </div>
      );
    };

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Item"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByTestId("subtotal")).toHaveTextContent("$40.00"); // subtotal
    expect(screen.getByText("Shipping")).toBeInTheDocument();
    expect(screen.getAllByText("Calculated at checkout")).toHaveLength(2);
    expect(screen.getByText("Tax")).toBeInTheDocument();
    expect(screen.getByText("Estimated Total")).toBeInTheDocument();
  });



  test("handles multiple items in cart", async () => {
    const TestComponent = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => {
            addToCart({ id: 1, name: "Product 1", price: 10, image: "test1.jpg" }, 1);
            addToCart({ id: 2, name: "Product 2", price: 20, image: "test2.jpg" }, 2);
          }}>
            Add Multiple Items
          </button>
          <TestCartScreen />
        </div>
      );
    };

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Multiple Items"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByTestId("subtotal")).toHaveTextContent("$50.00"); // total: (10*1) + (20*2)
  });

  test("quantity of 0 removes item", async () => {
    const TestComponent = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart({ 
            id: 1, 
            name: "Test Product", 
            price: 10, 
            image: "test.jpg" 
          }, 1)}>
            Add Item
          </button>
          <TestCartScreen />
        </div>
      );
    };

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Item"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Test Product")).toBeInTheDocument();

    // Decrease quantity to 0
    await act(async () => {
      fireEvent.click(screen.getByTestId("decrease-qty"));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  test("handles cart with items that have size and color options", async () => {
    const TestComponent = () => {
      const { addToCart, items } = useCart();
      const [added, setAdded] = useState(false);
      
      useEffect(() => {
        if (!added) {
          addToCart({
            id: 1,
            name: "Test Product with Options",
            price: 25.00,
            image: "test.jpg",
            selectedSize: "Twin",
            selectedColor: "Blue"
          });
          setAdded(true);
        }
      }, [addToCart, added]);
      
      return (
        <div>
          <div data-testid="items-count">{items.length}</div>
          {items.map(item => (
            <div key={item.id} data-testid="item-options">
              {item.selectedSize && <span data-testid="size">{item.selectedSize}</span>}
              {item.selectedColor && <span data-testid="color">{item.selectedColor}</span>}
            </div>
          ))}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(screen.getByTestId("items-count")).toHaveTextContent("1");
    expect(screen.getByTestId("size")).toHaveTextContent("Twin");
    expect(screen.getByTestId("color")).toHaveTextContent("Blue");
  });

  test("handles cart with multiple items of different types", async () => {
    const TestComponent = () => {
      const { addToCart, items, totalPrice } = useCart();
      const [added, setAdded] = useState(false);
      
      useEffect(() => {
        if (!added) {
          addToCart({
            id: 1,
            name: "Product 1",
            price: 10.00,
            image: "product1.jpg"
          });
          addToCart({
            id: 2,
            name: "Product 2",
            price: 20.00,
            image: "product2.jpg"
          });
          setAdded(true);
        }
      }, [addToCart, added]);
      
      return (
        <div>
          <div data-testid="items-count">{items.length}</div>
          <div data-testid="total-price">{totalPrice.toFixed(2)}</div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(screen.getByTestId("items-count")).toHaveTextContent("2");
    expect(screen.getByTestId("total-price")).toHaveTextContent("30.00");
  });
}); 

 