import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Blog from "../pages/OurStoryBlog/Blog/Blog";

// Mock useNavigate
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

describe("Blog Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders banner and header", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );

    expect(screen.getByText(/My Dorm Store Blog/i)).toBeInTheDocument();
    expect(screen.getByText(/go-to resource/i)).toBeInTheDocument();
  });

  test("renders first page of blog posts", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );

    const cards = screen.getAllByRole("heading", { level: 3 });
    expect(cards.length).toBe(9); // first page has 9 posts
    expect(screen.getByText(/Spring Semester Reset/i)).toBeInTheDocument();
  });

  test("navigates to second page on pagination click", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );

    const page2 = screen.getByText("2");
    fireEvent.click(page2);

    const cards = screen.getAllByRole("heading", { level: 3 });
    expect(cards.length).toBe(3); // remaining 3 posts on page 2
  });

  test("navigates to blog detail page on blog card click", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );

    const firstCard = screen.getByText(/Spring Semester Reset/i);
    fireEvent.click(firstCard);

    expect(mockNavigate).toHaveBeenCalledWith("/blog/1");
  });

  test("correct page number is active", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );

    const activePage = screen.getByText("1");
    expect(activePage).toHaveClass("active");
  });
});
