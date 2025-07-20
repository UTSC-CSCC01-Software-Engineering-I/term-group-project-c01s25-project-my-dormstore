import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ProductManagement from "../pages/AdminDashboard/tabs/ProductManagement";
import "@testing-library/jest-dom";

beforeEach(() => {
  localStorage.setItem("token", "fake-token");
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch.mockClear();
});

test("renders and toggles between product/package category", async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // products
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // packages

  await act(async () => {
    render(<ProductManagement />);
  });

  expect(screen.getByText("Product")).toHaveClass("active");

  fireEvent.click(screen.getByText("Package"));
  expect(screen.getByText("Package")).toHaveClass("active");
});

test("submits new product", async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // products
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // packages
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ id: 1, name: "New Product", price: 10 }),
  });

  await act(async () => {
    render(<ProductManagement />);
  });

  fireEvent.click(screen.getByText("+ Add Product"));

  fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "New Product" } });
  fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "10" } });
  fireEvent.change(screen.getByPlaceholderText("Image URL"), { target: { value: "http://image.jpg" } });
  fireEvent.change(screen.getByPlaceholderText("Description"), { target: { value: "desc" } });
  fireEvent.change(screen.getByPlaceholderText("Stock"), { target: { value: 3 } });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "tech" } });

  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() =>
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/products"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("New Product"),
      })
    )
  );
});

test("submits new package with item", async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // products
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // packages
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ id: 99, name: "New Package" }),
  });

  await act(async () => {
    render(<ProductManagement />);
  });

  fireEvent.click(screen.getByText("Package"));
  fireEvent.click(screen.getByText("+ Add Package"));

  fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "New Package" } });
  fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "88" } });
  fireEvent.change(screen.getByPlaceholderText("Image URL"), { target: { value: "http://img.jpg" } });
  fireEvent.change(screen.getByPlaceholderText("Description"), { target: { value: "package desc" } });
  fireEvent.change(screen.getByPlaceholderText("Stock"), { target: { value: 1 } });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "Bedding" } });

  fireEvent.click(screen.getByText("+ Add Product"));

  const selects = screen.getAllByDisplayValue("");
  fireEvent.change(selects[selects.length - 1], { target: { value: "1" } });

  const quantityInputs = screen.getAllByDisplayValue("1");
  fireEvent.change(quantityInputs[quantityInputs.length - 1], { target: { value: "2" } });

  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() =>
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/packages"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("New Package"),
      })
    )
  );
});

test("removes package item before submitting", async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // products
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // packages

  await act(async () => {
    render(<ProductManagement />);
  });

  fireEvent.click(screen.getByText("Package"));
  fireEvent.click(screen.getByText("+ Add Package"));
  fireEvent.click(screen.getByText("+ Add Product"));

  const cancelBtns = screen.getAllByText("×");
  fireEvent.click(cancelBtns[cancelBtns.length - 1]);

  expect(screen.queryByText("×")).not.toBeInTheDocument();
});

test("edits package items inside edit form", async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // products
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [
      {
        id: 5,
        name: "Edit Package",
        price: 100,
        category: "Living",
        imageUrl: "",
        size: "",
        color: "",
        stock: 1,
        active: true,
        description: "desc",
        rating: 0,
      },
    ],
  }); // packages
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ product_id: 1, quantity: 1, product_name: "P1" }] }); // items
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: "P1" }] }); // all products
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 5, name: "Edited Package" }) }); // PUT

  await act(async () => {
    render(<ProductManagement />);
  });

  fireEvent.click(screen.getByText("Package"));
  await waitFor(() => screen.getByText("Edit Package"));

  fireEvent.click(screen.getByText("Edit"));

  fireEvent.change(screen.getByDisplayValue("Edit Package"), {
    target: { value: "Edited Package" },
  });

  fireEvent.click(screen.getByText("+ Add Product"));

  const selects = screen.getAllByDisplayValue("");
  fireEvent.change(selects[selects.length - 1], { target: { value: "1" } });

  const quantities = screen.getAllByDisplayValue("1");
  fireEvent.change(quantities[quantities.length - 1], { target: { value: "3" } });

  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() =>
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/packages/5"),
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining("Edited Package"),
      })
    )
  );
});
