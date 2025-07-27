import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Ambassador from "../pages/OurStoryBlog/Ambassador/Ambassador";

beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.clearAllMocks();
});

describe("Ambassador Component", () => {
  const fillForm = () => {
    const inputs = screen.getAllByRole("textbox"); // firstName, lastName, email
    fireEvent.change(inputs[0], { target: { value: "John" } });
    fireEvent.change(inputs[1], { target: { value: "Doe" } });
    fireEvent.change(inputs[2], { target: { value: "john@example.com" } });

    const passwords = screen.getAllByDisplayValue(""); // no label, fallback
    const passwordInputs = Array.from(passwords).filter(
      input => input.type === "password"
    );

    fireEvent.change(passwordInputs[0], { target: { value: "Password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "Password123" } });
  };

  test("renders page elements", () => {
    render(<Ambassador />);
    expect(screen.getByText(/JOIN OUR AFFILIATE PROGRAM/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
  });

  test("successfully submits the form", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success" }),
    });

    render(<Ambassador />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /join/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/successfully registered/i)).toBeInTheDocument();
      expect(screen.getAllByDisplayValue("")).toHaveLength(5);
    });
  });

  test("handles server error response", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });

    render(<Ambassador />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /join/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  test("displays loading state during submission", async () => {
    fetch.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => {
          resolve({ ok: true, json: async () => ({}) });
        }, 500)
      )
    );

    render(<Ambassador />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /join/i }));
    expect(screen.getByRole("button", { name: /submitting/i })).toBeInTheDocument();
  });

  test("handles fallback error message when no error is provided", async () => {
    fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}), // no `error` field
    });

    render(<Ambassador />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /join/i }));

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
    });

  test("handles network error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network Error"));

    render(<Ambassador />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /join/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
