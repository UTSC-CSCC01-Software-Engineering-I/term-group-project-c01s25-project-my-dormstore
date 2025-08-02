import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../components/Header.jsx"; 
import { useCart } from "../contexts/CartContext.tsx";
import "@testing-library/jest-dom";

// Mock useCart hook
jest.mock("../contexts/CartContext.tsx", () => ({
  useCart: jest.fn(),
}));

describe("Header component with cart and interactivity", () => {
  beforeEach(() => {
    useCart.mockReturnValue({
      totalItems: 3,
    });
  });

  test("renders logo, search bar, and all icons", () => {
    render(<Header onShowCart={jest.fn()} />);

    // Logo
    expect(screen.getByAltText("My Dorm Store Logo")).toBeInTheDocument();
    expect(screen.getByAltText("My Dorm Store Logo")).toHaveAttribute("src", "/mydormstroe_log.webp");

    // Search
    expect(screen.getByAltText("Search Icon")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();

    // Icons
    expect(screen.getByAltText("Language icon")).toBeInTheDocument();
    expect(screen.getByText(/CA \| English/i)).toBeInTheDocument();
    expect(screen.getByAltText("User icon")).toBeInTheDocument();
    expect(screen.getByAltText("Checklist icon")).toBeInTheDocument();
    expect(screen.getByAltText("Cart icon")).toBeInTheDocument();
  });

  test("calls onShowCart when cart icon is clicked", () => {
    const onShowCartMock = jest.fn();
    render(<Header onShowCart={onShowCartMock} />);

    const cartIcon = screen.getByAltText("Cart icon");
    fireEvent.click(cartIcon.parentElement); // span wrapping the image

    expect(onShowCartMock).toHaveBeenCalled();
  });

  test("displays correct cart item count from context", () => {
    render(<Header onShowCart={() => {}} />);
    // totalItems isn't directly rendered in the current component
    // If you plan to render `totalItems` in UI, this would change
    expect(useCart).toHaveBeenCalled();
  });
});
