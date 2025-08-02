import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";

jest.mock("../pages/admindashboard/tabs/Home", () => () => <div>Mock Home Page</div>);
jest.mock("../pages/admindashboard/tabs/Orders", () => () => <div>Mock Orders Page</div>);
jest.mock("../pages/admindashboard/tabs/OrderUpdate", () => () => <div>Mock Order Update</div>);
jest.mock("../pages/admindashboard/tabs/ProductManagement", () => () => <div>Mock Product Management</div>);
jest.mock("../pages/admindashboard/tabs/AmbassadorList", () => () => <div>Mock Ambassador List</div>);
jest.mock("../pages/admindashboard/tabs/UserList", () => () => <div>Mock User List</div>);


// ✅ helper to render with router
function renderWithRouter(initialRoute = "/admin/home") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<div>Mock Admin Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminDashboard", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("renders all sidebar links", () => {
    renderWithRouter();

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Order Update")).toBeInTheDocument();
    expect(screen.getByText("Product Management")).toBeInTheDocument();
    expect(screen.getByText("Ambassador List")).toBeInTheDocument();
    expect(screen.getByText("User List")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  test("renders Home tab content", () => {
    renderWithRouter("/admin/home");
    expect(screen.getByText("Mock Home Page")).toBeInTheDocument();
  });

  test("renders Orders tab content", () => {
    renderWithRouter("/admin/orders");
    expect(screen.getByText("Mock Orders Page")).toBeInTheDocument();
  });

  test("renders Order Update tab content", () => {
    renderWithRouter("/admin/update");
    expect(screen.getByText("Mock Order Update")).toBeInTheDocument();
  });

  test("renders Product Management tab content", () => {
    renderWithRouter("/admin/products");
    expect(screen.getByText("Mock Product Management")).toBeInTheDocument();
  });

  test("renders Ambassador List tab content", () => {
    renderWithRouter("/admin/ambassadors");
    expect(screen.getByText("Mock Ambassador List")).toBeInTheDocument();
  });

  test("renders User List tab content", () => {
    renderWithRouter("/admin/users");
    expect(screen.getByText("Mock User List")).toBeInTheDocument();
  });

  test("redirects from /admin to /admin/home", () => {
    renderWithRouter("/admin");
    expect(screen.getByText("Mock Home Page")).toBeInTheDocument();
  });

  test("logout removes isAdmin from localStorage and navigates to login", () => {
    localStorage.setItem("isAdmin", "true");

    renderWithRouter("/admin/home");
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(localStorage.getItem("isAdmin")).toBeNull();
    expect(screen.getByText("Mock Admin Login")).toBeInTheDocument();
  });
});
