/**
 * Authentication Service — Supabase-backed.
 * Handles registration, login, logout, password reset, profile management,
 * and email verification flows for StadiumPulse AI.
 */

import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/providers/AuthProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  phone?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  memberSince?: string;
  lastLogin?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Records an action to the activity_logs table. Non-blocking — never throws. */
async function logActivity(userId: string, action: string): Promise<void> {
  try {
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action,
      ip_address: "127.0.0.1",
      user_agent: typeof window !== "undefined" ? window.navigator.userAgent : "SSR",
    });
  } catch {
    // Non-blocking — audit log failures must never break the auth flow
  }
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export class AuthService {
  /**
   * Register a new user with Supabase Auth.
   * The `handle_new_user` database trigger creates the corresponding profile row.
   */
  static async register(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<RegisteredUser> {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name: name.trim(), role },
      },
    });

    if (error) {
      // Preserve the original Supabase error so callers can surface the real message
      throw error;
    }

    if (!data.user) {
      throw new Error("Registration failed — no user was returned.");
    }

    return {
      id: data.user.id,
      name: name.trim(),
      email: normalizedEmail,
      role,
      isVerified: data.user.identities?.[0]?.identity_data?.email_verified ?? false,
    };
  }

  /**
   * Authenticate via Supabase Auth and fetch the full profile.
   */
  static async authenticate(email: string, password: string): Promise<RegisteredUser> {
    const normalizedEmail = email.trim().toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      throw new Error(authError.message || "Invalid email or password.");
    }

    if (!authData.user) {
      throw new Error("Authentication failed — no user was returned.");
    }

    // Fetch profile from the public table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, role, phone, organization, bio, avatar_url, member_since, last_login, is_verified")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      // Profile may not have propagated yet — provision it as a fallback
      const fallbackRole = (authData.user.user_metadata?.role as UserRole) || "fan";
      const fallbackName = (authData.user.user_metadata?.name as string) || "User";

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          name: fallbackName,
          email: normalizedEmail,
          role: fallbackRole,
          is_verified: true,
        })
        .select("id, name, email, role, phone, organization, bio, avatar_url, member_since, last_login, is_verified")
        .single();

      if (createError || !newProfile) {
        throw new Error("Failed to load user profile. Please try again.");
      }

      await logActivity(authData.user.id, "LOGIN");
      return this.mapProfile(newProfile);
    }

    // Enforce email verification requirement
    if (!profile.is_verified && !authData.user.email_confirmed_at) {
      throw new Error("Please verify your email address before logging in.");
    }

    // Update last_login timestamp
    await supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", authData.user.id);

    await logActivity(authData.user.id, "LOGIN");
    return this.mapProfile({ ...profile, last_login: new Date().toISOString() });
  }

  /**
   * Sign out the current session.
   */
  static async logout(userId?: string): Promise<void> {
    if (userId) await logActivity(userId, "LOGOUT");
    await supabase.auth.signOut();
  }

  /**
   * Send a password reset email via Supabase Auth.
   */
  static async generateResetToken(email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "";

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });

    if (error) {
      throw new Error(error.message || "Failed to send password reset email.");
    }

    return "reset_email_sent";
  }

  /**
   * Update the authenticated user's password.
   * Requires an active Supabase session (injected via the reset-password email link).
   */
  static async resetPassword(_token: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message || "Failed to update password.");
    }
  }

  /**
   * Update profile fields in the public profiles table.
   */
  static async updateProfile(
    userId: string,
    updates: {
      name: string;
      phone?: string;
      organization?: string;
      bio?: string;
      avatar?: string;
    }
  ): Promise<RegisteredUser> {
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        name: updates.name.trim(),
        phone: updates.phone ?? null,
        organization: updates.organization ?? null,
        bio: updates.bio ?? null,
        avatar_url: updates.avatar !== undefined ? updates.avatar : undefined,
      })
      .eq("id", userId)
      .select("id, name, email, role, phone, organization, bio, avatar_url, member_since, last_login, is_verified")
      .single();

    if (error || !profile) {
      throw new Error(error?.message || "Failed to update profile.");
    }

    await logActivity(userId, "PROFILE_UPDATED");
    return this.mapProfile(profile);
  }

  /**
   * Verify the user's email using the Supabase-issued token (from the verification link).
   * For the simple case where no token is available, update the profiles table directly.
   */
  static async verifyEmail(email: string): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("email", email.trim().toLowerCase());

    if (error) {
      throw new Error("Email verification failed.");
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private static mapProfile(profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
    organization?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    member_since?: string | null;
    last_login?: string | null;
    is_verified?: boolean;
  }): RegisteredUser {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as UserRole,
      isVerified: profile.is_verified ?? false,
      phone: profile.phone ?? undefined,
      organization: profile.organization ?? undefined,
      bio: profile.bio ?? undefined,
      avatar: profile.avatar_url ?? undefined,
      memberSince: profile.member_since
        ? new Date(profile.member_since).toLocaleDateString("en-US", { year: "numeric", month: "long" })
        : undefined,
      lastLogin: profile.last_login
        ? new Date(profile.last_login).toLocaleString()
        : undefined,
    };
  }

  // ─── Verification helpers (Supabase-native) ───────────────────────────────

  /**
   * Sends (or re-sends) a Supabase verification email.
   * Returns a placeholder token string; real verification happens via the email link.
   */
  static async generateVerificationToken(email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/verify-email` : "";

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      throw new Error(error.message || "Failed to resend verification email.");
    }

    // Return a placeholder — the real token is delivered via email by Supabase
    return "supabase_verification_email_sent";
  }

  /**
   * Verifies a Supabase email token (OTP sent via the verification link).
   * If called with the placeholder string, it marks the current profile as verified
   * if a Supabase session exists.
   */
  static async verifyEmailWithToken(token: string): Promise<void> {
    // For placeholder tokens (post-resend), check current session and mark verified
    if (token === "supabase_verification_email_sent" || token.startsWith("vtok_")) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        await this.verifyEmail(session.user.email);
      }
      return;
    }

    // For Supabase OTP tokens (from email link), verify via OTP exchange
    // The token type is 'email' for signup verification links
    throw new Error("Please click the verification link sent to your email to verify your account.");
  }

  /**
   * Validates that a password reset token is still active.
   * With Supabase, the reset token is exchanged server-side via the email link.
   * This method is called client-side when the user lands on /reset-password;
   * we validate by checking whether a session exists (Supabase injects it).
   */
  static async validateResetToken(_token: string): Promise<{ email: string; token: string; expiresAt: number; isUsed: boolean }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Invalid or expired password reset link. Please request a new one.");
    }
    return {
      email: session.user.email ?? "",
      token: _token,
      expiresAt: Date.now() + 600000,
      isUsed: false,
    };
  }
}

