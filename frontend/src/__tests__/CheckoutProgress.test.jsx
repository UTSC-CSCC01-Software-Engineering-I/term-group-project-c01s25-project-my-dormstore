import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(() => jest.fn()),
  };
});

describe("CheckoutProgress", () => {
  it("renders all steps and highlights the current step", async () => {
    render(
      <MemoryRouter>
        <CheckoutProgress currentStep={2} />
      </MemoryRouter>
    );
    await expect(screen.getByText("Cart")).toBeInTheDocument();
    await expect(screen.getByText("Shipping")).toBeInTheDocument();
    await expect(screen.getByText("Payment")).toBeInTheDocument();
    await expect(screen.getByText("Review")).toBeInTheDocument();
    await expect(screen.getByText("Complete")).toBeInTheDocument();
    // Current step should have class 'current'
    const paymentStep = screen.getByText("Payment").closest(".progress-step");
    expect(paymentStep).toHaveClass("current");
  });

  it("calls navigate when clicking on a previous step", async () => {
    const mockNavigate = jest.fn();
    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <CheckoutProgress currentStep={2} />
      </MemoryRouter>
    );
    // Click on 'Shipping' (step 1)
    fireEvent.click(screen.getByText("Shipping"));
    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  it("does not call navigate when clicking on a future step", async () => {
    const mockNavigate = jest.fn();
    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <CheckoutProgress currentStep={1} />
      </MemoryRouter>
    );
    // Click on 'Review' (future step)
    fireEvent.click(screen.getByText("Review"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
}); 