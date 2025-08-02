import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OrderUpdate from "../pages/AdminDashboard/tabs/OrderUpdate";
import { MemoryRouter } from "react-router-dom";
import '@testing-library/jest-dom';

beforeEach(() => {
  localStorage.setItem("token", "mock-token");
  jest.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

// Mock fetch
global.fetch = jest.fn();

const mockOrders = [
  {
    id: 1,
    order_number: "ORD001",
    email: "alice@example.com",
    update_text: "Where is my order?",
    status: "wait for process",
  },
  {
    id: 2,
    order_number: "ORD002",
    email: "bob@example.com",
    update_text: "Please ship faster",
    status: "processing",
  },
  {
    id: 3,
    order_number: "ORD003",
    email: "carol@example.com",
    update_text: "Thanks!",
    status: "done",
  },
];

test("renders fetched order updates", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockOrders }),
  });

  render(<OrderUpdate />, { wrapper: MemoryRouter });

  await screen.findByText("ORD001");
  expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  expect(screen.getByText("Where is my order?")).toBeInTheDocument();
  expect(screen.getAllByRole("combobox").length).toBeGreaterThan(1);
});

test("filters orders by status", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockOrders }),
  });

  render(<OrderUpdate />, { wrapper: MemoryRouter });

  await screen.findByText("Order Update");

  const allCombos = screen.getAllByRole("combobox");
  const filter = allCombos[0]; 
  fireEvent.change(filter, { target: { value: "done" } });

  await waitFor(() => {
    expect(screen.getByText("ORD003")).toBeInTheDocument();
    expect(screen.queryByText("ORD001")).not.toBeInTheDocument();
    expect(screen.queryByText("ORD002")).not.toBeInTheDocument();
  });
});

test("handles status change and sends PATCH request", async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockOrders }),
    })
    .mockResolvedValueOnce({ ok: true }); 

  render(<OrderUpdate />, { wrapper: MemoryRouter });

  await screen.findByText("ORD001");

  const allCombos = screen.getAllByRole("combobox");
  const statusSelect = allCombos[1];
  fireEvent.change(statusSelect, { target: { value: "done" } });

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/update-status"),
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
        body: JSON.stringify({ id: 1, status: "done" }),
      })
    );
  });
});

test("handles fetch failure gracefully", async () => {
  fetch.mockRejectedValueOnce(new Error("Fetch failed"));

  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  render(<OrderUpdate />, { wrapper: MemoryRouter });

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch updates:",
      expect.any(Error)
    );
  });

  consoleSpy.mockRestore();
});

test("handles error when res.ok is false", async () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Something went wrong" }),
  });

  render(<OrderUpdate />, { wrapper: MemoryRouter });

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith("Error:", "Something went wrong");
  });

  consoleSpy.mockRestore();
});

test("logs error when PATCH request fails", async () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockOrders }),
    })
    .mockRejectedValueOnce(new Error("PATCH failed"));

  render(<OrderUpdate />, { wrapper: MemoryRouter });

  await screen.findByText("ORD001");
  const allCombos = screen.getAllByRole("combobox");
  const statusSelect = allCombos[1]; // select for ORD001
  fireEvent.change(statusSelect, { target: { value: "done" } });

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to update status:",
      expect.any(Error)
    );
  });

  consoleSpy.mockRestore();
});
