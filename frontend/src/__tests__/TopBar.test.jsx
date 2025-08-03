import React from "react";
import { render, screen } from "@testing-library/react";
import TopBar from "../components/TopBar"; 
import "@testing-library/jest-dom";

describe("TopBar", () => {
  test("renders the top bar message", () => {
    render(<TopBar />);
    const message = screen.getByText(/Trusted by Universities & Colleges!/i);
    expect(message).toBeInTheDocument();
  });
});
