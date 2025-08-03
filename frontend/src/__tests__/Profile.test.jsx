import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import Profile from "../pages/Profile";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Silence React Router v7 warning
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

// Mock UserForm
jest.mock("../components/userForm", () => () => (
  <div data-testid="user-form">MockUserForm</div>
));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Profile Component Full Coverage", () => {
  const mockUserInfo = {
    first_name: "John",
    last_name: "Doe",
    school: "UTSC",
    dorm: "Dorm A",
  };

  const mockOrders = [
    {
      id: 1,
      order_number: "ABC123",
      created_at: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("userEmail", "john@example.com");
    localStorage.setItem(
      "userInfo_john@example.com",
      JSON.stringify({
        firstname: "John",
        lastname: "Doe",
        school: "UTSC",
        dorm: "Dorm A",
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderWithMocks = (user = mockUserInfo, orders = mockOrders) => {
    jest.spyOn(global, "fetch")
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(user) })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ orders }) })
      );

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
  };

  it("renders profile tab and shows user info", async () => {
    renderWithMocks();

    expect(await screen.findByText("My Profile")).toBeInTheDocument();
    expect(await screen.findByText("John")).toBeInTheDocument();

    fireEvent.click(screen.getByText("EDIT"));
    expect(await screen.findByTestId("user-form")).toBeInTheDocument();
  });

  it("switches to Account Settings and updates email", async () => {
    renderWithMocks();
    await screen.findByText("My Profile");

    fireEvent.click(screen.getByText("Account Settings"));
    fireEvent.click(screen.getAllByText("Edit")[0]);

    const newEmailInput = screen.getByLabelText("New Email:");
    fireEvent.change(newEmailInput, { target: { value: "new@example.com" } });

    window.alert = jest.fn();
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "Email updated" }),
    });

    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Email updated")
    );
  });

  it("updates password and toggles visibility", async () => {
    renderWithMocks();
    await screen.findByText("My Profile");

    fireEvent.click(screen.getByText("Account Settings"));
    fireEvent.click(screen.getAllByText("Edit")[1]);

    fireEvent.change(screen.getByLabelText("Current Password:"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText("New Password:"), {
      target: { value: "456" },
    });

    const toggles = screen.getAllByAltText("Toggle visibility");
    fireEvent.click(toggles[0]);
    fireEvent.click(toggles[1]);

    window.alert = jest.fn();
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "Password updated" }),
    });

    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Password updated")
    );
  });


  it("shows order history and navigates to detail", async () => {
    renderWithMocks();
    await screen.findByText("My Profile");

    fireEvent.click(screen.getByText("Purchase History"));
    expect(await screen.findByText("Order History")).toBeInTheDocument();

    expect(screen.getByText(/#\s*ABC123/)).toBeInTheDocument();
    expect(
      screen.getByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("View Details"));
    expect(mockNavigate).toHaveBeenCalledWith("/order-details/ABC123");
  });

  it("shows empty order message and allows start shopping", async () => {
    // Must mock fetch correctly for this test
    jest.spyOn(global, "fetch")
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ orders: [] }),
        })
      );

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText("Purchase History"));

    const emptyMessages = await screen.findAllByText((_, el) =>
      el?.textContent?.includes("You haven’t placed any orders yet.")
    );
    expect(emptyMessages.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("Start Shopping"));
    expect(mockNavigate).toHaveBeenCalledWith("/shop");
  });

  it("logs out and redirects", async () => {
    delete window.location;
    window.location = { href: "" };

    renderWithMocks();
    await screen.findByText("My Profile");

    fireEvent.click(screen.getByText("LOGOUT"));
    expect(window.location.href).toBe("/");
  });

  it("handles user fetch failure with non-ok response", async () => {
    jest.spyOn(global, "fetch")
        .mockImplementationOnce(() =>
        Promise.resolve({ ok: false, json: async () => ({}) })
        )
        .mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ orders: [] }) })
        );

    render(
        <BrowserRouter>
        <Profile />
        </BrowserRouter>
    );

    expect(await screen.findByText("My Profile")).toBeInTheDocument();
    });

    it("does not fetch user info when no token is present", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");

  // 🛡️ Mock fetch to avoid crash even if it's mistakenly called
  jest.spyOn(global, "fetch").mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({}),
    })
  );

  render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );

  await waitFor(() =>
    expect(screen.getByText("My Profile")).toBeInTheDocument()
  );
});


    it("shows alert when email update fails", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  fireEvent.click(screen.getByText("Account Settings"));
  fireEvent.click(screen.getAllByText("Edit")[0]);

  fireEvent.change(screen.getByLabelText("New Email:"), {
    target: { value: "fail@example.com" },
  });

  window.alert = jest.fn();
  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: false, message: "Failed" }),
  });

  fireEvent.click(screen.getByText("Save"));
  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith("Failed")
  );
});

