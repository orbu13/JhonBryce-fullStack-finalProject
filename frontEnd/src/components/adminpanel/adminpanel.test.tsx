import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminPanel from "./adminpanel";

describe("AdminPanel Component", () => {
  it("renders the Admin Panel heading", () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });

  it("renders navigation links correctly", () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    expect(screen.getByText(/Manage Vacations/i)).toBeInTheDocument();
    expect(screen.getByText(/Add New Vacation/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacation Reports/i)).toBeInTheDocument();
  });

  it("links point to the correct paths", () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    expect(screen.getByText(/Manage Vacations/i).closest("a")).toHaveAttribute(
      "href",
      "/vacations"
    );
    expect(screen.getByText(/Add New Vacation/i).closest("a")).toHaveAttribute(
      "href",
      "/new-vacation"
    );
    expect(screen.getByText(/Vacation Reports/i).closest("a")).toHaveAttribute(
      "href",
      "/reports"
    );
  });
});
