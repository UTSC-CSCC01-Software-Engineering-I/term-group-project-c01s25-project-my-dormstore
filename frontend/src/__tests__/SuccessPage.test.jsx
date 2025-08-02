import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SuccessPage from "../pages/CheckoutPage/SuccessPage";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { within } from "@testing-library/react";


jest.mock("../contexts/CheckoutContext.tsx", () => ({
  useCheckout: () => ({
    resetCheckout: jest.fn(),
  }),
}));

jest.mock("../components/CheckoutProgress", () => () => (
  <div data-testid="checkout-progress" />
));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: jest.fn(),
  };
});

import { useLocation } from "react-router-dom";

describe("✅ SuccessPage full coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders successfully with order number and no balance", () => {
    useLocation.mockReturnValue({
      state: { orderNumber: "ABC123" }
    });

    render(<SuccessPage />, { wrapper: BrowserRouter });

    expect(screen.getByText("Thank you for your order!")).toBeInTheDocument();
    expect(screen.getByText("Your order # is:")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("We will email you an order confirmation")).toBeInTheDocument();
    expect(screen.queryByText("Account Updated")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("CONTINUE SHOPPING"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("renders successfully with fallback order number and balance", () => {
  useLocation.mockReturnValue({
    state: {
      balance: {
        remaining: 150.25,
        totalSpent: 49.75,
      }
    }
  });

  render(<SuccessPage />, { wrapper: BrowserRouter });

  expect(screen.getByText("1234567")).toBeInTheDocument(); // fallback
  expect(screen.getByText("Account Updated")).toBeInTheDocument();

  const balanceSection = screen.getByText("Account Updated").closest(".balance-update");
  const utils = within(balanceSection);

  expect(utils.getByText("Remaining Balance:")).toBeInTheDocument();
  expect(utils.getByText("$150.25")).toBeInTheDocument();

  expect(utils.getByText("Total Spent:")).toBeInTheDocument();
  expect(utils.getByText("$49.75")).toBeInTheDocument();
});
  
});