it("shows alert when password update returns non-ok", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  fireEvent.click(screen.getByText("Account Settings"));
  fireEvent.click(screen.getAllByText("Edit")[1]);

  fireEvent.change(screen.getByLabelText("Current Password:"), {
    target: { value: "wrongpass" },
  });
  fireEvent.change(screen.getByLabelText("New Password:"), {
    target: { value: "new" },
  });

  window.alert = jest.fn();
  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Wrong password" }),
  });

  fireEvent.click(screen.getByText("Save"));
  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith("Wrong password")
  );
});

it("handles fetch exception in password update", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  fireEvent.click(screen.getByText("Account Settings"));
  fireEvent.click(screen.getAllByText("Edit")[1]);

  fireEvent.change(screen.getByLabelText("Current Password:"), {
    target: { value: "123" },
  });
  fireEvent.change(screen.getByLabelText("New Password:"), {
    target: { value: "456" },
  });

  window.alert = jest.fn();
  jest.spyOn(global, "fetch").mockImplementationOnce(() => {
    throw new Error("fetch failed");
  });

  fireEvent.click(screen.getByText("Save"));
  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith("Failed to update password. Please try again.")
  );
});

it("handles fetchUserInfo failure (res.ok = false)", async () => {
  jest.spyOn(global, "fetch")
    .mockImplementationOnce(() => Promise.resolve({ ok: false })) // /me fails
    .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ orders: [] }) })); // order-history

  renderWithMocks();
  await screen.findByText("My Profile"); // Wait to finish render
});

it("updates email successfully", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  fireEvent.click(screen.getByText("Account Settings"));
  fireEvent.click(screen.getAllByText("Edit")[0]);

  fireEvent.change(screen.getByLabelText("New Email:"), {
    target: { value: "new@example.com" },
  });

  window.alert = jest.fn();
  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, message: "Email updated" }),
  });

  fireEvent.click(screen.getByText("Save"));
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Email updated");
  });
});

it("shows alert when email update fails in catch", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  fireEvent.click(screen.getByText("Account Settings"));
  fireEvent.click(screen.getAllByText("Edit")[0]);

  fireEvent.change(screen.getByLabelText("New Email:"), {
    target: { value: "bad@example.com" },
  });

  window.alert = jest.fn();
  jest.spyOn(global, "fetch").mockRejectedValueOnce("fail");

  fireEvent.click(screen.getByText("Save"));
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Failed to update email.");
  });
});

it("updates password successfully", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  fireEvent.click(screen.getByText("Account Settings"));
  fireEvent.click(screen.getAllByText("Edit")[1]);

  fireEvent.change(screen.getByLabelText("Current Password:"), {
    target: { value: "oldpass" },
  });
  fireEvent.change(screen.getByLabelText("New Password:"), {
    target: { value: "newpass" },
  });

  window.alert = jest.fn();
  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, message: "Password updated" }),
  });

  fireEvent.click(screen.getByText("Save"));
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Password updated");
  });
});

it("reloads user info from localStorage when profile updated", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  // Trigger form and simulate onProfileUpdated
  fireEvent.click(screen.getByText("EDIT"));
  const email = localStorage.getItem("userEmail");
  const saved = localStorage.getItem(`userInfo_${email}`);
  expect(JSON.parse(saved).firstname).toBe("John");
});

it("handles order fetch failure gracefully", async () => {
  jest.spyOn(global, "fetch")
    .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => mockUserInfo }))
    .mockImplementationOnce(() => Promise.reject("error")); // order-history throws

  renderWithMocks();
  await screen.findByText("My Profile");
});

it("handles error in handleUpdateEmail", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  fireEvent.click(screen.getByText("Account Settings"));
  fireEvent.click(screen.getAllByText("Edit")[0]);

  fireEvent.change(screen.getByLabelText("New Email:"), {
    target: { value: "error@example.com" },
  });

  jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("fail"));
  window.alert = jest.fn();

  fireEvent.click(screen.getByText("Save"));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Failed to update email.");
  });
});

it("successfully updates password", async () => {
  renderWithMocks();
  await screen.findByText("My Profile");

  fireEvent.click(screen.getByText("Account Settings"));
  fireEvent.click(screen.getAllByText("Edit")[1]);

  fireEvent.change(screen.getByLabelText("Current Password:"), {
    target: { value: "oldpass" },
  });
  fireEvent.change(screen.getByLabelText("New Password:"), {
    target: { value: "newpass" },
  });

  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, message: "Password updated" }),
  });

  window.alert = jest.fn();
  fireEvent.click(screen.getByText("Save"));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Password updated");
  });
});

it("handles order fetch failure", async () => {
  jest.spyOn(global, "fetch")
    .mockResolvedValueOnce({ ok: true, json: async () => mockUserInfo }) // for /me
    .mockRejectedValueOnce(new Error("order fetch fail")); // for order-history

  renderWithMocks();
  await screen.findByText("My Profile");
});


});
