import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import OrderDetailPage from "../pages/OrderDetailPage";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ orderId: "12345" }),
}));

global.fetch = jest.fn();

const mockOrder = {
  order_number: "ABC123",
  created_at: "2025-08-01T10:00:00Z",
  order_status: "Shipped",
  payment_method: "Credit Card",
  items: [
    { name: "Bed Sheet", quantity: 2, price: 20 },
    { name: "Towel", quantity: 1, price: 10 },
  ],
  first_name: "John",
  last_name: "Doe",
  address: "123 Main St, Toronto",
  subtotal: 50,
  tax: 5,
  shipping_fee: 10,
  total: 65,
};

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("OrderDetailPage - 100% coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn(); // silence React Router warning
  });

  test("shows loading initially", async () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<OrderDetailPage />);
    expect(screen.getByText(/Loading order details/i)).toBeInTheDocument();
  });

  test("renders full order detail correctly", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ order: mockOrder }),
    });

    renderWithRouter(<OrderDetailPage />);
    expect(await screen.findByText("Order #")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("Credit Card")).toBeInTheDocument();

    // Items
    expect(screen.getByText("Bed Sheet")).toBeInTheDocument();
    expect(screen.getByText("x2")).toBeInTheDocument();
    expect(screen.getAllByText("$10.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$20.00").length).toBeGreaterThan(0);

    // Summary values
    expect(screen.getAllByText("$50.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$5.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$10.00").length).toBeGreaterThan(1);
    expect(screen.getAllByText("$65.00").length).toBeGreaterThan(0);

    // Shipping
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("123 Main St, Toronto")).toBeInTheDocument();
  });

  test("renders order with empty item list", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        order: { ...mockOrder, items: [] },
      }),
    });

    renderWithRouter(<OrderDetailPage />);
    expect(await screen.findByText("No items found.")).toBeInTheDocument();
  });

  test("renders fallback N/A and $0.00 when fields are null", async () => {
    const nullOrder = {
      order_number: "XYZ999",
      created_at: null,
      order_status: null,
      payment_method: null,
      items: [],
      first_name: null,
      last_name: null,
      address: null,
      subtotal: null,
      tax: null,
      shipping_fee: null,
      total: null,
    };

    fetch.mockResolvedValueOnce({
      json: async () => ({ order: nullOrder }),
    });

    renderWithRouter(<OrderDetailPage />);
    expect(await screen.findByText("XYZ999")).toBeInTheDocument();

    const naTags = screen.getAllByText("N/A");
    expect(naTags.length).toBeGreaterThanOrEqual(3); // status, payment, etc.

    const zeroTags = screen.getAllByText("$0.00");
    expect(zeroTags.length).toBeGreaterThanOrEqual(3);
  });

  test("logs error on fetch failure", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error("Network fail"));

    renderWithRouter(<OrderDetailPage />);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load order details",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
