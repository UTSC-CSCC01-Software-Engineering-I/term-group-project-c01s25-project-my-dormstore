import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../pages/Register";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (
      msg.includes("React Router Future Flag Warning") ||
      msg.includes("Relative route resolution")
    ) return;
    console.warn(msg);
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.spyOn(window, "alert").mockImplementation(() => {});
  delete window.location;
  window.location = { href: "" };
});

const renderWithRouter = () =>
  render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );

describe("Register component", () => {
  it("renders all elements", () => {
    renderWithRouter();
    expect(screen.getByText("Join us.")).toBeTruthy();
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("Password")).toBeTruthy();
    expect(screen.getByText("CREATE AN ACCOUNT")).toBeTruthy();
  });

  it("toggles password visibility", () => {
  renderWithRouter();

  const passwordWrapper = screen.getByText("Password").nextSibling;
  const passwordInput = passwordWrapper.querySelector("input");
  const toggleIcon = screen.getByAltText("Toggle visibility");

  expect(passwordInput).toHaveAttribute("type", "password");
  fireEvent.click(toggleIcon);
  expect(passwordInput).toHaveAttribute("type", "text");
  fireEvent.click(toggleIcon);
  expect(passwordInput).toHaveAttribute("type", "password");
});


  it("shows alert when email or password is missing", () => {
    renderWithRouter();
    fireEvent.click(screen.getByText("CREATE AN ACCOUNT"));
    expect(window.alert).toHaveBeenCalledWith("Please enter both email and password.");
  });

  it("shows success message on successful registration", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "123" }),
    });

    renderWithRouter();
    const inputs = screen.getAllByDisplayValue("");
    fireEvent.change(inputs[0], { target: { value: "test@example.com" } });
    fireEvent.change(inputs[1], { target: { value: "Password123" } });
    fireEvent.click(screen.getByText("CREATE AN ACCOUNT"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Account created successfully.");
      expect(window.location.href).toBe("/login");
    });
  });

  it("shows error message on failed registration with server error message", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Email already exists" }),
    });

    renderWithRouter();
    const inputs = screen.getAllByDisplayValue("");
    fireEvent.change(inputs[0], { target: { value: "test@example.com" } });
    fireEvent.change(inputs[1], { target: { value: "Password123" } });
    fireEvent.click(screen.getByText("CREATE AN ACCOUNT"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Email already exists");
    });
  });

  it("shows fallback error message on fetch exception", async () => {
    jest.spyOn(global, "fetch").mockRejectedValueOnce("Network error");

    renderWithRouter();
    const inputs = screen.getAllByDisplayValue("");
    fireEvent.change(inputs[0], { target: { value: "test@example.com" } });
    fireEvent.change(inputs[1], { target: { value: "Password123" } });
    fireEvent.click(screen.getByText("CREATE AN ACCOUNT"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Something went wrong.");
    });
  });
});