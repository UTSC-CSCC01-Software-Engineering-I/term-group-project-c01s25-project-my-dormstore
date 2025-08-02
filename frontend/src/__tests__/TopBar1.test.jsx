import React from "react";
import { render, screen } from "@testing-library/react";
import TopBar from "../components/TopBar.jsx"; 
import "@testing-library/jest-dom";

describe("TopBar", () => {
  test("renders the top bar with correct message", () => {
    render(<TopBar />);
    const heading = screen.getByRole("heading", {
      level: 4,
      name: /trusted by universities & colleges!/i,
    });
    expect(heading).toBeInTheDocument();
  });

  test("has correct class name", () => {
    const { container } = render(<TopBar />);
    expect(container.firstChild).toHaveClass("top-bar");
  });
});
