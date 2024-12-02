import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import NewVacation from "./newvacation";

vi.mock("../../context/authProvider", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isAdmin: true,
  }),
}));

describe("NewVacation Component", () => {
  it("renders the form correctly for authenticated admins", () => {
    render(
      <MemoryRouter>
        <NewVacation />
      </MemoryRouter>
    );

    expect(screen.getByText(/Vacation code:/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacation destination:/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacation descriptions:/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacation starting date:/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacation ending date:/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacation price:/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload your image:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("updates input fields correctly", () => {
    render(
      <MemoryRouter>
        <NewVacation />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Vacation code:/i), {
      target: { value: "V001" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation destination:/i), {
      target: { value: "Maldives" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation starting date:/i), {
      target: { value: "2024-12-01" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation ending date:/i), {
      target: { value: "2024-12-10" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation price:/i), {
      target: { value: "1000" },
    });

    expect(screen.getByLabelText(/Vacation code:/i)).toHaveValue("V001");
    expect(screen.getByLabelText(/Vacation destination:/i)).toHaveValue("Maldives");
    expect(screen.getByLabelText(/Vacation starting date:/i)).toHaveValue("2024-12-01");
    expect(screen.getByLabelText(/Vacation ending date:/i)).toHaveValue("2024-12-10");
    expect(screen.getByLabelText(/Vacation price:/i)).toHaveValue("1000");
  });

  it("displays validation errors for empty fields", () => {
    render(
      <MemoryRouter>
        <NewVacation />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    expect(screen.getByText(/Vacation code is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacation destination is required/i)).toBeInTheDocument();
    
  });
});
