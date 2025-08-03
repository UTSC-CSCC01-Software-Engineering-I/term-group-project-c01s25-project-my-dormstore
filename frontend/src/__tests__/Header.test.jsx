import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../components/Header"; 
import "@testing-library/jest-dom";

describe("Header component", () => {
  test("renders logo image", () => {
    const { container } = render(<Header />);
    const logo = screen.getByAltText("My Dorm Store Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/mydormstroe_log.webp");
  });

  test("renders search bar with icon and input", () => {
    render(<Header />);
    const searchIcon = screen.getByAltText("Search Icon");
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toHaveAttribute("src", "/search.png");

    const input = screen.getByPlaceholderText("Search");
    expect(input).toBeInTheDocument();
  });

  test("renders all header icons", () => {
    render(<Header />);

    expect(screen.getByAltText("Language icon")).toBeInTheDocument();
    expect(screen.getByText(/CA \| English/i)).toBeInTheDocument();

    expect(screen.getByAltText("User icon")).toBeInTheDocument();
    expect(screen.getByAltText("Checklist icon")).toBeInTheDocument();
    expect(screen.getByAltText("Cart icon")).toBeInTheDocument();
  });
});
