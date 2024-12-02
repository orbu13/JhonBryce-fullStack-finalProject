import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Navbar from "./navbar";

const mockUseAuth = vi.fn();

vi.mock("../../context/authProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Navbar Component", () => {
  it("renders the navbar for logged-out users", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();

    expect(screen.queryByText(/Vacations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();
  });

  it("renders the navbar for logged-in non-admin users", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: { firstName: "John", lastName: "Doe" },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome, John Doe!/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacations/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();

   
    expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument();

    expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });

  it("renders the navbar for logged-in admin users", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      user: { firstName: "Admin", lastName: "User" },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome, Admin User!/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();

    expect(screen.queryByText(/Vacations/i)).not.toBeInTheDocument();

    expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });

  it("calls logout function when Logout button is clicked", () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: { firstName: "John", lastName: "Doe" },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Logout/i));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
