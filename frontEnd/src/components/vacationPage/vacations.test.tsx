import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import VacationPage from "./vacations";
import { useAuth } from "../../context/authProvider";

vi.mock("../../context/authProvider", () => ({
  useAuth: vi.fn(),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

describe("VacationPage Component", () => {
  it("renders 'Not logged in' for unauthenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <VacationPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Not logged in/i)).toBeInTheDocument();
  });

  it("renders filters and pagination for authenticated users", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: { _id: "123", firstName: "John", lastName: "Doe" },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(
      <MemoryRouter>
        <VacationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Destination:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Min Price:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max Price:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Start Date:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/End Date:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Show Future Vacations:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Show Active Vacations:/i)).toBeInTheDocument();
    });
  });


  it("displays error message when fetch fails", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: { _id: "123", firstName: "John", lastName: "Doe" },
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    render(
      <MemoryRouter>
        <VacationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Could not fetch vacations/i)).toBeInTheDocument();
    });
  });

});
