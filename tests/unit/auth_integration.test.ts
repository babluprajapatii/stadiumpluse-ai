/**
 * tests/unit/auth_integration.test.ts
 *
 * Integration tests covering complete auth workflows:
 *   - Register → success, failure, no-user fallback
 *   - Authenticate → success, error, profile fallback, email unverified
 *   - Logout → with/without userId
 *   - generateResetToken → success, error
 *   - resetPassword → success, error
 *   - updateProfile → success, error
 *   - verifyEmail → success, error
 *   - generateVerificationToken → success, error
 *   - verifyEmailWithToken → placeholder, session-backed, throws
 *   - validateResetToken → session found, no session
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/services/auth";

// ── Supabase mock ─────────────────────────────────────────────────────────────

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockResend = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetSession = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockFromUpdate = vi.fn();
const mockFromInsert = vi.fn();
const mockFromSelect = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...a: unknown[]) => mockSignIn(...a),
      signUp: (...a: unknown[]) => mockSignUp(...a),
      signOut: (...a: unknown[]) => mockSignOut(...a),
      resend: (...a: unknown[]) => mockResend(...a),
      updateUser: (...a: unknown[]) => mockUpdateUser(...a),
      getSession: (...a: unknown[]) => mockGetSession(...a),
      resetPasswordForEmail: (...a: unknown[]) => mockResetPasswordForEmail(...a),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: () => mockFromSelect(table),
          order: vi.fn(() => mockFromSelect(table)),
        })),
      })),
      update: vi.fn((payload: unknown) => ({
        eq: vi.fn((col: string, val: unknown) => {
          const chain = {
            eq: vi.fn(() => chain),
            select: vi.fn(() => ({ single: () => mockFromUpdate(table, payload, col, val) })),
            then: (cb: (r: unknown) => unknown) =>
              Promise.resolve(mockFromUpdate(table, payload, col, val)).then(cb),
          };
          return chain;
        }),
      })),
      insert: vi.fn((payload: unknown) => ({
        select: vi.fn(() => ({
          single: () => mockFromInsert(table, payload),
          then: (cb: (r: unknown) => unknown) =>
            Promise.resolve(mockFromInsert(table, payload)).then(cb),
        })),
        then: (cb: (r: unknown) => unknown) =>
          Promise.resolve(mockFromInsert(table, payload)).then(cb),
      })),
    })),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROFILE = {
  id: "u1",
  name: "Jamie",
  email: "jamie@stadium.com",
  role: "fan",
  phone: null,
  organization: null,
  bio: null,
  avatar_url: null,
  member_since: "2026-01-01T00:00:00Z",
  last_login: "2026-07-18T12:00:00Z",
  is_verified: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFromSelect.mockResolvedValue({ data: null, error: null });
  mockFromUpdate.mockReturnValue({ data: PROFILE, error: null });
  mockFromInsert.mockReturnValue({ data: PROFILE, error: null });
});

// ─── AuthService.register ─────────────────────────────────────────────────────

describe("AuthService.register", () => {
  it("succeeds and returns registered user", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          identities: [{ identity_data: { email_verified: true } }],
        },
      },
      error: null,
    });
    const user = await AuthService.register("Jamie", "jamie@stadium.com", "Pass123!", "fan");
    expect(user.id).toBe("u1");
    expect(user.email).toBe("jamie@stadium.com");
    expect(user.name).toBe("Jamie");
    expect(user.role).toBe("fan");
    expect(user.isVerified).toBe(true);
  });

  it("normalises email to lowercase", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "u2", identities: [] } },
      error: null,
    });
    const user = await AuthService.register("Bob", "BOB@STADIUM.COM", "Pass123!", "volunteer");
    expect(user.email).toBe("bob@stadium.com");
  });

  it("throws on Supabase signup error", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: new Error("Email already in use"),
    });
    await expect(
      AuthService.register("Bob", "bob@stadium.com", "Pass123!", "fan")
    ).rejects.toThrow("Email already in use");
  });

  it("throws when Supabase returns no user", async () => {
    mockSignUp.mockResolvedValue({ data: { user: null }, error: null });
    await expect(
      AuthService.register("Bob", "bob@stadium.com", "Pass123!", "fan")
    ).rejects.toThrow("Registration failed");
  });

  it("handles missing identities gracefully (isVerified = false)", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "u3", identities: undefined } },
      error: null,
    });
    const user = await AuthService.register("Ann", "ann@stadium.com", "Pass123!", "security");
    expect(user.isVerified).toBe(false);
  });
});

// ─── AuthService.authenticate ────────────────────────────────────────────────

describe("AuthService.authenticate", () => {
  const AUTH_SUCCESS = {
    data: {
      user: {
        id: "u1",
        email: "jamie@stadium.com",
        email_confirmed_at: "2026-01-01T00:00:00Z",
        user_metadata: { role: "fan", name: "Jamie" },
      },
    },
    error: null,
  };

  it("succeeds and returns mapped user with profile from DB", async () => {
    mockSignIn.mockResolvedValue(AUTH_SUCCESS);
    mockFromSelect.mockResolvedValue({ data: PROFILE, error: null });
    mockFromUpdate.mockReturnValue({ data: PROFILE, error: null });

    const user = await AuthService.authenticate("jamie@stadium.com", "Pass123!");
    expect(user.id).toBe("u1");
    expect(user.name).toBe("Jamie");
    expect(user.role).toBe("fan");
  });

  it("throws when Supabase signIn returns error", async () => {
    mockSignIn.mockResolvedValue({
      data: { user: null },
      error: new Error("Invalid credentials"),
    });
    await expect(
      AuthService.authenticate("bad@user.com", "wrong")
    ).rejects.toThrow("Invalid credentials");
  });

  it("throws when signIn returns no user", async () => {
    mockSignIn.mockResolvedValue({ data: { user: null }, error: null });
    await expect(
      AuthService.authenticate("x@x.com", "p")
    ).rejects.toThrow("Authentication failed");
  });

  it("throws when profile is not found and insert also fails", async () => {
    mockSignIn.mockResolvedValue(AUTH_SUCCESS);
    // Profile fetch fails
    mockFromSelect.mockResolvedValue({ data: null, error: { message: "not found", code: "PGRST116" } });
    // Fallback insert also fails
    mockFromInsert.mockReturnValue({ data: null, error: { message: "insert error" } });

    await expect(
      AuthService.authenticate("jamie@stadium.com", "Pass123!")
    ).rejects.toThrow("Failed to load user profile");
  });

  it("provisions profile when not found and insert succeeds", async () => {
    mockSignIn.mockResolvedValue(AUTH_SUCCESS);
    mockFromSelect.mockResolvedValue({ data: null, error: { message: "not found" } });
    mockFromInsert.mockReturnValue({ data: PROFILE, error: null });

    const user = await AuthService.authenticate("jamie@stadium.com", "Pass123!");
    expect(user.id).toBe("u1");
  });

  it("throws when email is not verified", async () => {
    mockSignIn.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "jamie@stadium.com",
          email_confirmed_at: null,
          user_metadata: { role: "fan", name: "Jamie" },
        },
      },
      error: null,
    });
    mockFromSelect.mockResolvedValue({
      data: { ...PROFILE, is_verified: false },
      error: null,
    });
    mockFromUpdate.mockReturnValue({ data: PROFILE, error: null });

    await expect(
      AuthService.authenticate("jamie@stadium.com", "Pass123!")
    ).rejects.toThrow("verify your email");
  });
});

// ─── AuthService.logout ───────────────────────────────────────────────────────

describe("AuthService.logout", () => {
  it("calls signOut", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    mockFromInsert.mockReturnValue({ error: null });
    await AuthService.logout("u1");
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("calls signOut even without userId", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await AuthService.logout();
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});

// ─── AuthService.generateResetToken ──────────────────────────────────────────

describe("AuthService.generateResetToken", () => {
  it("returns placeholder string on success", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const result = await AuthService.generateResetToken("jamie@stadium.com");
    expect(result).toBe("reset_email_sent");
  });

  it("throws on Supabase error", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: new Error("Email not found") });
    await expect(
      AuthService.generateResetToken("nobody@stadium.com")
    ).rejects.toThrow("Email not found");
  });
});

// ─── AuthService.resetPassword ───────────────────────────────────────────────

describe("AuthService.resetPassword", () => {
  it("resolves without error on success", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    await expect(AuthService.resetPassword("tok", "NewPass123!")).resolves.not.toThrow();
  });

  it("throws when updateUser returns error", async () => {
    mockUpdateUser.mockResolvedValue({ error: new Error("Password too weak") });
    await expect(
      AuthService.resetPassword("tok", "weak")
    ).rejects.toThrow("Password too weak");
  });
});

// ─── AuthService.updateProfile ───────────────────────────────────────────────

describe("AuthService.updateProfile", () => {
  it("updates profile and returns user", async () => {
    mockFromUpdate.mockReturnValue({ data: PROFILE, error: null });
    mockFromInsert.mockReturnValue({ data: null, error: null });

    const user = await AuthService.updateProfile("u1", { name: "Jamie Updated" });
    expect(user.id).toBe("u1");
  });

  it("throws when update returns error", async () => {
    mockFromUpdate.mockReturnValue({ data: null, error: new Error("Update failed") });
    await expect(
      AuthService.updateProfile("u1", { name: "Bad Update" })
    ).rejects.toThrow("Update failed");
  });

  it("throws when profile is null after update", async () => {
    mockFromUpdate.mockReturnValue({ data: null, error: null });
    await expect(
      AuthService.updateProfile("u1", { name: "Test" })
    ).rejects.toThrow("Failed to update profile");
  });
});

// ─── AuthService.verifyEmail ─────────────────────────────────────────────────

describe("AuthService.verifyEmail", () => {
  it("resolves without error on success", async () => {
    mockFromUpdate.mockReturnValue({ error: null });
    await expect(AuthService.verifyEmail("jamie@stadium.com")).resolves.not.toThrow();
  });

  it("throws on database error", async () => {
    mockFromUpdate.mockReturnValue({ error: new Error("DB error") });
    await expect(
      AuthService.verifyEmail("bad@stadium.com")
    ).rejects.toThrow("Email verification failed");
  });
});

// ─── AuthService.generateVerificationToken ───────────────────────────────────

describe("AuthService.generateVerificationToken", () => {
  it("returns placeholder on success", async () => {
    mockResend.mockResolvedValue({ error: null });
    const token = await AuthService.generateVerificationToken("jamie@stadium.com");
    expect(token).toBe("supabase_verification_email_sent");
  });

  it("throws on error", async () => {
    mockResend.mockResolvedValue({ error: new Error("Rate limited") });
    await expect(
      AuthService.generateVerificationToken("x@x.com")
    ).rejects.toThrow("Rate limited");
  });
});

// ─── AuthService.verifyEmailWithToken ────────────────────────────────────────

describe("AuthService.verifyEmailWithToken", () => {
  it("processes placeholder token using current session email", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { email: "jamie@stadium.com" } } },
    });
    mockFromUpdate.mockReturnValue({ error: null });
    await expect(
      AuthService.verifyEmailWithToken("supabase_verification_email_sent")
    ).resolves.not.toThrow();
  });

  it("processes vtok_ prefix token", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { email: "jamie@stadium.com" } } },
    });
    mockFromUpdate.mockReturnValue({ error: null });
    await expect(
      AuthService.verifyEmailWithToken("vtok_abc123")
    ).resolves.not.toThrow();
  });

  it("handles placeholder token with no active session gracefully", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    await expect(
      AuthService.verifyEmailWithToken("supabase_verification_email_sent")
    ).resolves.not.toThrow();
  });

  it("throws for unknown real tokens (OTP link flow)", async () => {
    await expect(
      AuthService.verifyEmailWithToken("real-otp-token-12345")
    ).rejects.toThrow("click the verification link");
  });
});

// ─── AuthService.validateResetToken ──────────────────────────────────────────

describe("AuthService.validateResetToken", () => {
  it("returns session data when session exists", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { email: "jamie@stadium.com" },
        },
      },
    });
    const result = await AuthService.validateResetToken("sometoken");
    expect(result.email).toBe("jamie@stadium.com");
    expect(result.isUsed).toBe(false);
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });

  it("throws when no session exists", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    await expect(
      AuthService.validateResetToken("expired-token")
    ).rejects.toThrow("Invalid or expired password reset link");
  });
});
