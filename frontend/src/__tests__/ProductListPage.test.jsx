import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import ProductListPage from "../pages/ProductListPage";
import '@testing-library/jest-dom';

// ✅ Mock ProductList
jest.mock("../components/ProductList.tsx", () => ({
  ProductList: ({ products, onAddToCart, category }) => (
    <div data-testid="mock-product-list">
      {products.map((product) => (
        <div key={product.id}>
          <span>{product.name}</span>
          <button onClick={() => onAddToCart(product.id)}>Add</button>
        </div>
      ))}
      <div>Category: {category}</div>
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

// ✅ Mock productService
jest.mock("../services/productService.ts", () => ({
  productService: {
    getAllProducts: jest.fn(),
    getProductsByCategory: jest.fn(),
  },
}));

const { productService } = require("../services/productService.ts");

describe("ProductListPage - 100% coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state", async () => {
    productService.getAllProducts.mockResolvedValueOnce([]);
    render(<ProductListPage />);
    expect(screen.getByText("Loading products...")).toBeInTheDocument();
    await waitFor(() => screen.getByTestId("mock-product-list"));
  });

  test("fetches and displays products without category", async () => {
    productService.getAllProducts.mockResolvedValueOnce([
      { id: 1, name: "Lamp", size: "M", color: "White" },
    ]);
    render(<ProductListPage />);
    await waitFor(() => {
      expect(screen.getByText("Lamp")).toBeInTheDocument();
    });
    expect(screen.getByText("Category:")).toBeInTheDocument();
  });

  test("fetches and displays products by category", async () => {
    productService.getProductsByCategory.mockResolvedValueOnce([
      { id: 2, name: "Chair", size: "L", color: "Black" },
    ]);
    render(<ProductListPage category="furniture" />);
    await waitFor(() => {
      expect(screen.getByText("Chair")).toBeInTheDocument();
    });
    expect(productService.getProductsByCategory).toHaveBeenCalledWith("furniture");
    expect(screen.getByText("Category: furniture")).toBeInTheDocument();
  });

  test("displays error message on fetch failure", async () => {
    productService.getAllProducts.mockRejectedValueOnce(new Error("fail"));
    render(<ProductListPage />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load products. Please try again later.")).toBeInTheDocument();
    });
  });

  test("calls addToCart with single size/color", async () => {
    const product = {
      id: 3,
      name: "Table",
      size: "XL", // single
      color: "Brown", // single
    };
    productService.getAllProducts.mockResolvedValueOnce([product]);
    render(<ProductListPage />);
    await waitFor(() => {
      expect(screen.getByText("Table")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Add"));
    expect(mockAddToCart).toHaveBeenCalledWith(product, 1, "XL", "Brown");
  });

  test("calls addToCart with undefined size/color when multiple", async () => {
    const product = {
      id: 4,
      name: "Desk",
      size: "S,M,L", // multiple
      color: "Red,Blue", // multiple
    };
    productService.getAllProducts.mockResolvedValueOnce([product]);
    render(<ProductListPage />);
    await waitFor(() => {
      expect(screen.getByText("Desk")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Add"));
    expect(mockAddToCart).toHaveBeenCalledWith(product, 1, undefined, undefined);
  });
});
