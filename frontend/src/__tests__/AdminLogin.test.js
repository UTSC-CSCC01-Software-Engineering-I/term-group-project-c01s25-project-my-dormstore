// ✅ Set this before any imports
process.env.REACT_APP_API_URL = "http://localhost:5000";

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin/AdminLogin.jsx";
import fetchMock from "jest-fetch-mock";
import "@testing-library/jest-dom";
fetchMock.enableMocks();

// ✅ Mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
});

describe("AdminLogin", () => {
  test("renders form and submits with correct credentials", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ token: "mock-token" }), { status: 200 });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Admin Email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "admin123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/login"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@example.com",
            password: "admin123",
          }),
        })
      );
      expect(localStorage.getItem("isAdmin")).toBe("true");
      expect(mockNavigate).toHaveBeenCalledWith("/admin/home");
    });
  });

  test("displays error message on failed login", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Admin Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  test("redirects if already logged in as admin", () => {
    localStorage.setItem("isAdmin", "true");

    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/home" element={<div>Admin Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Home")).toBeInTheDocument();
  });
});
