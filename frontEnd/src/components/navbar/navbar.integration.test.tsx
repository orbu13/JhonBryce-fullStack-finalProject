import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Navbar from "./navbar";
import { useAuth } from "../../context/authProvider";

vi.mock("../../context/authProvider", () => ({
  useAuth: vi.fn(),
}));

describe("Navbar Integration Tests", () => {
it("renders correctly for unauthenticated users", () => {
  (useAuth as any).mockReturnValue({
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

    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Vacations/i)).not.toBeInTheDocument();
  });

  it("renders correctly for authenticated regular users", () => {
    (useAuth as any).mockReturnValue({
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

    expect(screen.getByText(/Welcome, John Doe!/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacations/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });

  it("renders correctly for authenticated admins", () => {
    (useAuth as any).mockReturnValue({
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

    expect(screen.getByText(/Welcome, Admin User!/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/Vacations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });

  it("calls logout function when Logout button is clicked", () => {
    const mockLogout = vi.fn();

    (useAuth as any).mockReturnValue({
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
