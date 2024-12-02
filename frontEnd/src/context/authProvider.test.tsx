import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";
import { AuthProvider, useAuth } from "./authProvider";
import React from "react";

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

// Helper component to test `useAuth` hook
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

describe("AuthProvider", () => {
  it("should initialize with no user", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });

  it("should login a user and update the context", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText("Login").click();
    });

    expect(screen.getByTestId("user").textContent).toContain("John");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("isAdmin").textContent).toBe("true");
    expect(localStorage.getItem("user")).toContain("John");
  });

 

  it("should retrieve user from localStorage on mount", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ _id: "123", firstName: "Jane", lastName: "Doe", email: "jane@example.com", role: "user", loggedIn: true })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user").textContent).toContain("Jane");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });
});
