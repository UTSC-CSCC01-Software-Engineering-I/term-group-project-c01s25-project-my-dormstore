import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Orders from "../pages/AdminDashboard/tabs/Orders";
import { MemoryRouter } from "react-router-dom";
import '@testing-library/jest-dom';

const mockOrders = [
  {
    id: 1,
    order_number: "ORD001",
    first_name: "Alice",
    last_name: "Smith",
    phone: "123-456-7890",
    address: "123 Main St",
    city: "Toronto",
    province: "ON",
    postal_code: "A1A 1A1",
    move_in_date: "2025-08-05T00:00:00Z",
    shipping: "UPS",
    shipping_method: "Express",
    payment_status: "Paid",
    order_status: "confirmed",
  },
  {
    id: 2,
    order_number: "ORD002",
    first_name: "Bob",
    last_name: "Lee",
    phone: "987-654-3210",
    address: "456 Bloor St",
    city: "Markham",
    province: "ON",
    postal_code: "B2B 2B2",
    move_in_date: null,
    shipping: "Canada Post",
    shipping_method: "Standard",
    payment_status: "Pending",
    order_status: "shipped",
  },
];

const mockDetails = {
  items: [
    {
      product_id: 101,
      product_name: "Lamp",
      product_price: "19.99",
      quantity: 2,
      subtotal: "39.98",
    },
  ],
  packages: [
    {
      package_id: 201,
      package_name: "Dorm Starter Pack",
      package_price: "99.99",
      quantity: 1,
      subtotal: "99.99",
    },
  ],
};

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.endsWith("/orders")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrders),
      });
    }
    if (url.includes("/orders/1/status")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    if (url.endsWith("/orders/1")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDetails),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders orders table with fetched data", async () => {
  render(<Orders />, { wrapper: MemoryRouter });
  await waitFor(() => {
    expect(screen.getByText("ORD001")).toBeInTheDocument();
    expect(screen.getByText("ORD002")).toBeInTheDocument();
  });
});

test("filters orders by status", async () => {
  render(<Orders />, { wrapper: MemoryRouter });
  await screen.findByText("ORD001");
  fireEvent.change(screen.getByLabelText("Filter by Status:"), {
    target: { value: "shipped" },
  });
  expect(screen.getByText("ORD002")).toBeInTheDocument();
  expect(screen.queryByText("ORD001")).not.toBeInTheDocument();
});

test("searches orders by keyword", async () => {
  render(<Orders />, { wrapper: MemoryRouter });
  await screen.findByText("ORD001");
  fireEvent.change(screen.getByPlaceholderText(/Search/i), {
    target: { value: "alice" },
  });
  expect(screen.getByText("ORD001")).toBeInTheDocument();
  expect(screen.queryByText("ORD002")).not.toBeInTheDocument();
});

test("expands and fetches order details", async () => {
  render(<Orders />, { wrapper: MemoryRouter });
  await screen.findByText("ORD001");
  fireEvent.click(screen.getAllByText("View Order Details")[0]);
  await waitFor(() => {
    expect(screen.getByText("Lamp")).toBeInTheDocument();
    expect(screen.getByText("Dorm Starter Pack")).toBeInTheDocument();
  });
});

test("changes order status and sends request", async () => {
  render(<Orders />, { wrapper: MemoryRouter });
  await screen.findByText("ORD001");
  fireEvent.change(screen.getAllByDisplayValue("Order Confirmed")[0], {
    target: { value: "processing" },
  });
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/orders/1/status"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ order_status: "processing" }),
      })
    );
  });
});

test("renders fallback when no orders found", async () => {
  fetch.mockImplementationOnce(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
  render(<Orders />, { wrapper: MemoryRouter });
  await screen.findByText("No orders found.");
});

test("handles fetch error gracefully", async () => {
  fetch.mockImplementationOnce(() => Promise.reject("API failed"));
  render(<Orders />, { wrapper: MemoryRouter });
  await screen.findByText("No orders found.");
});

test("handles error during order items fetch", async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    })
    .mockRejectedValueOnce(new Error("Failed to load items"));

  render(<Orders />, { wrapper: MemoryRouter });

  await screen.findByText("ORD001");
  fireEvent.click(screen.getAllByText("View Order Details")[0]);
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

test("handles error during status update", async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    })
    .mockRejectedValueOnce(new Error("Status update failed"));

  render(<Orders />, { wrapper: MemoryRouter });

  await screen.findByText("ORD001");
  fireEvent.change(screen.getAllByDisplayValue("Order Confirmed")[0], {
    target: { value: "processing" },
  });
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

test("collapses order details on second click", async () => {
  render(<Orders />, { wrapper: MemoryRouter });

  await screen.findByText("ORD001");

  const toggleButton = screen.getAllByText("View Order Details")[0];
  
  // First click: expand
  fireEvent.click(toggleButton);

  await screen.findByText("Lamp"); // wait for details to show

  // Second click: collapse
  fireEvent.click(screen.getByText("Hide Details"));

  // Assert that order details are hidden
  await waitFor(() => {
    expect(screen.queryByText("Lamp")).not.toBeInTheDocument();
  });
});
