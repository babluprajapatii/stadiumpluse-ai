import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterPage } from "@/components/pages/RegisterPage";
import { AuthService } from "@/services/auth";

// Mock router navigation
const mockNavigate = vi.fn();

// Mock AuthService
vi.mock("@/services/auth", () => ({
  AuthService: {
    register: vi.fn(),
    generateVerificationToken: vi.fn(),
  },
}));

describe("RegisterPage Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  it("renders registration inputs correctly", () => {
    render(<RegisterPage navigate={mockNavigate} />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("triggers validation errors for weak password", async () => {
    render(<RegisterPage navigate={mockNavigate} />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText("Password");
    const confirmInput = screen.getByLabelText("Confirm Password");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitBtn = screen.getByRole("button", { name: /Create Account/i });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@stadium.com" } });
    fireEvent.change(passwordInput, { target: { value: "weak" } });
    fireEvent.change(confirmInput, { target: { value: "weak" } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it("registers successfully and changes state on valid inputs", async () => {
    vi.mocked(AuthService.register).mockResolvedValue({
      id: "test-user",
      name: "John Doe",
      email: "john@stadium.com",
      role: "fan",
      isVerified: false,
    });
    vi.mocked(AuthService.generateVerificationToken).mockResolvedValue("test-token");

    render(<RegisterPage navigate={mockNavigate} />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@stadium.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Pass1234!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Pass1234!" } });
    
    // Check the terms and conditions checkbox
    const termsCheckbox = screen.getByRole("checkbox");
    fireEvent.click(termsCheckbox);

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(AuthService.register).toHaveBeenCalledWith("John Doe", "john@stadium.com", "Pass1234!", "fan");
    });
  });
});
