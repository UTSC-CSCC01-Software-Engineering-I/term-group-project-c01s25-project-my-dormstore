import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CheckoutPaymentPage from "../pages/CheckoutPage/CheckoutPaymentPage";
import { BrowserRouter } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useCheckout } from "../contexts/CheckoutContext";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../contexts/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("../contexts/CheckoutContext", () => ({
  useCheckout: jest.fn(),
}));

const mockItems = [
  { id: 1, name: "Pillow", price: 50, quantity: 1, image: "/img.jpg" },
];

const mockCheckoutData = {
  payment: {
    method: "card",
    cardNumber: "1234 5678 9012 3456",
    expiry: "12/25",
    cvc: "123",
    cardName: "John Doe",
    sameAsShipping: true,
    billingAddress: {
      firstName: "Bill",
      lastName: "Smith",
      address: "123 Billing St",
      city: "Billingville",
      province: "BC",
      postalCode: "B1C 2D3",
    },
  },
  shipping: {
    firstName: "John",
    lastName: "Doe",
    address: "123 Street",
    city: "Toronto",
    province: "ON",
    postalCode: "A1A 1A1",
  },
  shippingCost: 10.5,
};

let liveCheckoutData;
let mockUpdatePayment;

beforeEach(() => {
  jest.clearAllMocks();

  liveCheckoutData = {
    payment: {
      method: "card",
      cardNumber: "1234 5678 9012 3456",
      expiry: "12/25",
      cvc: "123",
      cardName: "John Doe",
      sameAsShipping: true,
      billingAddress: {
        firstName: "Bill",
        lastName: "Smith",
        address: "123 Billing St",
        city: "Billingville",
        province: "BC",
        postalCode: "B1C 2D3",
      },
    },
    shipping: {
      firstName: "John",
      lastName: "Doe",
      address: "123 Street",
      city: "Toronto",
      province: "ON",
      postalCode: "A1A 1A1",
    },
    shippingCost: 10.5,
  };

  mockUpdatePayment = jest.fn((update) => {
    if (update.billingAddress) {
      liveCheckoutData.payment.billingAddress = {
        ...liveCheckoutData.payment.billingAddress,
        ...update.billingAddress,
      };
    }
  });

  useCart.mockReturnValue({ items: mockItems, totalPrice: 100 });
  useCheckout.mockReturnValue({
    checkoutData: liveCheckoutData,
    updatePayment: mockUpdatePayment,
  });
});


const renderPage = () =>
  render(
    <BrowserRouter>
      <CheckoutPaymentPage />
    </BrowserRouter>
  );

test("renders all base sections correctly", () => {
  renderPage();

  expect(screen.getByText("Checkout")).toBeInTheDocument();
  expect(screen.getAllByText("Payment Method").length).toBeGreaterThan(0); // avoid multiple match error
  expect(screen.getByText("Order Summary")).toBeInTheDocument();
  expect(screen.getByText("REVIEW YOUR ORDER")).toBeInTheDocument();
});

test("submits form and navigates to review", () => {
  renderPage();

  fireEvent.click(screen.getByText("REVIEW YOUR ORDER"));

  expect(mockUpdatePayment).toHaveBeenCalledWith({
    method: "card",
    cardNumber: "1234 5678 9012 3456",
    expiry: "12/25",
    cvc: "123",
    cardName: "John Doe",
    sameAsShipping: true,
  });

  expect(mockNavigate).toHaveBeenCalledWith("/checkout/review");
});

test("can change payment method", () => {
  renderPage();

  fireEvent.click(screen.getByLabelText("Pay with PayPal"));
  expect(screen.getByLabelText("Pay with PayPal")).toBeChecked();
});

test("shows credit card inputs when method is card", () => {
  renderPage();

  expect(screen.getByPlaceholderText("1234 5678 9012 3456")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("MM/YY")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("CVC")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Full name as on card")).toBeInTheDocument();
});

test("toggles billing address fields when 'Same as shipping' unchecked", () => {
  renderPage();

  const checkbox = screen.getByLabelText("Same as shipping address");
  fireEvent.click(checkbox);

  expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Address (apt, suite, etc.)")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("City")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Province")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Postal code")).toBeInTheDocument();
});

