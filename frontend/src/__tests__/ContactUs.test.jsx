import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactUs from "../pages/ContactUs/ContactUs";

global.fetch = jest.fn();

describe("ContactUs", () => {
  const mockData = {
    name: "Judy",
    phone: "1234567890",
    email: "judy@example.com",
    message: "Test message content.",
  };

  beforeEach(() => {
    fetch.mockReset(); 
    render(<ContactUs />);
  });

  test("renders all form inputs and submit button", () => {
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  test("allows user input", () => {
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: mockData.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone number"), {
      target: { value: mockData.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: mockData.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Message"), {
      target: { value: mockData.message },
    });

    expect(screen.getByPlaceholderText("Name")).toHaveValue(mockData.name);
    expect(screen.getByPlaceholderText("Phone number")).toHaveValue(mockData.phone);
    expect(screen.getByPlaceholderText("Email")).toHaveValue(mockData.email);
    expect(screen.getByPlaceholderText("Message")).toHaveValue(mockData.message);
  });

  test("displays success message when submission is successful", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: mockData.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: mockData.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Message"), {
      target: { value: mockData.message },
    });

    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/Message sent successfully!/i)).toBeInTheDocument()
    );
  });

  test("displays error message when response is not ok", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Something went wrong" }),
    });

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: mockData.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: mockData.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Message"), {
      target: { value: mockData.message },
    });

    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/❌ Failed: Something went wrong/i)).toBeInTheDocument()
    );
  });

  test("displays network error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: mockData.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: mockData.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Message"), {
      target: { value: mockData.message },
    });

    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    );
  });
});
