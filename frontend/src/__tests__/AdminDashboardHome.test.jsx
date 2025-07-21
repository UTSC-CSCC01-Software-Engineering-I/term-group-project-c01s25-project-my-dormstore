import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../pages/AdminDashboard/tabs/Home";
import "@testing-library/jest-dom";

const mockRevenue = {
  totalRevenue: 1234.56,
  totalOrders: 10,
  averageOrderValue: 123.46,
};
const mockOrders = [
  { orderNumber: "1001", customerName: "Alice Smith", total: 100.0, status: "Processing", createdAt: "2024-07-01" },
  { orderNumber: "1002", customerName: "Bob Lee", total: 200.0, status: "Shipped", createdAt: "2024-07-02" },
];

global.fetch = jest.fn((url) => {
  if (url.includes("/api/admin/revenue")) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRevenue) });
  }
  if (url.includes("/api/admin/orders/active")) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ activeOrders: mockOrders }) });
  }
  return Promise.reject("Unknown endpoint");
});

describe("AdminDashboard Home", () => {
  beforeEach(() => {
    localStorage.setItem("token", "testtoken");
    fetch.mockClear();
  });

  afterEach(() => {
    fetch.mockReset();
  });

  it.skip("renders revenue and recent orders", async () => {
    render(<Home />);
    expect(await screen.findByText("$1234.56")).toBeInTheDocument();
    expect(screen.getByText("Total Orders: 10")).toBeInTheDocument();
    expect(screen.getByText("Average Order Value: $123.46")).toBeInTheDocument();
    expect(screen.getByText("Orders In Progress")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Lee")).toBeInTheDocument();
  });

  it.skip("updates revenue when date filter changes", async () => {
    render(<Home />);
    expect(await screen.findByText("$1234.56")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Show revenue for:"), { target: { value: "30" } });
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("range=30"), expect.any(Object)));
  });

  it.skip("shows error message on fetch failure", async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));
    render(<Home />);
    expect(await screen.findByText(/Error fetching/)).toBeInTheDocument();
  });
}); 