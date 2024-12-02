import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginUser from './login';

vi.mock('../../context/authProvider', () => ({
  useAuth: () => ({
    login: vi.fn(), 
    isAuthenticated: false, 
  }),
}));

describe('LoginUser Component', () => {
  it('renders the login form correctly', () => {
    render(
      <MemoryRouter>
        <LoginUser />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/User/i)).toBeInTheDocument(); 
    expect(screen.getByLabelText(/Admin/i)).toBeInTheDocument(); 
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument(); 
  });

  it('displays validation errors when form is submitted empty', () => {
    render(
      <MemoryRouter>
        <LoginUser />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByText(/Valid email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password must be longer than 4 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Please chose role/i)).toBeInTheDocument();
  });

  it('updates input fields correctly', () => {
    render(
      <MemoryRouter>
        <LoginUser />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@test.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('selects a role when clicked', () => {
    render(
      <MemoryRouter>
        <LoginUser />
      </MemoryRouter>
    );

    const userRadio = screen.getByLabelText(/User/i);
    fireEvent.click(userRadio);

    expect(userRadio).toBeChecked();

    const adminRadio = screen.getByLabelText(/Admin/i);
    fireEvent.click(adminRadio);

    expect(adminRadio).toBeChecked();
  });

  it('displays success or error messages after submission', () => {
    render(
      <MemoryRouter>
        <LoginUser />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByLabelText(/User/i)); 

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.queryByText(/Login successful/i)).toBeNull();
  });
});
