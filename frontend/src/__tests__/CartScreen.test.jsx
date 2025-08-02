import "@testing-library/jest-dom";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CartScreen from "../components/CartScreen";

jest.mock("../contexts/CartContext.tsx", () => ({
  useCart: jest.fn(),
}));
jest.mock("../utils/bedSizeHelper", () => ({
  getCurrentUserBedSize: jest.fn(),
}));
jest.mock("../components/RemovedItemsNotification", () => ({
  RemovedItemsNotification: ({ removedItems, onClose }) => (
    <div data-testid="removed-notification">
      {removedItems.length > 0 && (
        <button onClick={onClose}>Clear Removed</button>
      )}
    </div>
  ),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

import { useCart } from "../contexts/CartContext.tsx";
import { getCurrentUserBedSize } from "../utils/bedSizeHelper";

describe("CartScreen 100% Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCartItem = {
    id: 1,
    name: "Twin XL Sheet",
    price: 30,
    quantity: 2,
    image: "/test.jpg",
    cartItemId: "cart-1",
    category: "bedding",
    selectedSize: "Twin",
    selectedColor: "Blue",
  };

  const mockCartFunctions = {
    items: [mockCartItem],
    removedItems: ["Old Item"],
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    totalPrice: 60,
    clearRemovedItems: jest.fn(),
  };

  const renderCart = () =>
    render(<CartScreen />, { wrapper: BrowserRouter });

  test("renders empty cart state", () => {
    useCart.mockReturnValue({ ...mockCartFunctions, items: [], removedItems: [] });
    getCurrentUserBedSize.mockReturnValue("Twin XL");

    renderCart();

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  test("renders cart items, handles quantity change and remove", () => {
    useCart.mockReturnValue(mockCartFunctions);
    getCurrentUserBedSize.mockReturnValue("Twin XL");

    renderCart();

    expect(screen.getByText("My Cart")).toBeInTheDocument();
    expect(screen.getByText("Twin XL Sheet")).toBeInTheDocument();
    expect(screen.getByText("Size: Twin")).toBeInTheDocument();
    expect(screen.getByText("Color: Blue")).toBeInTheDocument();

    const itemRow = screen.getByText("Twin XL Sheet").closest(".cart-item-row");
    expect(within(itemRow).getByText("$60.00")).toBeInTheDocument();

    fireEvent.click(within(itemRow).getByText("+"));
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith("cart-1", 3);

    fireEvent.click(within(itemRow).getByText("-"));
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith("cart-1", 1);

    fireEvent.click(within(itemRow).getByTitle("Remove from cart"));
    expect(mockCartFunctions.removeFromCart).toHaveBeenCalledWith("cart-1");
  });

  test("renders compatibility warning for mismatched bed size", () => {
    useCart.mockReturnValue(mockCartFunctions);
    getCurrentUserBedSize.mockReturnValue("Twin XL");

    renderCart();

    expect(screen.getByText("Size Compatibility Warning")).toBeInTheDocument();
    expect(screen.getByText(/Some bedding items may not fit/)).toBeInTheDocument();
    expect(screen.getByText(/Selected: Twin, Blue \(Recommended: Twin XL\)/)).toBeInTheDocument();
  });

  test("does not show compatibility warning if sizes match", () => {
    useCart.mockReturnValue({
      ...mockCartFunctions,
      items: [{ ...mockCartItem, selectedSize: "Twin XL" }],
    });
    getCurrentUserBedSize.mockReturnValue("Twin XL");

    renderCart();

    expect(screen.queryByText("Size Compatibility Warning")).not.toBeInTheDocument();
  });

  test("does not show compatibility warning if no bed size found", () => {
    useCart.mockReturnValue(mockCartFunctions);
    getCurrentUserBedSize.mockReturnValue(null);

    renderCart();
    expect(screen.queryByText("Size Compatibility Warning")).not.toBeInTheDocument();
  });

  test("clears removed items", () => {
    useCart.mockReturnValue(mockCartFunctions);
    getCurrentUserBedSize.mockReturnValue("Twin XL");

    renderCart();
    fireEvent.click(screen.getByText("Clear Removed"));
    expect(mockCartFunctions.clearRemovedItems).toHaveBeenCalled();
  });

  test("navigates to checkout on button click", () => {
    useCart.mockReturnValue(mockCartFunctions);
    getCurrentUserBedSize.mockReturnValue("Twin XL");

    renderCart();
    fireEvent.click(screen.getByText("CHECKOUT"));
    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  
});
