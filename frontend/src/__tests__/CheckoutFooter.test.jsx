import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CheckoutFooter from "../pages/CheckoutPage/CheckoutFooter";
import "@testing-library/jest-dom";

describe("CheckoutFooter", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <CheckoutFooter />
      </BrowserRouter>
    );
  });

  it("renders all left-side links", () => {
    expect(screen.getByRole("link", { name: /Contact Us/i })).toHaveAttribute(
      "href",
      "/contact"
    );
    expect(screen.getByRole("link", { name: /Live Chat/i })).toHaveAttribute(
      "href",
      "/live-chat"
    );
  });

  it("renders all right-side links", () => {
    expect(
      screen.getByRole("link", { name: /Refund Policy/i })
    ).toHaveAttribute("href", "/refund-policy");

    expect(
      screen.getByRole("link", { name: /Privacy Policy/i })
    ).toHaveAttribute("href", "/privacy-policy");

    expect(
      screen.getByRole("link", { name: /Terms of Service/i })
    ).toHaveAttribute("href", "/terms-of-service");

    expect(
      screen.getByRole("link", { name: /Shipping Policy/i })
    ).toHaveAttribute("href", "/shipping-policy");

    expect(
      screen.getByRole("link", { name: /Cancellation Policy/i })
    ).toHaveAttribute("href", "/cancellation-policy");
  });

  it("renders correct number of separators", () => {
    const separators = screen.getAllByText("|");
    expect(separators.length).toBe(5); // 1 between left links, 4 between right links
  });

  it("has correct class names for layout", () => {
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("checkout-footer");
    expect(
      screen.getByText("Contact Us").closest(".footer-links--left")
    ).toBeTruthy();
    expect(
      screen.getByText("Refund Policy").closest(".footer-links--right")
    ).toBeTruthy();
  });
});
