import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Content from "../components/Content.jsx"; // ✅ 按你实际路径修改

describe("Homepage Content component", () => {
  test("renders title and Learn More link", () => {
    render(
      <MemoryRouter>
        <Content />
      </MemoryRouter>
    );

    const heading = screen.getByRole("heading", {
      name: /make your dorm into your home/i,
    });
    expect(heading).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /learn more/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/products");
    expect(link).toHaveClass("cta-button");
  });
});
