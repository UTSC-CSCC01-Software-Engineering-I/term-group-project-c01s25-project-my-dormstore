import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BlogDetail from "../pages/OurStoryBlog/Blog/BlogDetail";

// mock useNavigate
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: jest.fn(),
    useNavigate: jest.fn(),
  };
});

import { useParams, useNavigate } from "react-router-dom";

describe("BlogDetail Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders blog post when valid id is provided", () => {
    useParams.mockReturnValue({ id: "1" });

    render(
      <MemoryRouter>
        <BlogDetail />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Spring Semester Reset/i);
    expect(screen.getByText(/Encourage a Clean Slate Mindset/i)).toBeInTheDocument();
  });

  test("displays 'Post not found' for invalid id", () => {
    useParams.mockReturnValue({ id: "999" });

    render(
      <MemoryRouter>
        <BlogDetail />
      </MemoryRouter>
    );

    expect(screen.getByText(/Post not found/i)).toBeInTheDocument();
  });

  test("calls navigate(-1) when back button is clicked", () => {
    useParams.mockReturnValue({ id: "2" });

    render(
      <MemoryRouter>
        <BlogDetail />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /back/i });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("renders multiple paragraphs from content", () => {
    useParams.mockReturnValue({ id: "1" });

    render(
      <MemoryRouter>
        <BlogDetail />
      </MemoryRouter>
    );

    const paragraphs = screen.getAllByText((_, el) => el.tagName.toLowerCase() === "p");
    expect(paragraphs.length).toBeGreaterThan(1); // ensure split content renders
  });
});