test("updates billing address fields", () => {
  renderPage();

  fireEvent.click(screen.getByLabelText("Same as shipping address"));

  fireEvent.change(screen.getByPlaceholderText("City"), {
    target: { value: "NewCity" },
  });

  expect(mockUpdatePayment).toHaveBeenCalledWith({
    billingAddress: expect.objectContaining({ city: "NewCity" }),
  });
});

test("displays correct price summary", () => {
  renderPage();

  expect(screen.getByText("$100.00")).toBeInTheDocument(); // subtotal
  expect(screen.getByText("$10.50")).toBeInTheDocument(); // shipping
  expect(screen.getByText("$13.00")).toBeInTheDocument(); // tax
  expect(screen.getByText("$123.50")).toBeInTheDocument(); // total
});

test("updates card input fields", () => {
  renderPage();

  fireEvent.change(screen.getByPlaceholderText("1234 5678 9012 3456"), {
    target: { value: "9999 8888 7777 6666" },
  });
  fireEvent.change(screen.getByPlaceholderText("MM/YY"), {
    target: { value: "11/30" },
  });
  fireEvent.change(screen.getByPlaceholderText("CVC"), {
    target: { value: "456" },
  });
  fireEvent.change(screen.getByPlaceholderText("Full name as on card"), {
    target: { value: "New Name" },
  });

  // Optional: validate value changed in DOM (if needed)
  expect(screen.getByDisplayValue("9999 8888 7777 6666")).toBeInTheDocument();
  expect(screen.getByDisplayValue("11/30")).toBeInTheDocument();
  expect(screen.getByDisplayValue("456")).toBeInTheDocument();
  expect(screen.getByDisplayValue("New Name")).toBeInTheDocument();
});

test("updates all billing inputs when sameAsShipping is false", () => {
  renderPage();

  fireEvent.click(screen.getByLabelText("Same as shipping address"));

  fireEvent.change(screen.getByPlaceholderText("First name"), {
    target: { value: "Alice" },
  });
  fireEvent.change(screen.getByPlaceholderText("Last name"), {
    target: { value: "Wonder" },
  });
  fireEvent.change(screen.getByPlaceholderText("Address (apt, suite, etc.)"), {
    target: { value: "456 Billing Ave" },
  });
  fireEvent.change(screen.getByPlaceholderText("City"), {
    target: { value: "NewCity" },
  });
  fireEvent.change(screen.getByPlaceholderText("Province"), {
    target: { value: "QC" },
  });
  fireEvent.change(screen.getByPlaceholderText("Postal code"), {
    target: { value: "Z9Z 9Z9" },
  });

  const merged = mockUpdatePayment.mock.calls.reduce((acc, [call]) => {
    if (call.billingAddress) {
      return { ...acc, ...call.billingAddress };
    }
    return acc;
  }, {});

  expect(merged).toEqual({
    firstName: "Alice",
    lastName: "Wonder",
    address: "456 Billing Ave",
    city: "NewCity",
    province: "QC",
    postalCode: "Z9Z 9Z9",
  });
});




test("renders order item summary correctly", () => {
  renderPage();

  expect(screen.getByAltText("Pillow")).toBeInTheDocument();
  expect(screen.getByText("Pillow")).toBeInTheDocument();
  expect(screen.getByText("$50.00")).toBeInTheDocument();
  expect(screen.getByText("Qt: 1")).toBeInTheDocument();
});

test("updates all billing inputs when sameAsShipping is false", () => {
  renderPage();

  fireEvent.click(screen.getByLabelText("Same as shipping address"));

  fireEvent.change(screen.getByPlaceholderText("First name"), {
    target: { value: "Alice" },
  });
  fireEvent.change(screen.getByPlaceholderText("Last name"), {
    target: { value: "Wonder" },
  });
  fireEvent.change(screen.getByPlaceholderText("Address (apt, suite, etc.)"), {
    target: { value: "456 Billing Ave" },
  });
  fireEvent.change(screen.getByPlaceholderText("City"), {
    target: { value: "NewCity" },
  });
  fireEvent.change(screen.getByPlaceholderText("Province"), {
    target: { value: "QC" },
  });
  fireEvent.change(screen.getByPlaceholderText("Postal code"), {
    target: { value: "Z9Z 9Z9" },
  });

  expect(liveCheckoutData.payment.billingAddress).toEqual({
    firstName: "Alice",
    lastName: "Wonder",
    address: "456 Billing Ave",
    city: "NewCity",
    province: "QC",
    postalCode: "Z9Z 9Z9",
  });
});
