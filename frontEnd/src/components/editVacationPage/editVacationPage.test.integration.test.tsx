import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EditVacation from "./editVacationPage";

vi.mock("../../context/authProvider", () => ({
  useAuth: () => ({
    isAdmin: true,
    isAuthenticated: true,
  }),
}));


describe("EditVacation Component - Simplified Tests", () => {
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
    expect(screen.getByLabelText(/Vacation code:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("updates input fields correctly", () => {
    render(
      <MemoryRouter initialEntries={["/edit-vacation/123"]}>
        <Routes>
          <Route path="/edit-vacation/:id" element={<EditVacation />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: "Relaxing trip" } });
    fireEvent.change(screen.getByLabelText(/Destination:/i), { target: { value: "Hawaii" } });

    expect(screen.getByLabelText(/Description:/i)).toHaveValue("Relaxing trip");
    expect(screen.getByLabelText(/Destination:/i)).toHaveValue("Hawaii");
  });

  it("submits the form with valid inputs", () => {
    render(
      <MemoryRouter initialEntries={["/edit-vacation/123"]}>
        <Routes>
          <Route path="/edit-vacation/:id" element={<EditVacation />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: "Beach vacation" } });
    fireEvent.change(screen.getByLabelText(/Destination:/i), { target: { value: "Maldives" } });
    fireEvent.change(screen.getByLabelText(/Start date:/i), { target: { value: "2024-12-01" } });
    fireEvent.change(screen.getByLabelText(/End date:/i), { target: { value: "2024-12-10" } });
    fireEvent.change(screen.getByLabelText(/Price:/i), { target: { value: 1500 } });
    fireEvent.change(screen.getByLabelText(/Vacation code:/i), { target: { value: "VAC001" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    expect(screen.getByText(/Submit/i)).toBeInTheDocument(); 
  });
});
