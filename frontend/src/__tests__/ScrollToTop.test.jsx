import React from "react";
import { render } from "@testing-library/react";
import ScrollToTop from "../components/ScrollToTop";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "@testing-library/jest-dom";
// Mock window.scrollTo
beforeAll(() => {
  window.scrollTo = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

function TestPage() {
  const navigate = useNavigate();

  // Trigger path change after mount
  useEffect(() => {
    setTimeout(() => {
      navigate("/page2");
    }, 0);
  }, [navigate]);

  return (
    <>
      <ScrollToTop />
      <div>Test Page</div>
    </>
  );
}

describe("ScrollToTop", () => {
  test("scrolls to top on pathname change", async () => {
    render(
      <MemoryRouter initialEntries={["/page1"]}>
        <Routes>
          <Route path="/page1" element={<TestPage />} />
          <Route path="/page2" element={<ScrollToTop />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for navigation to happen and effect to trigger
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  });
});
