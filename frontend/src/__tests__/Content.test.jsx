import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import Content from "../components/Content";
import { MemoryRouter } from "react-router-dom";

describe("Content.jsx", () => {
  test("renders heading and link", () => {
    render(
      <MemoryRouter>
        <Content />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /make your dorm into your home/i })
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /learn more/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/products");
    expect(link).toHaveClass("cta-button");
  });
});
