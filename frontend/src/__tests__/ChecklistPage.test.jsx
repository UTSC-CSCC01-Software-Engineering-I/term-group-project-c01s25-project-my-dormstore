import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import ChecklistPage from "../pages/ChecklistPage";
import { useCart } from "../contexts/CartContext";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Silence React Router v7 warnings
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (
      msg.includes("React Router Future Flag Warning") ||
      msg.includes("Relative route resolution")
    ) return;
    console.warn(msg);
  });
});

beforeEach(() => {
  jest.clearAllMocks();

  global.fetch = jest.fn((url) => {
    if (url.includes("/me")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            first_name: "John",
            last_name: "Doe",
            dorm: "Spirit Village Dormitory",
          }),
      });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
});

beforeEach(() => {
  localStorage.setItem("token", "fake-token");
});

afterEach(() => {
  localStorage.clear();
});


// Mock UserForm
jest.mock("../components/userForm", () => () => (
  <div data-testid="user-form">MockUserForm</div>
));

// Mock useCart
jest.mock("../contexts/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("../data/dormChecklistItems", () => ({
  DormChecklistItems: {
    "Spirit Village Dormitory": [
      { id: 1, label: "Twin Sheet", checked: false },
      { id: 2, label: "Laundry Hamper", checked: false },
    ],
    default: [],
  },
}));



// Mock useLocation
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({
      pathname: "/checklist",
    }),
    BrowserRouter: actual.BrowserRouter,
  };
});

const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe("ChecklistPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.setItem("token", "mockToken");
    localStorage.setItem("userEmail", "test@example.com");
    localStorage.setItem(
      "userInfo_test@example.com",
      JSON.stringify({ firstname: "John", lastname: "Doe" })
    );

    useCart.mockReturnValue({
      items: [{ name: "Twin Sheet", selectedSize: "twin" }],
      cartReady: true,
    });
  });

  test("renders greeting and checklist items", async () => {
  useCart.mockReturnValue({
    items: [
      { name: "Twin Sheet", selectedSize: "twin" },
      { name: "Laundry Hamper", selectedSize: "twin" },
    ],
    cartReady: true,
  });

  global.fetch = jest.fn((url) => {
    if (url.includes("/me")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            first_name: "John",
            last_name: "Doe",
            dorm: "Spirit Village Dormitory",
          }),
      });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });

  render(<ChecklistPage />, { wrapper: Wrapper });

  expect(
    await screen.findByRole("heading", { name: /^Hi!/ })
  ).toBeInTheDocument();

  const labelNode = await screen.findByText(/Twin Sheet/i);
  const checkbox = labelNode.closest("label").querySelector("input");

  expect(checkbox).toBeInTheDocument();
});



  test("toggles checklist item", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/me")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({ dorm: "Spirit Village Dormitory" }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });

    render(<ChecklistPage />, { wrapper: Wrapper });

    const checkbox = await screen.findByLabelText(/Twin Sheet/i);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test("opens dorm dropdown and selects a dorm", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/me")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              first_name: "John",
              last_name: "Doe",
              dorm: "Spirit Village Dormitory",
            }),
        });
      }
      if (url.includes("/api/user/update")) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });

    render(<ChecklistPage />, { wrapper: Wrapper });

    fireEvent.click(await screen.findByText("Spirit Village Dormitory"));
    fireEvent.click(screen.getByText("Dorm A"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/update"),
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  test("renders Twin Sheet from dorm checklist", async () => {
  useCart.mockReturnValue({
    items: [{ name: "Twin Sheet", selectedSize: "twin" }],
    cartReady: true,
  });

  global.fetch = jest.fn((url) => {
    if (url.includes("/me")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            first_name: "John",
            last_name: "Doe",
            dorm: "Spirit Village Dormitory",
          }),
      });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });

  render(<ChecklistPage />, { wrapper: Wrapper });

  await waitFor(() => {
    expect(screen.getByLabelText(/Twin Sheet/i)).toBeInTheDocument();
  });
});

test("does not call fetch when token is missing", async () => {
  // Clear token
  localStorage.removeItem("token");

  const fetchSpy = jest.spyOn(global, "fetch");

  render(<ChecklistPage />, { wrapper: Wrapper });

  await waitFor(() => {
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  fetchSpy.mockRestore();
});

test("logs error when fetchUser fails", async () => {
  localStorage.setItem("token", "fake-token");

  const errorMock = jest.spyOn(console, "error").mockImplementation(() => {});
  global.fetch = jest.fn(() => Promise.reject(new Error("network error")));

  render(<ChecklistPage />, { wrapper: Wrapper });

  await waitFor(() => {
    expect(errorMock).toHaveBeenCalledWith(
      "Failed to fetch user:",
      expect.any(Error)
    );
  });

  errorMock.mockRestore();
  global.fetch.mockRestore();
});

test("removes storage event listener on unmount", () => {
  localStorage.setItem("token", "fake-token");

  const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

  const { unmount } = render(<ChecklistPage />, { wrapper: Wrapper });

  unmount();

  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    "storage",
    expect.any(Function)
  );

  removeEventListenerSpy.mockRestore();
});

test("logs error when dorm update fails", async () => {
  localStorage.setItem("token", "fake-token");

  global.fetch = jest.fn(() => Promise.reject(new Error("update error")));

  const errorMock = jest.spyOn(console, "error").mockImplementation(() => {});

  const { getByText } = render(<ChecklistPage />, { wrapper: Wrapper });

  fireEvent.click(getByText("Select your dorm"));
  fireEvent.click(getByText("Dorm A"));

  await waitFor(() => {
    expect(errorMock).toHaveBeenCalledWith(
      "Failed to update dorm:",
      expect.any(Error)
    );
  });

  errorMock.mockRestore();
  global.fetch.mockRestore();
});

});
