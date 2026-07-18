"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";
import { supabase } from "@/lib/supabase";

import { setSessionCookie, clearSessionCookie } from "@/app/auth-actions";

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

const SESSION_KEY = "stadium_session";

// ─── Storage helpers ──────────────────────────────────────────────────────────

async function persistSession(user: User, maxAge: number): Promise<void> {
  const snapshot: Partial<User> = { id: user.id, email: user.email, name: user.name, role: user.role };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
    await setSessionCookie(user.role, maxAge);
  } catch {
    // Storage unavailable (e.g. private browsing)
  }
}

async function clearSession(): Promise<void> {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    await clearSessionCookie();
  } catch {
    // Ignore
  }
}

/**
 * Reads cached user from localStorage — only safe to call AFTER hydration.
 * Never call this at module-level or inside useState initializer because
 * the server cannot access localStorage and the result will differ,
 * causing a hydration mismatch.
 */
function readCachedUser(): User | null {
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
  /**
   * HYDRATION FIX: Always initialise user as null (matches SSR output).
   * We load the localStorage cache inside useEffect — which only runs
   * client-side AFTER the first render — so server and client first-render
   * are always identical (user = null, sidebar shows nothing).
   */
  const [user, setUser] = useState<User | null>(null);
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
      await persistSession(hydrated, 604800);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    /**
     * Step 1: Immediately restore the locally-cached user so the sidebar
     * appears populated without waiting for a Supabase round-trip.
     * This runs AFTER the first render (hydration is complete), so
     * the state update is safe and will not cause a mismatch.
     */
    const cached = readCachedUser();
    if (cached && mounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(cached);
    }

    /**
     * Step 2: Verify the cached user with Supabase and hydrate fresh data.
     * If there is no active session, clear local state.
     */
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        await hydrateProfile(session.user.id, session.user.email ?? "");
        if (mounted) setIsLoading(false);
      } else {
        // No active session — clear any stale local cache
        setUser(null);
        await clearSession();
        if (mounted) setIsLoading(false);
      }
    });

    /**
     * Step 3: Subscribe to future auth state changes
     * (login, logout, token refresh).
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          try {
            await hydrateProfile(session.user.id, session.user.email ?? "");
          } catch {
            // Keep current user state on profile fetch failure
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        await clearSession();
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
      await persistSession(loggedUser, rememberMe ? 604800 : 86400);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const oauthLogin = useCallback(async (email: string, name: string, role: string): Promise<User> => {
    setIsLoading(true);
    try {
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
      await persistSession(sessionUser, 604800);
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
    await persistSession(sessionUser, 604800);
  }, [user]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthService.logout(user?.id);
    } catch {
      // Non-blocking
    }
    setUser(null);
    await clearSession();
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
