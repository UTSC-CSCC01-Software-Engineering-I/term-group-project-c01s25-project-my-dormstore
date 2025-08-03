import React from "react";
import { render, screen } from "@testing-library/react";
import OurStory from "../pages/OurStoryBlog/OurStory/OurStory";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";


describe("OurStory Component", () => {
  test("renders all section headings", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>
    );

    expect(screen.getByText(/Made by students, for students/i)).toBeInTheDocument();
    expect(screen.getByText(/Your dorm is your home/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /We get it because we've been there/i,
        level: 1,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/The dorm shopping solution/i)).toBeInTheDocument();
  });

  test("renders all four images with correct alt text", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>
    );

    expect(screen.getByAltText("Our story")).toBeInTheDocument();
    expect(screen.getByAltText("Dorm life")).toBeInTheDocument();
    expect(screen.getByAltText("Student experience")).toBeInTheDocument();
    expect(screen.getByAltText("Dorm shopping solution")).toBeInTheDocument();
  });

  test("renders key paragraph content", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/My Dorm Store is the service we wish we had/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Moving for anyone can be a challenge/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/We know everyone has a different style/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/a curated dorm shopping solution made by students/i)
    ).toBeInTheDocument();
  });
});
