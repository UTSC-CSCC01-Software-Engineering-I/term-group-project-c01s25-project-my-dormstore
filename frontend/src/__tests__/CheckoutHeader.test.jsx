import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CheckoutHeader from "../pages/CheckoutPage/CheckoutHeader"; 
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

describe("CheckoutHeader", () => {
  const mockOnShowCart = jest.fn();

  beforeEach(() => {
    render(
      <BrowserRouter>
        <CheckoutHeader onShowCart={mockOnShowCart} />
      </BrowserRouter>
    );
  });

  it("renders logo with correct image and link", () => {
    const logoLink = screen.getByRole("link", { name: /My Dorm Store Logo/i });
    expect(logoLink).toHaveAttribute("href", "/");

    const logoImage = screen.getByAltText("My Dorm Store Logo");
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "/mydormstroe_log.webp");
    expect(logoImage).toHaveClass("checkout-logo");
  });

  it("renders profile link with user icon", () => {
    const profileLink = screen.getByRole("link", { name: /User icon/i });
    expect(profileLink).toHaveAttribute("href", "/profile");

    const userIcon = screen.getByAltText("User icon");
    expect(userIcon).toHaveAttribute("src", "/user.png");
  });

  it("renders messages link with checklist icon", () => {
    const messagesLink = screen.getByRole("link", { name: /Checklist icon/i });
    expect(messagesLink).toHaveAttribute("href", "/messages");

    const checklistIcon = screen.getByAltText("Checklist icon");
    expect(checklistIcon).toHaveAttribute("src", "/check_box.png");
  });

  it("renders cart button with icon and triggers callback", () => {
    const cartButton = screen.getByRole("button");
    expect(cartButton).toHaveClass("icon-link", "cart-button");

    const cartIcon = screen.getByAltText("Cart icon");
    expect(cartIcon).toHaveAttribute("src", "/shopping.png");

    fireEvent.click(cartButton);
    expect(mockOnShowCart).toHaveBeenCalledTimes(1);
  });

  it("has correct layout class names", () => {
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("checkout-header");

    const logo = screen.getByAltText("My Dorm Store Logo").closest(".logo");
    expect(logo).toBeInTheDocument();

    const icons = screen.getByAltText("User icon").closest(".header-icons");
    expect(icons).toBeInTheDocument();
  });
});
