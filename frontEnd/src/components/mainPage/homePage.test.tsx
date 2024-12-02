import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import HomePage from "./homePage";

const mockUseAuth = vi.fn();

vi.mock("../../context/authProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("HomePage Component", () => {
  it("renders the homepage for non-logged-in users", () => {
    mockUseAuth.mockReturnValue({
      isAdmin: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to home page/i)).toBeInTheDocument();
    expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument();
  });

  it("renders the homepage for logged-in non-admin users", () => {
    mockUseAuth.mockReturnValue({
      isAdmin: false,
      isAuthenticated: true,
      user: { name: "Regular User" },
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to home page/i)).toBeInTheDocument();
    expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument();
  });

  it("renders the admin panel link for logged-in admin users", () => {
    mockUseAuth.mockReturnValue({
      isAdmin: true,
      isAuthenticated: true,
      user: { name: "Admin User" },
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to home page/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });
});
