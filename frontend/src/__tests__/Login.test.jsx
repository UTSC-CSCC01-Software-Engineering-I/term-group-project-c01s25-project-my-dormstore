import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../pages/Login";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

// Setup mocks
const alertMock = jest.fn();
const locationMock = { href: "" };

Object.defineProperty(window, "alert", { value: alertMock });
delete window.location;
window.location = locationMock;

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const renderLogin = () =>
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

describe("Login component full coverage without modifying component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders and allows typing", () => {
    renderLogin();

    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThan(0);

    fireEvent.change(inputs[0], { target: { value: "test@example.com" } });
    expect(inputs[0].value).toBe("test@example.com");

    const passwordInput = document.querySelector("input[type='password']");
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    expect(passwordInput.value).toBe("123456");
  });

  test("toggles password visibility", () => {
    renderLogin();
    const toggleIcon = screen.getByRole("img", { name: "Toggle visibility" });
    const passwordInput = document.querySelector("input.input-password3[type='password']");
    expect(passwordInput).toBeInTheDocument();

    fireEvent.click(toggleIcon);
    const newPasswordInput = document.querySelector("input.input-password3[type='text']");
    expect(newPasswordInput).toBeInTheDocument();
  });

  test("remembers saved email from localStorage", () => {
    localStorage.getItem.mockReturnValueOnce("saved@test.com");
    renderLogin();
    const input = screen.getAllByRole("textbox")[0];
    expect(input.value).toBe("saved@test.com");
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(true);
  });

  test("checkbox toggle works", () => {
    renderLogin();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test("alert shown if fields empty", () => {
    renderLogin();
    const signInBtn = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(signInBtn);
    expect(alertMock).toHaveBeenCalledWith("Please enter both email and password.");
  });

  test("successful login", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "abc123" }),
    });

    renderLogin();
    const [emailInput] = screen.getAllByRole("textbox");
    const passwordInput = document.querySelector("input[type='password']");
    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "pass123" } });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Login successful");
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "abc123");
      expect(localStorage.setItem).toHaveBeenCalledWith("userEmail", "user@test.com");
      expect(window.location.href).toBe("/");
    });
  });

  test("login failed with error message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    renderLogin();
    const [emailInput] = screen.getAllByRole("textbox");
    const passwordInput = document.querySelector("input[type='password']");
    fireEvent.change(emailInput, { target: { value: "fail@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  test("login failed with generic fallback", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    renderLogin();
    const [emailInput] = screen.getAllByRole("textbox");
    const passwordInput = document.querySelector("input[type='password']");
    fireEvent.change(emailInput, { target: { value: "fail@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Login failed");
    });
  });

  test("network error handled", async () => {
    fetch.mockRejectedValueOnce(new Error("network error"));

    renderLogin();
    const [emailInput] = screen.getAllByRole("textbox");
    const passwordInput = document.querySelector("input[type='password']");
    fireEvent.change(emailInput, { target: { value: "fail@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Something went wrong.");
    });
  });

  test("forgot password redirects", () => {
    renderLogin();
    fireEvent.click(screen.getByText("Forgot password?"));
    expect(window.location.href).toBe("/forgot-password");
  });

  test("links render correctly", () => {
    renderLogin();
    expect(screen.getByText("Register here").closest("a")).toHaveAttribute("href", "/register");
    expect(
      screen.getByText(/Terms and Privacy Policy/i).closest("a")
    ).toHaveAttribute("href", "https://mydormstore.ca/policies/terms-of-service");
  });
});
