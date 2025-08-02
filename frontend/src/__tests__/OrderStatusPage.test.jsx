import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import OrderStatusPage from "../pages/OrderStatusPage";
import "@testing-library/jest-dom";

// Suppress router warnings
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (
      msg.includes("React Router Future Flag Warning") ||
      msg.includes("Relative route resolution")
    )
      return;
    console.warn(msg);
  });
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper: render with route
const renderWithRoute = (initialPath = "/track/ABC123?email=test@example.com") => {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/track/:orderId" element={<OrderStatusPage />} />
      </Routes>
    </MemoryRouter>
  );
};

// Common mock order
const mockOrder = {
  created_at: "2025-08-01T00:00:00Z",
  order_number: "ABC123",
  total: 120,
  order_status: "Shipped",
  estimated_delivery: "2025-08-07",
};

describe("OrderStatusPage - 100% coverage", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockReset();
  });

  test("renders full order status when fetch returns success", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockOrder }),
    });

    renderWithRoute();

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("YOURORDERSTATUS");
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("$120")).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("2025-08-07")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /VIEW ORDER DETAILS/i })).toBeInTheDocument();
  });

  test("renders fallback when fetch returns order_number without success", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ order_number: "ABC123", created_at: "2025-08-01T00:00:00Z", total: 120, order_status: "Shipped" }),
    });

    renderWithRoute();

    expect(await screen.findByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
  });

  test("handles unexpected API format", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    fetch.mockResolvedValueOnce({ json: async () => ({ something: "unexpected" }) });

    renderWithRoute();

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith("Unexpected response format");
    });

    warnSpy.mockRestore();
  });

  test("handles fetch error", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error("Fetch failed"));

    renderWithRoute();

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error fetching order:", expect.any(Error));
    });

    errorSpy.mockRestore();
  });

  test("does not fetch if orderId or email is missing", async () => {
    fetch.mockClear(); // Make sure nothing runs

    renderWithRoute("/track/ABC123"); // no email param

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test("clicking view order details navigates", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockOrder }),
    });

    renderWithRoute();

    const button = await screen.findByRole("button", { name: /VIEW ORDER DETAILS/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/order-details/ABC123");
  });
});
