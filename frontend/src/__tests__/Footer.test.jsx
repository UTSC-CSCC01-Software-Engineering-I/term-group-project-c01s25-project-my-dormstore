import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom';

describe("Footer component", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  test("renders all section headings", () => {
    expect(screen.getByRole("heading", { name: "My Account" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Help" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About Us" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contact Us" })).toBeInTheDocument();
  });

  test("renders all My Account links", () => {
    expect(screen.getByText("My profile")).toHaveAttribute("href", "/profile");
    expect(screen.getByText("Sign in")).toHaveAttribute("href", "/signin");
    expect(screen.getByText("Register")).toHaveAttribute("href", "/register");
    expect(screen.getByText("Order Status")).toHaveAttribute("href", "/order-status");
    expect(screen.getByText("Order Tracking")).toHaveAttribute("href", "/order-status#order-tracking");
  });

  test("renders all Help links", () => {
    expect(screen.getByText("Services")).toHaveAttribute("href", "/our-story");
    expect(screen.getByText("FAQ")).toHaveAttribute("href", "/faq");
  });

  test("renders all About Us links", () => {
    expect(screen.getByText("Our Dorm Story")).toHaveAttribute("href", "/our-story");
    expect(screen.getByText("Our Blog")).toHaveAttribute("href", "/blog");
    expect(screen.getByText("Ambassador Program")).toHaveAttribute("href", "/ambassador");
  });

  test("renders all Contact Us links", () => {
    expect(screen.getByText("Live Chat")).toHaveAttribute("href", "/live-chat");
    expect(screen.getAllByText("Contact Us")[1]).toHaveAttribute("href", "/contact");
  });

  test("renders social media icons", () => {
    expect(screen.getByAltText("Instagram")).toBeInTheDocument();
    expect(screen.getByAltText("TikTok")).toBeInTheDocument();
  });

  test("renders payment icons", () => {
    expect(screen.getByAltText("AmEx")).toBeInTheDocument();
    expect(screen.getByAltText("Apple Pay")).toBeInTheDocument();
    expect(screen.getByAltText("Diners Club")).toBeInTheDocument();
    expect(screen.getByAltText("Discover")).toBeInTheDocument();
    expect(screen.getByAltText("Google Pay")).toBeInTheDocument();
    expect(screen.getByAltText("Mastercard")).toBeInTheDocument();
    expect(screen.getByAltText("PayPal")).toBeInTheDocument();
    expect(screen.getByAltText("Visa")).toBeInTheDocument();
  });

  test("language switcher is clickable (UI only)", () => {
    const button = screen.getByRole("button", { name: /ca \| english/i });
    userEvent.click(button); // no-op, UI only
    expect(button).toBeEnabled();
  });

  test("renders legal links", () => {
    expect(screen.getByText("Refund Policy")).toHaveAttribute("href", "/refund");
    expect(screen.getByText("Privacy Policy")).toHaveAttribute("href", "/privacy");
    expect(screen.getByText("Terms of Service")).toHaveAttribute("href", "/terms");
    expect(screen.getByText("Shipping Policy")).toHaveAttribute("href", "/shipping");
    expect(screen.getByText("Cookie Policy")).toHaveAttribute("href", "/cookies");
  });

  test("renders copyright", () => {
    expect(screen.getByText(/© 2025, My Dorm Store/i)).toBeInTheDocument();
  });
});
