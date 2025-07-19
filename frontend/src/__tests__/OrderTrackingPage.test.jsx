import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OrderTrackingPage from "../pages/OrderTrackingPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ hash: "" }),
  };
});


describe("OrderTrackingPage", () => {
  // ✅ Global alert mock
  beforeEach(() => {
    process.env.REACT_APP_API_URL = "http://localhost:5000"; // or any valid dummy value
    global.fetch = jest.fn((url) => {
      if (url.includes("/api/order-updates")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      });
    });
    window.alert = jest.fn();
    jest.clearAllMocks();
  });

  test("renders both update and tracking sections", () => {
    render(
      <MemoryRouter>
        <OrderTrackingPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Order Updates/i, level: 2 })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Order Tracking/i, level: 2 })
    ).toBeInTheDocument();
  });

  test("submits update successfully", async () => {
    render(
      <MemoryRouter>
        <OrderTrackingPage />
      </MemoryRouter>
    );

    const inputs = screen.getAllByPlaceholderText("Order Number");

    fireEvent.change(inputs[0], { target: { value: "1234" } });
    fireEvent.change(screen.getByPlaceholderText(/^Email$/), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Order Update"), {
      target: { value: "Room 502" },
    });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith(
        "Order update submitted successfully!"
      );
    });
  });

  test("alerts when tracking fields are empty", () => {
    render(
      <MemoryRouter>
        <OrderTrackingPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Track Your Order"));

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter both order number and email/phone."
    );
  });

  test("navigates to order status when fields are filled", () => {
    render(
      <MemoryRouter>
        <OrderTrackingPage />
      </MemoryRouter>
    );

    const inputs = screen.getAllByPlaceholderText("Order Number");

    fireEvent.change(inputs[1], { target: { value: "5678" } });
    fireEvent.change(
      screen.getByPlaceholderText(/email or phone number/i),
      { target: { value: "track@example.com" } }
    );

    fireEvent.click(screen.getByText(/Track Your Order/i));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/order-status/5678?email=track@example.com"
    );
  });
});
