// src/__tests__/ChecklistPage.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChecklistPage from "../pages/ChecklistPage";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../contexts/CartContext";
import '@testing-library/jest-dom';


// Mock DormChecklistItems
jest.mock("../data/dormChecklistItems", () => ({
  DormChecklistItems: {
    "La Cité Residence": [
        { id: 1, label: "Twin XL Sheet", checked: false },
        { id: 2, label: "Shower curtain", checked: false },
        { id: 3, label: "Laundry Hamper", checked: false },
        { id: 4, label: "Towel", checked: false },
        { id: 5, label: "Toiletries", checked: false },
    ],
    "default": [
        { id: 1, label: "Bedding", checked: false },
        { id: 2, label: "cleaning essentials", checked: false },
        { id: 3, label: "Organization essentials", checked: false },
        { id: 4, label: "Kitchen essentials", checked: false },
        { id: 5, label: "Household essentials", checked: false },
        { id: 6, label: "Laundry essentials", checked: false },
        { id: 7, label: "Tech essentials", checked: false },
    ],
  },
}));

// Mock fetch user
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        dorm: "UTSC",
        first_name: "Ashley",
        last_name: "Lin",
      }),
  })
);

describe("ChecklistPage - live checklist rendering and interaction", () => {
  test("renders checklist items and toggles check state", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <ChecklistPage />
        </CartProvider>
      </MemoryRouter>
    );

    // Wait for checklist items to appear
    const item1 = await screen.findByLabelText("Towel Set");
    const item2 = await screen.findByLabelText("Toiletries");

    expect(item1).toBeInTheDocument();
    expect(item2).toBeInTheDocument();
    expect(item1.checked).toBe(false);

    // Toggle checkbox
    fireEvent.click(item1);
    expect(item1.checked).toBe(true);
  });
});
