import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import VacationReports from "./reports";
import { useAuth } from "../../context/authProvider";

vi.mock("../../context/authProvider", () => ({
  useAuth: vi.fn(),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

describe("VacationReports Component - Integration Tests", () => {
  it("redirects unauthenticated users to login", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
    });

    render(
      <MemoryRouter>
        <VacationReports />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Vacation Reports/i)).not.toBeInTheDocument();
  });

  it("renders 'No data available' for admin users with no data", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <MemoryRouter>
        <VacationReports />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No data available for reports/i)).toBeInTheDocument();
    });
  });



  it("shows an error message when the fetch fails", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    render(
      <MemoryRouter>
        <VacationReports />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch vacation reports/i)).toBeInTheDocument();
    });
  });
});
