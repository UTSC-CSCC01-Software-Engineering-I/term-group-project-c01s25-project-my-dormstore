import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NavBar from "../components/NavBar";
import "@testing-library/jest-dom";

describe("NavBar", () => {
  const renderWithRouter = (initialPath = "/") =>
    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<NavBar isLoggedIn={true} />} />
        </Routes>
      </MemoryRouter>
    );

  test("renders main nav titles", () => {
    renderWithRouter();
    expect(screen.getByText("Shop Packages")).toBeInTheDocument();
    expect(screen.getByText("Shop by Items")).toBeInTheDocument();
    expect(screen.getByText("Our Story & Blog")).toBeInTheDocument();
    expect(screen.getByText("Customer Service")).toBeInTheDocument();
  });

  test("hovering Shop Packages shows package menu", async () => {
    renderWithRouter("/bedding");

    fireEvent.mouseEnter(screen.getByText("Shop Packages"));
    await waitFor(() => {
      expect(screen.getByAltText("Bedding")).toBeInTheDocument();
      expect(screen.getByText("View All")).toBeInTheDocument();
    });

    fireEvent.mouseLeave(screen.getByText("Shop Packages"));
  });

  test("hovering Shop by Items shows item menu", async () => {
    renderWithRouter("/bathroom");

    fireEvent.mouseEnter(screen.getByText("Shop by Items"));
    await waitFor(() => {
      expect(screen.getByAltText("Bathroom")).toBeInTheDocument();
      expect(screen.getByText("Tech")).toBeInTheDocument();
    });

    fireEvent.mouseLeave(screen.getByText("Shop by Items"));
  });

  test("hovering Our Story shows dropdown links", async () => {
    renderWithRouter();

    fireEvent.mouseEnter(screen.getByText("Our Story & Blog"));
    await waitFor(() => {
      expect(screen.getByText("Our Dorm Story")).toBeInTheDocument();
      expect(screen.getByText("My Dorm Store Blog")).toBeInTheDocument();
      expect(screen.getByText("Ambassador Program")).toBeInTheDocument();
    });

    fireEvent.mouseLeave(screen.getByText("Our Story & Blog"));
  });

  test("hovering Customer Service shows dropdown links", async () => {
    renderWithRouter();

    fireEvent.mouseEnter(screen.getByText("Customer Service"));
    await waitFor(() => {
      expect(screen.getByText("Move-in Checklist")).toBeInTheDocument();
      expect(screen.getByText("Order Status")).toBeInTheDocument();
      expect(screen.getByText("Track My Orders")).toBeInTheDocument();
      expect(screen.getAllByText("Contact Us")[0]).toBeInTheDocument();
    });

    fireEvent.mouseLeave(screen.getByText("Customer Service"));
  });

  test("does not show Move-in Checklist if not logged in", async () => {
    render(
      <MemoryRouter>
        <NavBar isLoggedIn={false} />
      </MemoryRouter>
    );

    fireEvent.mouseEnter(screen.getByText("Customer Service"));
    await waitFor(() => {
      expect(screen.queryByText("Move-in Checklist")).not.toBeInTheDocument();
    });
  });
});
