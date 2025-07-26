import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import '@testing-library/jest-dom';



jest.mock("../components/Content", () => () => <div data-testid="content-component">Mocked Content</div>);

describe("HomePage Full Rendering", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  });

  // Content section
  test("renders Content component", () => {
    expect(screen.getByTestId("content-component")).toBeInTheDocument();
  });

  // Feature section
  test("renders feature section with headings and text", () => {
    expect(screen.getByText(/Built for/i)).toBeInTheDocument();
    expect(screen.getByText(/Backed by/i)).toBeInTheDocument();
    expect(screen.getByText(/The only package allowed to arrive/i)).toBeInTheDocument();
    expect(screen.getByText(/Bedding that makes your dorm feel like home/i)).toBeInTheDocument();
    expect(screen.getByText(/Everything your dorm room needs/i)).toBeInTheDocument();
  });

  // Video elements
  test("renders two video elements with sources", () => {
    const videos = document.querySelectorAll("video");
    expect(videos.length).toBe(2);
  });

  // Link icons
  test("renders all arrow icons and verifies link destinations", () => {
    const allLinks = screen.getAllByRole("link");
    const expectedPaths = ["/products", "/bedding", "/products", "/our-story", "/products"];
    expectedPaths.forEach((path) => {
      expect(allLinks.some((link) => link.getAttribute("href") === path)).toBe(true);
    });
  });

  // Parents section
  test("renders parents section with text", () => {
    expect(screen.getByText("Peace of Mind for Parents")).toBeInTheDocument();
    expect(screen.getByText(/From move-in day to midterms/i)).toBeInTheDocument();
  });

  // Apartment section
  test("renders apartment section", () => {
    expect(screen.getByText(/Off-Campus Apartment Living, Covered./i)).toBeInTheDocument();
    expect(screen.getByAltText("apartment boxes")).toBeInTheDocument();
  });

  // Campus logo section
  test("renders all campus logos", () => {
    const campuses = [
      "York", "Western", "Waterloo", "UofT", "Queen's",
      "McMaster", "Algoma", "Alberta", "Trent",
      "York-copy", "Western-copy", "Waterloo-copy", "UofT-copy", "Queen's-copy",
      "McMaster-copy", "Algoma-copy", "Alberta-copy", "Trent-copy"
    ];
    campuses.forEach((name) => {
      expect(screen.getByAltText(name)).toBeInTheDocument();
    });
  });

  // Gallery section
  test("renders gallery images", () => {
    expect(screen.getByAltText("Room 1")).toBeInTheDocument();
    expect(screen.getByAltText("Room 2")).toBeInTheDocument();
    expect(screen.getByAltText("Room 3")).toBeInTheDocument();
    expect(screen.getByAltText("Room 4")).toBeInTheDocument();
  });

  // Section structure
  test("renders section-wrapper divs and specific section classes", () => {
    expect(document.querySelectorAll(".section-wrapper").length).toBe(3);
    expect(document.querySelector(".feature-section")).toBeInTheDocument();
    expect(document.querySelector(".parents-section")).toBeInTheDocument();
    expect(document.querySelector(".apartment-section")).toBeInTheDocument();
    expect(document.querySelector(".campus-section")).toBeInTheDocument();
    expect(document.querySelector(".gallery-section")).toBeInTheDocument();
  });
});