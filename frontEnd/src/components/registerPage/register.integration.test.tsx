import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Register from "./register";
import { AuthProvider } from "../../context/authProvider";

// Mock `useNavigate`
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock `fetch`
const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

describe("Register Component", () => {
  const renderWithAuthProvider = (component: any) => {
    return render(
      <AuthProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </AuthProvider>
    );
  };

  it("renders the form correctly", () => {
    renderWithAuthProvider(<Register />);

    // Verify that all form fields and submit button are rendered
    expect(screen.getByLabelText(/First name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("handles input changes correctly", () => {
    renderWithAuthProvider(<Register />);

    // Simulate input changes
    fireEvent.change(screen.getByLabelText(/First name:/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last name:/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: "john.doe@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: "password123" } });

    // Verify that the inputs are updated
    expect(screen.getByLabelText(/First name:/i)).toHaveValue("John");
    expect(screen.getByLabelText(/Last name:/i)).toHaveValue("Doe");
    expect(screen.getByLabelText(/Email:/i)).toHaveValue("john.doe@example.com");
    expect(screen.getByLabelText(/Password:/i)).toHaveValue("password123");
  });

  it("displays validation errors for invalid inputs", async () => {
    renderWithAuthProvider(<Register />);

    // Submit form without filling any inputs
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    // Verify validation error messages
    expect(await screen.findByText(/First name must be longer than 4 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/Last name must be longer than 4 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/Valid email address is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password must be longer than 4 characters/i)).toBeInTheDocument();
  });
});
