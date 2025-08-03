import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewPage from "../pages/CheckoutPage/ReviewPage";
import { BrowserRouter } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useCheckout } from "../contexts/CheckoutContext";
import "@testing-library/jest-dom";

// Mocks
jest.mock("../contexts/CartContext");
jest.mock("../contexts/CheckoutContext");
jest.mock("../components/CheckoutProgress", () => () => <div data-testid="checkout-progress" />);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

const baseCheckoutData = {
  email: "test@example.com",
  moveInDate: new Date("2025-08-10"),
  shipping: {
    firstName: "John",
    lastName: "Doe",
    phone: "1234567890",
    address: "123 Street",
    city: "City",
    province: "ON",
    postalCode: "A1A1A1",
  },
  payment: {
    method: "card",
    cardName: "VISA",
    cardNumber: "1234567890123456",
    sameAsShipping: false,
    billingAddress: {
      address: "456 Ave",
      city: "Town",
      province: "QC",
      postalCode: "B2B2B2",
    },
  },
  shippingMethod: "Express",
  shippingCost: 10,
};

const mockItems = [
  {
    id: 1,
    name: "Test Product",
    price: 100,
    quantity: 2,
    image: "/test.jpg",
    isPackage: false,
  },
];

describe("ReviewPage full coverage", () => {
  let originalFetch;
  let originalToken;

  beforeEach(() => {
    originalToken = localStorage.getItem("token");
    localStorage.setItem("token", "test-token");

    useCart.mockReturnValue({
      items: mockItems,
      totalPrice: 200,
      clearCart: jest.fn(),
    });

    useCheckout.mockReturnValue({
      checkoutData: baseCheckoutData,
    });

    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalToken) {
      localStorage.setItem("token", originalToken);
    } else {
      localStorage.removeItem("token");
    }
    jest.clearAllMocks();
  });

  test("renders all review fields", () => {
    render(<ReviewPage />, { wrapper: BrowserRouter });
    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(screen.getByText("Move-in date")).toBeInTheDocument();
    expect(screen.getByText("Notifications to")).toBeInTheDocument();
    expect(screen.getAllByText("Shipping")[0]).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.getByText("Paying with")).toBeInTheDocument();
    expect(screen.getByText("PLACE ORDER")).toBeInTheDocument();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  test("submits order successfully", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ order: { orderNumber: "123ABC" }, balance: 30 }),
    });

    render(<ReviewPage />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("PLACE ORDER"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/checkout/success", {
        state: { orderNumber: "123ABC", balance: 30 },
      });
    });
  });

  test("handles guest checkout (no token)", async () => {
    localStorage.removeItem("token");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ order: { orderNumber: "XYZ" } }),
    });

    render(<ReviewPage />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("PLACE ORDER"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/checkout/success", {
        state: { orderNumber: "XYZ" },
      });
    });
  });

  test("handles insufficient funds error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Insufficient funds",
        shortfall: 20,
        currentBalance: 5,
      }),
    });

    render(<ReviewPage />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("PLACE ORDER"));

    expect(await screen.findByText(/Insufficient funds/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Add Funds"));
    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  test("handles generic error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Something went wrong" }),
    });

    render(<ReviewPage />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("PLACE ORDER"));

    expect(await screen.findByText(/Failed to place order/)).toBeInTheDocument();
  });

  test("handles fetch error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ReviewPage />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("PLACE ORDER"));

    expect(await screen.findByText(/an error occurred/i)).toBeInTheDocument();
  });

  test("redirects if cart is empty", () => {
    useCart.mockReturnValue({
      items: [],
      totalPrice: 0,
      clearCart: jest.fn(),
    });

    render(<ReviewPage />, { wrapper: BrowserRouter });

    expect(mockNavigate).toHaveBeenCalledWith("/products");
  });

  test("disables button during submission", async () => {
    fetch.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<ReviewPage />, { wrapper: BrowserRouter });
    fireEvent.click(screen.getByText("PLACE ORDER"));
    expect(screen.getByText("PLACING ORDER...")).toBeInTheDocument();
  });
});
