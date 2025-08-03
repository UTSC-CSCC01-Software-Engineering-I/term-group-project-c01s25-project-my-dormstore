import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../pages/adminlayout";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  localStorage.setItem("isAdmin", "true");
  mockNavigate.mockClear();
});

const renderWithRoute = (initialRoute = "/admin") => {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="home" element={<div>Home Page</div>} />
          <Route path="orders" element={<div>Orders Page</div>} />
          <Route path="update" element={<div>Update Page</div>} />
          <Route path="products" element={<div>Products Page</div>} />
          <Route path="ambassadors" element={<div>Ambassadors Page</div>} />
          <Route path="users" element={<div>Users Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe("AdminLayout", () => {
  it("renders all NavLinks and logo", () => {
    renderWithRoute("/admin/home");

    expect(screen.getByAltText("MyDormStore Logo")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Order Update")).toBeInTheDocument();
    expect(screen.getByText("Product Management")).toBeInTheDocument();
    expect(screen.getByText("Ambassador List")).toBeInTheDocument();
    expect(screen.getByText("User List")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders correct outlet content", () => {
    renderWithRoute("/admin/orders");
    expect(screen.getByText("Orders Page")).toBeInTheDocument();
  });

  it("navigates to login and clears isAdmin on logout", () => {
    renderWithRoute("/admin/home");
    fireEvent.click(screen.getByText("Logout"));

    expect(localStorage.getItem("isAdmin")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/admin-login");
  });

  it("applies active class to active NavLink", () => {
    renderWithRoute("/admin/products");

    const link = screen.getByText("Product Management");
    expect(link).toHaveClass("active");
  });
});
