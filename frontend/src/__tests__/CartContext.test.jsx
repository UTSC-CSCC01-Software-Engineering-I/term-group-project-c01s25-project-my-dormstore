import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CartProvider, useCart } from "../contexts/CartContext";

// Mock the product service
jest.mock("../services/productService", () => ({
  productService: {
    getProductById: jest.fn()
  }
}));

global.fetch = jest.fn();

// test
function TestCartComponent() {
  const { items, addToCart } = useCart();
  
  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      <button onClick={() => addToCart({ id: 1, name: "Test", price: 10 }, 1, "Twin XL", "Blue")}>
        Add Item
      </button>
      {items.map(item => (
        <div key={item.cartItemId} data-testid="cart-item">
          <span data-testid="item-size">{item.selectedSize}</span>
          <span data-testid="item-color">{item.selectedColor}</span>
        </div>
      ))}
    </div>
  );
}

test("CartContext can handle items with size and color", () => {
  render(
    <CartProvider>
      <TestCartComponent />
    </CartProvider>
  );
  
  expect(screen.getByTestId("item-count")).toHaveTextContent("0");
});

test("can add item with size and color to cart", () => {
  render(
    <CartProvider>
      <TestCartComponent />
    </CartProvider>
  );
  
  // Click the add button
  fireEvent.click(screen.getByText("Add Item"));
  
  // Check that size and color are displayed
  expect(screen.getByTestId("item-size")).toHaveTextContent("Twin XL");
  expect(screen.getByTestId("item-color")).toHaveTextContent("Blue");
}); 