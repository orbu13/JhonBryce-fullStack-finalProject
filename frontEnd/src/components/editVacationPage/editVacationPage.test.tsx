import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import EditVacation from "./editVacationPage";

vi.mock("../../context/authProvider", () => ({
  useAuth: () => ({
    isAdmin: true,
    isAuthenticated: true,
  }),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
});

describe("EditVacation Component", () => {
  it("renders the edit vacation form correctly", () => {
    render(
      <MemoryRouter initialEntries={["/edit-vacation/123"]}>
        <Routes>
          <Route path="/edit-vacation/:id" element={<EditVacation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Edit Vacation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Destination:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Image:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vacation code:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("displays validation errors for invalid inputs", async () => {
    render(
      <MemoryRouter initialEntries={["/edit-vacation/123"]}>
        <Routes>
          <Route path="/edit-vacation/:id" element={<EditVacation />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Destination is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Start date must be in the future/i)).toBeInTheDocument();
  });

  it("updates input fields correctly", () => {
    render(
      <MemoryRouter initialEntries={["/edit-vacation/123"]}>
        <Routes>
          <Route path="/edit-vacation/:id" element={<EditVacation />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Description:/i), {
      target: { value: "New Description" },
    });
    fireEvent.change(screen.getByLabelText(/Destination:/i), {
      target: { value: "Hawaii" },
    });

    expect(screen.getByLabelText(/Description:/i)).toHaveValue("New Description");
    expect(screen.getByLabelText(/Destination:/i)).toHaveValue("Hawaii");
  });

  it("handles form submission correctly with valid data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Vacation updated successfully" }),
    });

    render(
      <MemoryRouter initialEntries={["/edit-vacation/123"]}>
        <Routes>
          <Route path="/edit-vacation/:id" element={<EditVacation />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: "Beach trip" } });
    fireEvent.change(screen.getByLabelText(/Destination:/i), { target: { value: "Maldives" } });
    fireEvent.change(screen.getByLabelText(/Start date:/i), { target: { value: "2024-12-01" } });
    fireEvent.change(screen.getByLabelText(/End date:/i), { target: { value: "2024-12-10" } });
    fireEvent.change(screen.getByLabelText(/Price:/i), { target: { value: 500 } });
    fireEvent.change(screen.getByLabelText(/Vacation code:/i), { target: { value: "V123" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

  });
});
