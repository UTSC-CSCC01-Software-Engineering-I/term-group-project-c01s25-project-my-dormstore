import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import PackageListPage from "../pages/PackageListPage";
import { packageService } from "../services/packageService";
import { useCart } from "../contexts/CartContext";
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom';


// ✅ Mock PackageList component
jest.mock("../components/PackageList.tsx", () => ({
  PackageList: ({ packages, onAddToCart, category, linkPrefix }) => (
    <div data-testid="mock-package-list">
      {packages.map((pkg) => (
        <div key={pkg.id}>
          <span>{pkg.name}</span>
          <button onClick={() => onAddToCart(pkg.id)}>Add</button>
        </div>
      ))}
      <div>Category: {category}</div>
      <div>Link Prefix: {linkPrefix}</div>
    </div>
  ),
}));

// ✅ Mock useCart
const mockAddToCart = jest.fn();
jest.mock("../contexts/CartContext.tsx", () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
  }),
}));

// ✅ Mock service
jest.mock("../services/packageService.ts", () => ({
  packageService: {
    getAllPackages: jest.fn(),
    getPackagesByCategory: jest.fn(),
  },
}));

describe("PackageListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state", () => {
    render(<PackageListPage />);
    expect(screen.getByText("Loading packages...")).toBeInTheDocument();
  });

  test("fetches and displays packages (no category)", async () => {
    packageService.getAllPackages.mockResolvedValueOnce([
      { id: 1, name: "Essentials Package" },
    ]);

    render(<PackageListPage />);
    expect(screen.getByText("Loading packages...")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId("mock-package-list")).toBeInTheDocument()
    );

    expect(screen.getByText("Essentials Package")).toBeInTheDocument();
    expect(screen.getByText("Category:")).toBeInTheDocument();
    expect(screen.getByText("Link Prefix: /packages")).toBeInTheDocument();
  });

  test("fetches and displays packages by category", async () => {
    packageService.getPackagesByCategory.mockResolvedValueOnce([
      { id: 2, name: "Kitchen Bundle" },
    ]);

    render(<PackageListPage category="kitchen" />);

    await waitFor(() =>
      expect(screen.getByTestId("mock-package-list")).toBeInTheDocument()
    );

    expect(screen.getByText("Kitchen Bundle")).toBeInTheDocument();
    expect(packageService.getPackagesByCategory).toHaveBeenCalledWith("kitchen");
  });

  test("handles fetch error", async () => {
    packageService.getAllPackages.mockRejectedValueOnce(new Error("API fail"));

    render(<PackageListPage />);

    await waitFor(() =>
      expect(screen.getByText(/Failed to load packages/i)).toBeInTheDocument()
    );

    expect(screen.getByText("Failed to load packages. Please try again later.")).toHaveStyle("color: red");
  });

  test("calls addToCart with correct package", async () => {
    const mockPkg = { id: 3, name: "Move-in Max" };
    packageService.getAllPackages.mockResolvedValueOnce([mockPkg]);

    render(<PackageListPage />);

    await waitFor(() =>
      expect(screen.getByText("Move-in Max")).toBeInTheDocument()
    );

    const addBtn = screen.getByRole("button", { name: "Add" });
    await userEvent.click(addBtn);

    expect(mockAddToCart).toHaveBeenCalledWith(
      { ...mockPkg, isPackage: true },
      1
    );
  });
});
