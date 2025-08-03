import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import { BrowserRouter } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useCheckout } from "../contexts/CheckoutContext";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../contexts/CartContext", () => ({ useCart: jest.fn() }));
jest.mock("../contexts/CheckoutContext", () => ({ useCheckout: jest.fn() }));

const mockItems = [
  {
    id: 1,
    name: "Twin Sheet",
    price: 100,
    quantity: 1,
    image: "/img.jpg",
  },
];

const mockCheckoutData = {
  moveInDate: new Date("2025-08-01"),
  email: "test@example.com",
  shipping: {
    firstName: "John",
    lastName: "Doe",
    phone: "1234567890",
    address: "123 Street",
    city: "Toronto",
    province: "ON",
    postalCode: "A1B2C3",
    saveToAccount: true,
  },
  shippingMethod: "Xpresspost",
  shippingCost: 24.2,
};

const mockUpdateFns = {
  updateEmail: jest.fn(),
  updateShipping: jest.fn(),
  updateMoveInDate: jest.fn(),
  updateShippingMethod: jest.fn(),
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <CheckoutPage />
    </BrowserRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("token", "mock-token");

  useCart.mockReturnValue({ items: mockItems, totalPrice: 100 });
  useCheckout.mockReturnValue({ checkoutData: mockCheckoutData, ...mockUpdateFns });

  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ balance: 200, totalSpent: 800 }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: "test@example.com",
        first_name: "John",
        last_name: "Doe",
        phone: "1234567890",
        address: "123 Street",
        city: "Toronto",
        province: "ON",
        postal_code: "A1B2C3",
      }),
    });
});

test("renders all sections correctly", async () => {
  renderComponent();

  expect(screen.getByText("Checkout")).toBeInTheDocument();
  expect(screen.getByText("Order Summary")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Your Balance")).toBeInTheDocument();

    expect(screen.getByText((_, node) =>
      node.textContent === "Available: $200.00"
    )).toBeInTheDocument();

    expect(screen.getByText((_, node) =>
      node.textContent === "Total Spent: $800.00"
    )).toBeInTheDocument();
  });
});

test("shows insufficient funds message", async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ balance: 10, totalSpent: 999 }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

  renderComponent();

  const warnings = await screen.findAllByText(/Insufficient funds/i);
  expect(warnings.length).toBeGreaterThanOrEqual(1);

  const button = screen.getByRole("button", { name: /insufficient funds/i });
  expect(button).toBeDisabled();
});

test("handles input changes and checkbox", async () => {
  renderComponent();
  await screen.findByText("Your Balance");

  fireEvent.change(screen.getByPlaceholderText("Email address"), {
    target: { value: "changed@email.com" },
  });
  expect(mockUpdateFns.updateEmail).toHaveBeenCalledWith("changed@email.com");

  fireEvent.click(screen.getByRole("checkbox"));
  expect(mockUpdateFns.updateShipping).toHaveBeenCalled();
});

test("changes shipping method", async () => {
  renderComponent();
  await screen.findByText("Your Balance");

  const radio = screen.getByDisplayValue("Purolator Express®");
  fireEvent.click(radio);
  expect(mockUpdateFns.updateShippingMethod).toHaveBeenCalledWith("Purolator Express®", expect.any(Number));
});

test("submits and updates user profile", async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ balance: 999, totalSpent: 1 }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    .mockResolvedValueOnce({ ok: true });

  renderComponent();
  await screen.findByText("Your Balance");

  fireEvent.click(screen.getByRole("button", { name: /next step/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/user/update"),
      expect.objectContaining({ method: "PUT" })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/checkout/payment");
  });
});

test("redirects to products if cart is empty", () => {
  useCart.mockReturnValueOnce({ items: [], totalPrice: 0 });

  renderComponent();
  expect(mockNavigate).toHaveBeenCalledWith("/products");
});

test("shows loading state before data is loaded", async () => {
  global.fetch = jest.fn(() => new Promise(() => {}));

  renderComponent();
  expect(screen.getByText("Checkout")).toBeInTheDocument();
});

test("redirects and renders nothing if cart is empty", () => {
  useCart.mockReturnValueOnce({ items: [], totalPrice: 0 });

  const { container } = render(
    <BrowserRouter>
      <CheckoutPage />
    </BrowserRouter>
  );

  expect(mockNavigate).toHaveBeenCalledWith("/products");
  expect(container.innerHTML).toBe("");
});

test("enables button if user has sufficient balance", async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ balance: 113, totalSpent: 0 }) }) // 100 + 0 + 13 = 113
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

  renderComponent();

  const button = await screen.findByRole("button", { name: /next step/i });
  expect(button).toBeEnabled();
});

test("handles case where no token exists", async () => {
  localStorage.removeItem("token");

  renderComponent();

  await waitFor(() => {
    expect(screen.getByText("Checkout")).toBeInTheDocument(); // still renders
  });
});

