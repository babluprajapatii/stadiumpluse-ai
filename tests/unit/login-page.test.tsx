import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginPage } from "@/components/pages/LoginPage";

// Mock router navigation
const mockNavigate = vi.fn();

// Mock useAuth return values
const mockLogin = vi.fn();
vi.mock("@/providers/AuthProvider", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/providers/AuthProvider")>();
  return {
    ...original,
    useAuth: () => ({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
    }),
  };
});

describe("LoginPage Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogin.mockClear();
  });

  it("renders input fields and buttons correctly", () => {
    render(<LoginPage navigate={mockNavigate} />);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("validates form fields and displays warnings", async () => {
    render(<LoginPage navigate={mockNavigate} />);

    const submitBtn = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Please enter both your email address and password/i)).toBeInTheDocument();
  });

  it("submits the form successfully and redirects", async () => {
    mockLogin.mockResolvedValue({ id: "1", role: "fan" });

    render(<LoginPage navigate={mockNavigate} />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: "fan@stadium.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("fan@stadium.com", "Password123!", false);
    });
  });
});
