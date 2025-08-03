import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Home from "../pages/AdminDashboard/tabs/Home";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

process.env.REACT_APP_API_URL = "http://mock-api";
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  localStorage.setItem("token", "mocked-token");
});

const mockRevenue = {
  totalRevenue: 888.88,
  totalOrders: 8,
  averageOrderValue: 111.11,
};

const mockActiveOrders = {
  activeOrders: [
    {
      orderNumber: "A001",
      customerName: "Jane",
      total: 200,
      status: "Shipping",
    },
  ],
};

test("shows loading state initially", () => {
  fetch.mockImplementation(() => new Promise(() => {})); // never resolves
  render(<Home />, { wrapper: MemoryRouter });
  expect(screen.getByText("Loading dashboard data...")).toBeInTheDocument();
});

test("renders revenue and active orders", async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockRevenue,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockActiveOrders,
    });

  render(<Home />, { wrapper: MemoryRouter });

  await screen.findByText("Dashboard Home");

  expect(await screen.findByText(/\$?888\.88/)).toBeInTheDocument();
  expect(screen.getByText("Total Orders: 8")).toBeInTheDocument();
  expect(screen.getByText((t) => t.includes("111.11"))).toBeInTheDocument();

  expect(screen.getByText("A001")).toBeInTheDocument();
  expect(screen.getByText("Jane")).toBeInTheDocument();
  expect(screen.getByText("$200.00")).toBeInTheDocument();
  expect(screen.getByText("Shipping")).toBeInTheDocument();
});

test("renders error when revenue fetch fails", async () => {
  fetch
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockActiveOrders,
    });

  render(<Home />, { wrapper: MemoryRouter });

  expect(await screen.findByText("Failed to fetch revenue data")).toBeInTheDocument();
});

test("renders error when orders fetch fails", async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockRevenue,
    })
    .mockResolvedValueOnce({ ok: false });

  render(<Home />, { wrapper: MemoryRouter });

  expect(await screen.findByText("Failed to fetch active orders")).toBeInTheDocument();
});

test("renders 'no orders' when activeOrders is empty", async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockRevenue,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeOrders: [] }),
    });

  render(<Home />, { wrapper: MemoryRouter });

  expect(await screen.findByText("No active orders found.")).toBeInTheDocument();
});

test("changes range and triggers re-fetch", async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockRevenue,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockActiveOrders,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockRevenue,
    });

  render(<Home />, { wrapper: MemoryRouter });

  await screen.findByText("Dashboard Home");

  const select = await screen.findByLabelText("Show revenue for:");
  fireEvent.change(select, { target: { value: "30" } });

  await waitFor(() =>
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("range=30"),
      expect.any(Object)
    )
  );
});

test("shows error on thrown exception in revenue fetch", async () => {
  fetch
    .mockImplementationOnce(() => {
      throw new Error("Network failure");
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockActiveOrders,
    });

  render(<Home />, { wrapper: MemoryRouter });

  expect(await screen.findByText("Error fetching revenue data")).toBeInTheDocument();
});
