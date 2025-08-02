import React from "react";
import { render, screen } from "@testing-library/react";
import RequireAdmin from "../components/RequireAdmin";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";

const ProtectedComponent = () => <div>Admin Page</div>;
const LoginComponent = () => <div>Redirected to Login</div>;

describe("RequireAdmin", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders children if isAdmin is true", () => {
    localStorage.setItem("isAdmin", "true");

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <ProtectedComponent />
              </RequireAdmin>
            }
          />
          <Route path="/admin-login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Page")).toBeInTheDocument();
  });

  test("redirects to /admin-login if isAdmin is not true", () => {
    localStorage.setItem("isAdmin", "false");

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <ProtectedComponent />
              </RequireAdmin>
            }
          />
          <Route path="/admin-login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Redirected to Login")).toBeInTheDocument();
  });

  test("redirects to /admin-login if isAdmin is missing", () => {
    // isAdmin not set at all
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <ProtectedComponent />
              </RequireAdmin>
            }
          />
          <Route path="/admin-login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Redirected to Login")).toBeInTheDocument();
  });
});
