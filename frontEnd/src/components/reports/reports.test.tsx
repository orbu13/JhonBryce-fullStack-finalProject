import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import VacationReports from "./reports";
import { useAuth } from "../../context/authProvider";

vi.mock("../../context/authProvider", () => ({
  useAuth: vi.fn(),
}));

describe("VacationReports Component", () => {
  it("renders vacation reports UI correctly for admin users", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
    });

    render(
      <MemoryRouter>
        <VacationReports />
      </MemoryRouter>
    );

    expect(screen.getByText(/Vacation Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/No data available for reports/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download CSV/i })).toBeInTheDocument();
  });

  it("hides vacation reports for unauthenticated users", () => {
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
    expect(screen.queryByText(/Download CSV/i)).not.toBeInTheDocument();
  });

  it("displays an error message if there is no data", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
    });

    render(
      <MemoryRouter>
        <VacationReports />
      </MemoryRouter>
    );

    expect(screen.getByText(/No data available for reports/i)).toBeInTheDocument();
  });

  it("renders chart and download button when data is available", async () => {
    const mockVacationStats = [
      {
        _id: "1",
        destination: "Maldives",
        followers: ["user1", "user2"],
        startDate: "2024-12-01",
        endDate: "2024-12-10",
      },
    ];

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
    });

    render(
      <MemoryRouter>
        <VacationReports />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /Download CSV/i })).toBeInTheDocument();
    expect(screen.getByText(/Vacation Reports/i)).toBeInTheDocument();
  });
});
