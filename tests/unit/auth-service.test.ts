import { describe, it, expect, vi, afterEach } from "vitest";
import { AuthService } from "@/services/auth";

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: () => ({
      select: () => mockSelect(),
      insert: () => ({
        select: () => ({
          single: vi.fn().mockResolvedValue({
            data: { id: "new-user-id", name: "Bob", email: "bob@stadium.com", role: "volunteer", is_verified: true },
            error: null,
          }),
        }),
      }),
      update: () => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}));

describe("AuthService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("register", () => {
    it("signs up a user and returns registered user details on success", async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            identities: [{ identity_data: { email_verified: true } }],
          },
        },
        error: null,
      });

      const user = await AuthService.register("Bob", "bob@stadium.com", "Pass123!", "volunteer");
      expect(user.id).toBe("test-user-id");
      expect(user.name).toBe("Bob");
      expect(user.email).toBe("bob@stadium.com");
      expect(user.role).toBe("volunteer");
    });

    it("throws an error when signup fails in Supabase", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: new Error("Supabase signup failed"),
      });

      await expect(
        AuthService.register("Bob", "bob@stadium.com", "Pass123!", "volunteer")
      ).rejects.toThrow("Supabase signup failed");
    });
  });

  describe("authenticate", () => {
    it("successfully logs in and fetches profile data", async () => {
      mockSignIn.mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      });

      mockSelect.mockReturnValue({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "test-user-id",
              name: "Bob",
              email: "bob@stadium.com",
              role: "volunteer",
              is_verified: true,
            },
            error: null,
          }),
        })),
      });

      const user = await AuthService.authenticate("bob@stadium.com", "Pass123!");
      expect(user.id).toBe("test-user-id");
      expect(user.name).toBe("Bob");
      expect(user.role).toBe("volunteer");
    });

    it("throws an error on invalid credentials", async () => {
      mockSignIn.mockResolvedValue({
        data: { user: null },
        error: new Error("Invalid login credentials"),
      });

      await expect(
        AuthService.authenticate("bob@stadium.com", "wrong-pass")
      ).rejects.toThrow("Invalid login credentials");
    });
  });

  describe("logout", () => {
    it("calls supabase.auth.signOut", async () => {
      mockSignOut.mockResolvedValue({ error: null });
      await expect(AuthService.logout()).resolves.not.toThrow();
    });
  });
});
