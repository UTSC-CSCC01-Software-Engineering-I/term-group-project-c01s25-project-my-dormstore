import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import UserForm from "../components/UserForm"; 
import Select from "react-select";
import "@testing-library/jest-dom";

jest.mock("react-select", () => (props) => {
  const { options, onChange, value, placeholder } = props;
  return (
    <select
      data-testid={placeholder}
      value={value?.value || ""}
      onChange={(e) =>
        onChange(
          e.target.value ? { label: e.target.value, value: e.target.value } : null
        )
      }
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

// mock localStorage
beforeEach(() => {
  localStorage.clear();
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

// mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUserInfo = {
  firstname: "John",
  lastname: "Doe",
  school: "UTSC",
  dorm: "Algoma Dormitory",
};

test("renders form with userInfo and submits successfully", async () => {
  const onClose = jest.fn();
  const onProfileUpdated = jest.fn();

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });

  localStorage.setItem("token", "mock-token");
  localStorage.setItem("userEmail", "test@example.com");

  render(
    <UserForm
      userInfo={mockUserInfo}
      onClose={onClose}
      onProfileUpdated={onProfileUpdated}
    />
  );

  expect(screen.getByLabelText(/First Name/i)).toHaveValue("John");
  expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Doe");

  // Change input values
  fireEvent.change(screen.getByLabelText(/First Name/i), {
    target: { value: "Jane" },
  });
  fireEvent.change(screen.getByLabelText(/Last Name/i), {
    target: { value: "Smith" },
  });

  // Select dropdowns
  fireEvent.change(screen.getByTestId("Select your school"), {
    target: { value: "UTSG" },
  });

  fireEvent.change(screen.getByTestId("Select your dorm"), {
    target: { value: "Spirit Village Dormitory" },
  });

  fireEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalled();
    expect(onProfileUpdated).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

test("alerts and does not close if fetch fails", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Update failed" }),
  });

  localStorage.setItem("token", "mock-token");
  localStorage.setItem("userEmail", "test@example.com");

  render(<UserForm userInfo={mockUserInfo} onClose={jest.fn()} />);

  fireEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Failed to update: Update failed");
  });
});

test("does not submit if token missing", async () => {
  render(<UserForm userInfo={mockUserInfo} onClose={jest.fn()} />);

  fireEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

test("loads data from localStorage if userInfo not provided", async () => {
  const stored = {
    firstname: "Emily",
    lastname: "Brown",
    school: "UTM",
    dorm: "Spirit Village Townhouses",
  };
  localStorage.setItem("userEmail", "stored@example.com");
  localStorage.setItem("token", "mock-token");
  localStorage.setItem(
    "userInfo_stored@example.com",
    JSON.stringify(stored)
  );

  render(<UserForm onClose={jest.fn()} />);

  await waitFor(() => {
    expect(screen.getByLabelText(/First Name/i)).toHaveValue("Emily");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Brown");
  });
});

test("calls onClose when close button clicked", () => {
  const onClose = jest.fn();
  render(<UserForm userInfo={mockUserInfo} onClose={onClose} />);
  fireEvent.click(screen.getByRole("button", { name: /close/i }));
  expect(onClose).toHaveBeenCalled();
});
