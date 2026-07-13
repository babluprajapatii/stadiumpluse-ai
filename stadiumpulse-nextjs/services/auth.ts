/**
 * Production-style Authentication Service using Supabase.
 * Connects user credentials and profiles directly to Supabase Auth & PostgreSQL databases.
 * Fully compatible with the StadiumPulse UI.
 */

import { supabase } from "@/lib/supabase";

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "fan" | "volunteer" | "security" | "organizer" | "operator";
  isVerified: boolean;
  phone?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  memberSince?: string;
  lastLogin?: string;
}

export interface ResetToken {
  email: string;
  token: string;
  expiresAt: number;
  isUsed: boolean;
}

export interface VerificationToken {
  email: string;
  token: string;
  expiresAt: number;
  isUsed: boolean;
}

// Retrieve verification tokens from storage safely (used for simulated verify links fallback)
function getStoredVerificationTokens(): VerificationToken[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("stadium_verification_tokens");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save verification tokens to storage
function saveVerificationTokens(tokens: VerificationToken[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("stadium_verification_tokens", JSON.stringify(tokens));
  }
}

export class AuthService {
  /**
   * Register a new user with Supabase Auth, triggering public profile creation.
   */
  static async register(
    name: string,
    email: string,
    password: string,
    role: RegisteredUser["role"]
  ): Promise<RegisteredUser> {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name.trim(),
          role,
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Registration failed.");
    }

    if (!data.user) {
      throw new Error("Registration failed.");
    }

    return {
      id: data.user.id,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: "",
      role,
      isVerified: data.user.identities?.[0]?.identity_data?.email_verified ?? false,
    };
  }

  /**
   * Authenticate credentials via Supabase Auth and fetch their profile.
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
      throw new Error("Authentication failed.");
    }

    // Retrieve custom profile information from the public table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      // If profile hasn't propagated yet, provision it immediately as a safety fallback
      const fallbackRole = (authData.user.user_metadata?.role || "fan") as RegisteredUser["role"];
      const fallbackName = authData.user.user_metadata?.name || "User";

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          name: fallbackName,
          email: normalizedEmail,
          role: fallbackRole,
          is_verified: true, // Mark verified since auth login completed
        })
        .select("*")
        .single();

      if (createError || !newProfile) {
        throw new Error("Failed to load user profile context.");
      }

      return {
        id: authData.user.id,
        name: newProfile.name,
        email: newProfile.email,
        passwordHash: "",
        role: newProfile.role as RegisteredUser["role"],
        isVerified: newProfile.is_verified,
        memberSince: new Date(newProfile.member_since).toLocaleDateString("en-US", { year: "numeric", month: "long" }),
      };
    }

    // Verify confirmation block
    if (!profile.is_verified && !authData.user.email_confirmed_at) {
      throw new Error("Please verify your email address before logging in.");
    }

    // Log login timestamps
    const lastLoginTime = new Date().toISOString();
    await supabase.from("profiles").update({ last_login: lastLoginTime }).eq("id", authData.user.id);

    // Audit Log Login Action
    try {
      await supabase.from("activity_logs").insert({
        user_id: authData.user.id,
        action: "LOGIN",
        ip_address: "127.0.0.1", // In Next.js client side, fallback to local loopback
        user_agent: typeof window !== "undefined" ? window.navigator.userAgent : "SSR",
      });
    } catch {
      // Non-blocking log failures
    }

    return {
      id: authData.user.id,
      name: profile.name,
      email: profile.email,
      passwordHash: "",
      role: profile.role as RegisteredUser["role"],
      isVerified: profile.is_verified || authData.user.email_confirmed_at !== null,
      phone: profile.phone || undefined,
      organization: profile.organization || undefined,
      bio: profile.bio || undefined,
      avatar: profile.avatar_url || undefined,
      memberSince: new Date(profile.member_since).toLocaleDateString("en-US", { year: "numeric", month: "long" }),
      lastLogin: lastLoginTime ? new Date(lastLoginTime).toLocaleString() : undefined,
    };
  }

  /**
   * Log out session.
   */
  static async logout(userId?: string): Promise<void> {
    if (userId) {
      try {
        await supabase.from("activity_logs").insert({
          user_id: userId,
          action: "LOGOUT",
          ip_address: "127.0.0.1",
          user_agent: typeof window !== "undefined" ? window.navigator.userAgent : "SSR",
        });
      } catch {
        // Non-blocking
      }
    }
    await supabase.auth.signOut();
  }

  /**
   * Request password reset email from Supabase.
   */
  static async generateResetToken(email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "";

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      throw new Error(error.message || "Failed to send reset link.");
    }

    // Return dummy token indicator since Supabase fires links directly
    return "supabase_fired_token";
  }

  /**
   * Dummy validator - Supabase reset redirects inject verified sessions automatically
   */
  static async validateResetToken(token: string): Promise<ResetToken> {
    return {
      email: "",
      token,
      expiresAt: Date.now() + 60000,
      isUsed: false,
    };
  }

  /**
   * Reset user password inside active session.
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message || "Failed to update password.");
    }
  }

  /**
   * Update profile fields inside public profiles table.
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
        phone: updates.phone || null,
        organization: updates.organization || null,
        bio: updates.bio || null,
        avatar_url: updates.avatar !== undefined ? updates.avatar : undefined,
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error || !profile) {
      throw new Error(error?.message || "Failed to update profile.");
    }

    // Audit Log Profile Updates
    try {
      await supabase.from("activity_logs").insert({
        user_id: userId,
        action: "PROFILE_UPDATED",
        ip_address: "127.0.0.1",
        user_agent: typeof window !== "undefined" ? window.navigator.userAgent : "SSR",
      });
    } catch {
      // Non-blocking
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      passwordHash: "",
      role: profile.role as RegisteredUser["role"],
      isVerified: profile.is_verified,
      phone: profile.phone || undefined,
      organization: profile.organization || undefined,
      bio: profile.bio || undefined,
      avatar: profile.avatar_url || undefined,
      memberSince: new Date(profile.member_since).toLocaleDateString("en-US", { year: "numeric", month: "long" }),
      lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleString() : undefined,
    };
  }

  /**
   * Generate simulated verification token.
   */
  static async generateVerificationToken(email: string): Promise<string> {
    const token = "vtok_" + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const tokens = getStoredVerificationTokens();
    tokens.push({
      email: email.trim().toLowerCase(),
      token,
      expiresAt,
      isUsed: false,
    });
    saveVerificationTokens(tokens);

    return token;
  }

  /**
   * Validate verification token.
   */
  static async validateVerificationToken(token: string): Promise<VerificationToken> {
    const tokens = getStoredVerificationTokens();
    const record = tokens.find((t) => t.token === token);

    if (!record) {
      throw new Error("Invalid or missing verification token.");
    }
    if (record.isUsed) {
      throw new Error("This verification token has already been used.");
    }
    if (Date.now() > record.expiresAt) {
      throw new Error("This verification token has expired.");
    }

    return record;
  }

  /**
   * Verify public profile using verification token.
   */
  static async verifyEmailWithToken(token: string): Promise<void> {
    const record = await this.validateVerificationToken(token);

    // Update profiles table is_verified status
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("email", record.email);

    if (error) {
      throw new Error(error.message || "Email verification failed.");
    }

    // Mark token as used
    const tokens = getStoredVerificationTokens();
    const tokenRecord = tokens.find((t) => t.token === token);
    if (tokenRecord) {
      tokenRecord.isUsed = true;
      saveVerificationTokens(tokens);
    }
  }

  /**
   * Legacy verify helper.
   */
  static async verifyEmail(email: string, token?: string): Promise<void> {
    if (token) {
      await this.verifyEmailWithToken(token);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("email", email.trim().toLowerCase());

    if (error) {
      throw new Error("Verification failed.");
    }
  }
}
