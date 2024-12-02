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

describe("NewVacation Component - Integration Tests", () => {
  it("renders the form correctly for authenticated admin users", () => {
    render(
      <MemoryRouter>
        <NewVacation />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Vacation code:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vacation destination:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vacation descriptions:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vacation starting date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vacation ending date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vacation price:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload your image:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("updates input fields correctly", () => {
    render(
      <MemoryRouter>
        <NewVacation />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Vacation code:/i), {
      target: { value: "VAC001" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation destination:/i), {
      target: { value: "Hawaii" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation starting date:/i), {
      target: { value: "2024-12-01" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation ending date:/i), {
      target: { value: "2024-12-10" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation price:/i), {
      target: { value: "1500" },
    });

    expect(screen.getByLabelText(/Vacation code:/i)).toHaveValue("VAC001");
    expect(screen.getByLabelText(/Vacation destination:/i)).toHaveValue("Hawaii");
    expect(screen.getByLabelText(/Vacation starting date:/i)).toHaveValue("2024-12-01");
    expect(screen.getByLabelText(/Vacation ending date:/i)).toHaveValue("2024-12-10");
    expect(screen.getByLabelText(/Vacation price:/i)).toHaveValue("1500");
  });

  it("displays validation errors for invalid inputs", async () => {
    render(
      <MemoryRouter>
        <NewVacation />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    expect(screen.getByText(/Vacation code is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacation destination is required/i)).toBeInTheDocument();
   
  });

  it("displays a success message on successful submission", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ message: "Vacation created successfully" }),
      status: 201,
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <NewVacation />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Vacation code:/i), {
      target: { value: "VAC001" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation destination:/i), {
      target: { value: "Hawaii" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation starting date:/i), {
      target: { value: "2024-12-01" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation ending date:/i), {
      target: { value: "2024-12-10" },
    });
    fireEvent.change(screen.getByLabelText(/Vacation price:/i), {
      target: { value: "1500" },
    });

 
   });
});
