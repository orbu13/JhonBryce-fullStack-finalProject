import { render, screen, fireEvent } from "@testing-library/react";
import DeleteModal from "./deletevacationmodal";

describe("DeleteModal Component", () => {
  it("does not render when isOpen is false", () => {
    render(<DeleteModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText(/Confirm Delete/i)).toBeNull();
  });

  it("renders correctly when isOpen is true", () => {
    render(
      <DeleteModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} vacationName="Hawaii Trip" />
    );

    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    expect(screen.getByText(/Hawaii Trip/i)).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    const mockOnClose = vi.fn();
    render(<DeleteModal isOpen={true} onClose={mockOnClose} onConfirm={vi.fn()} />);

    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  
  it("renders default text when vacationName is not provided", () => {
    render(<DeleteModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText(/this vacation/i)).toBeInTheDocument();
  });
});
