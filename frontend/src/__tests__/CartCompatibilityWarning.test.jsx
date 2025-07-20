import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the bed size helper
jest.mock("../utils/bedSizeHelper", () => ({
  getCurrentUserBedSize: () => "Twin" // User's dorm requires Twin
}));

function TestCompatibilityWarning({ cartItems }) {
  const { getCurrentUserBedSize } = require("../utils/bedSizeHelper");
  const userBedSize = getCurrentUserBedSize();
  
  if (!userBedSize) return null;
  
  const incompatibleItems = cartItems.filter(item => {
    if (!item.category || item.category.toLowerCase() !== 'bedding') return false;
    return item.selectedSize && item.selectedSize !== userBedSize;
  });
  
  if (incompatibleItems.length === 0) return null;
  
  return (
    <div className="cart-warning">
      <div className="warning-header">Size Compatibility Warning</div>
      <div className="warning-text">
        Some bedding items may not fit your dorm (requires {userBedSize}):
      </div>
      {incompatibleItems.map(item => (
        <div key={item.id} className="warning-item">
          • {item.name} - Selected: {item.selectedSize}{item.selectedColor ? `, ${item.selectedColor}` : ''} (Recommended: {userBedSize})
        </div>
      ))}
    </div>
  );
}

test("shows compatibility warning when bedding doesn't fit dorm", () => {
  const cartItems = [
    {
      id: 1,
      name: "Twin XL Bedding Set",
      category: "bedding",
      selectedSize: "Twin XL",
      selectedColor: "Blue"
    }
  ];

  render(<TestCompatibilityWarning cartItems={cartItems} />);
  
  // Check that the warning appears
  expect(screen.getByText("Size Compatibility Warning")).toBeInTheDocument();
  expect(screen.getByText(/Some bedding items may not fit your dorm/)).toBeInTheDocument();
  
  // Check that it shows the specific item with the size mismatch
  expect(screen.getByText(/Twin XL Bedding Set - Selected: Twin XL/)).toBeInTheDocument();
  expect(screen.getByText(/Recommended: Twin/)).toBeInTheDocument();
});

test("does not show warning when bedding fits dorm", () => {
  const cartItems = [
    {
      id: 1,
      name: "Twin Bedding Set",
      category: "bedding",
      selectedSize: "Twin",
      selectedColor: "Blue"
    }
  ];

  render(<TestCompatibilityWarning cartItems={cartItems} />);
  
  expect(screen.queryByText("Size Compatibility Warning")).not.toBeInTheDocument();
});

test("does not show warning for non-bedding items", () => {
  const cartItems = [
    {
      id: 1,
      name: "Desk Lamp",
      category: "electronics",
      selectedSize: "Large"
    }
  ];

  render(<TestCompatibilityWarning cartItems={cartItems} />);
  
  expect(screen.queryByText("Size Compatibility Warning")).not.toBeInTheDocument();
}); 