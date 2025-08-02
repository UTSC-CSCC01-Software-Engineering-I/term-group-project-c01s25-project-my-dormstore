import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPassword from "../pages/ForgotPassword";
import "@testing-library/jest-dom";

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ForgotPassword component", () => {
  test("renders all static elements", () => {
    render(<ForgotPassword />);
    expect(screen.getByText(/Reset password/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send one-time code/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Terms and Privacy Policy/i)).toBeInTheDocument();
  });

  test("updates email input on change", () => {
    render(<ForgotPassword />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(input.value).toBe("test@example.com");
  });

  test("handles successful submit with custom message", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: "Custom reset message" }),
      })
    );

    render(<ForgotPassword />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send one-time code/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Custom reset message");
    });
  });

  test("handles successful submit without custom message", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );

    render(<ForgotPassword />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "no-message@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send one-time code/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Check your email for reset instructions.");
    });
  });

  test("handles fetch failure", async () => {
    global.fetch = jest.fn(() => Promise.reject("network error"));

    render(<ForgotPassword />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "fail@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send one-time code/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to send reset instructions.");
    });
  });
});
