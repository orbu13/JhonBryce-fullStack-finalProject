import { render, screen, act,waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import React from "react";
import { AuthProvider, useAuth } from "./authProvider";

// Mock `fetch`
const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Test component to simulate interaction with the Auth context
function TestComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="user">{JSON.stringify(user)}</p>
      <p data-testid="isAuthenticated">{isAuthenticated.toString()}</p>
      <p data-testid="isAdmin">{isAdmin.toString()}</p>
      <button onClick={() => login({ _id: "123", firstName: "John", lastName: "Doe", email: "john@example.com", role: "admin", loggedIn: true })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthProvider Integration Tests", () => {
  it("should login a user and persist in localStorage", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Simulate user login
    act(() => {
      screen.getByText("Login").click();
    });

    // Verify context and localStorage after login
    expect(screen.getByTestId("user").textContent).toContain("John");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("isAdmin").textContent).toBe("true");
    expect(localStorage.getItem("user")).toContain("John");
  });

  

it("should logout a user and clear localStorage", async () => {
  // Mock user data in localStorage
  localStorage.setItem(
    "user",
    JSON.stringify({ _id: "123", firstName: "John", lastName: "Doe", email: "john@example.com", role: "admin", loggedIn: true })
  );

  // Simplify fetch mock
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({}), // Empty response
  });

  render(
    <MemoryRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </MemoryRouter>
  );

  // Simulate logout
  act(() => {
    screen.getByText("Logout").click();
  });

  // Wait for logout action
  await waitFor(() => {
    expect(localStorage.getItem("user")).toBe(null); // Verify localStorage cleared
    expect(screen.getByTestId("user").textContent).toBe("null"); // Verify user state cleared
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });
});



  it("should retrieve user from localStorage on mount", () => {
    // Mock user data in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({ _id: "123", firstName: "Jane", lastName: "Doe", email: "jane@example.com", role: "user", loggedIn: true })
    );

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify user data is retrieved and displayed
    expect(screen.getByTestId("user").textContent).toContain("Jane");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });
});
