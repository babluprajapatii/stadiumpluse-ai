"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "fan" | "volunteer" | "security" | "organizer" | "operator" | "accessibility";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  memberSince?: string;
  lastLogin?: string;
}

interface ProfileUpdates {
  name: string;
  phone?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  oauthLogin: (email: string, name: string, role: string) => Promise<User>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
  logout: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Session storage key. Only stores non-sensitive display data. */
const SESSION_KEY = "stadium_session";

/** Cookie name for middleware-based route protection. */
const SESSION_COOKIE = "stadium_session";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Stores a minimal, non-sensitive user snapshot for session persistence. */
function persistSession(user: User, maxAge: number): void {
  // We only store the role, id, name, and email (no avatar/bio/org for privacy)
  const snapshot: Partial<User> = { id: user.id, email: user.email, name: user.name, role: user.role };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
    // Cookie is used by middleware for server-side route protection only
    document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify({ role: user.role }))}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Storage may be unavailable (e.g. private browsing with restrictions)
  }
}

/** Clears all persisted session data. */
function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

/** Reads the locally cached user snapshot (for fast initial hydration only). */
function readCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(readCachedUser);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /** Fetches the full profile from Supabase and updates state. */
  const hydrateProfile = useCallback(async (sessionUserId: string, sessionUserEmail: string): Promise<void> => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, role, phone, organization, bio, avatar_url, member_since, last_login")
      .eq("id", sessionUserId)
      .single();

    if (profile) {
      const hydrated: User = {
        id: sessionUserId,
        email: sessionUserEmail,
        name: profile.name,
        role: profile.role as UserRole,
        phone: profile.phone ?? undefined,
        organization: profile.organization ?? undefined,
        bio: profile.bio ?? undefined,
        avatar: profile.avatar_url ?? undefined,
        memberSince: profile.member_since
          ? new Date(profile.member_since as string).toLocaleDateString("en-US", { year: "numeric", month: "long" })
          : undefined,
        lastLogin: profile.last_login
          ? new Date(profile.last_login as string).toLocaleString()
          : undefined,
      };
      setUser(hydrated);
      persistSession(hydrated, 604800); // 7-day cookie
    }
  }, []);

  // Listen to Supabase authentication state changes
  useEffect(() => {
    let mounted = true;

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        hydrateProfile(session.user.id, session.user.email ?? "").finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setUser(null);
        clearSession();
        setIsLoading(false);
      }
    });

    // 2. Subscribe to auth state changes (handles login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session?.user) {
        // Re-hydrate profile on sign-in or token refresh
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          hydrateProfile(session.user.id, session.user.email ?? "").catch(() => {
            // Profile fetch failed — keep the current user state
          });
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        clearSession();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateProfile]);

  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await AuthService.authenticate(email, password);
      const loggedUser: User = {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
        phone: authenticatedUser.phone,
        organization: authenticatedUser.organization,
        bio: authenticatedUser.bio,
        avatar: authenticatedUser.avatar,
        memberSince: authenticatedUser.memberSince,
        lastLogin: authenticatedUser.lastLogin,
      };

      setUser(loggedUser);
      // rememberMe: 7 days vs 1 day
      persistSession(loggedUser, rememberMe ? 604800 : 86400);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const oauthLogin = useCallback(async (email: string, name: string, role: string): Promise<User> => {
    setIsLoading(true);
    try {
      // OAuth simulation: attempt sign-in; register if user doesn't exist
      let authUser: Awaited<ReturnType<typeof AuthService.authenticate>>;
      const simulatedPassword = "OauthSimulatedPass123!";

      try {
        authUser = await AuthService.authenticate(email, simulatedPassword);
      } catch {
        await AuthService.register(name, email, simulatedPassword, role as UserRole);
        await supabase.from("profiles").update({ is_verified: true }).eq("email", email.trim().toLowerCase());
        authUser = await AuthService.authenticate(email, simulatedPassword);
      }

      const sessionUser: User = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        role: authUser.role,
        phone: authUser.phone,
        organization: authUser.organization,
        bio: authUser.bio,
        avatar: authUser.avatar,
        memberSince: authUser.memberSince,
        lastLogin: authUser.lastLogin,
      };

      setUser(sessionUser);
      persistSession(sessionUser, 604800);
      return sessionUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: ProfileUpdates): Promise<void> => {
    if (!user) return;
    const updatedUser = await AuthService.updateProfile(user.id, updates);
    const sessionUser: User = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      phone: updatedUser.phone,
      organization: updatedUser.organization,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      memberSince: updatedUser.memberSince,
      lastLogin: updatedUser.lastLogin,
    };
    setUser(sessionUser);
    persistSession(sessionUser, 604800);
  }, [user]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthService.logout(user?.id);
    } catch {
      // Non-blocking — always clear local state
    }
    setUser(null);
    clearSession();
    router.push("/");
  }, [user, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        oauthLogin,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
