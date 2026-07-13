"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: "fan" | "volunteer" | "security" | "organizer" | "operator";
  phone?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  memberSince?: string;
  lastLogin?: string;
}
import { AuthService } from "@/services/auth";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<User>;
  oauthLogin: (email: string, name: string, role: string) => Promise<User>;
  updateProfile: (updates: {
    name: string;
    phone?: string;
    organization?: string;
    bio?: string;
    avatar?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Listen to Supabase authentication state changes
  useEffect(() => {
    // 1. Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const userObj: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                role: profile.role as User["role"],
                phone: profile.phone || undefined,
                organization: profile.organization || undefined,
                bio: profile.bio || undefined,
                avatar: profile.avatar_url || undefined,
                memberSince: new Date(profile.member_since).toLocaleDateString("en-US", { year: "numeric", month: "long" }),
                lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleString() : undefined,
              };
              setUser(userObj);
              document.cookie = `stadium_session=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=604800; SameSite=Lax`;
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    // 2. State change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const userObj: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                role: profile.role as User["role"],
                phone: profile.phone || undefined,
                organization: profile.organization || undefined,
                bio: profile.bio || undefined,
                avatar: profile.avatar_url || undefined,
                memberSince: new Date(profile.member_since).toLocaleDateString("en-US", { year: "numeric", month: "long" }),
                lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleString() : undefined,
              };
              setUser(userObj);
              document.cookie = `stadium_session=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=604800; SameSite=Lax`;
            }
          });
      } else {
        setUser(null);
        document.cookie = "stadium_session=; path=/; max-age=0; SameSite=Lax";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string, rememberMe = false): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await AuthService.authenticate(email, password || "");
      
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
      
      const maxAge = rememberMe ? 604800 : 86400; // 7 days vs 1 day
      
      localStorage.setItem("stadium_session", JSON.stringify(loggedUser));
      document.cookie = `stadium_session=${encodeURIComponent(JSON.stringify(loggedUser))}; path=/; max-age=${maxAge}; SameSite=Lax`;
      setIsLoading(false);
      return loggedUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const oauthLogin = async (email: string, name: string, role: string): Promise<User> => {
    setIsLoading(true);
    try {
      const password = "OauthSimulatedPass123!";
      let sessionUser: User;

      try {
        const authUser = await AuthService.authenticate(email, password);
        sessionUser = {
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
      } catch {
        // Fallback: register new user on the fly
        await AuthService.register(name, email, password, role as User["role"]);
        // Set verified immediately to bypass checks
        await supabase.from("profiles").update({ is_verified: true }).eq("email", email.trim().toLowerCase());

        const authUser = await AuthService.authenticate(email, password);
        sessionUser = {
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
      }

      setUser(sessionUser);
      localStorage.setItem("stadium_session", JSON.stringify(sessionUser));
      document.cookie = `stadium_session=${encodeURIComponent(JSON.stringify(sessionUser))}; path=/; max-age=604800; SameSite=Lax`;
      setIsLoading(false);
      return sessionUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const updateProfile = async (updates: {
    name: string;
    phone?: string;
    organization?: string;
    bio?: string;
    avatar?: string;
  }) => {
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
    localStorage.setItem("stadium_session", JSON.stringify(sessionUser));
    // Sync cookie
    document.cookie = `stadium_session=${encodeURIComponent(JSON.stringify(sessionUser))}; path=/; max-age=604800; SameSite=Lax`;
  };

  const logout = () => {
    AuthService.logout(user?.id);
    setUser(null);
    localStorage.removeItem("stadium_session");
    sessionStorage.removeItem("stadium_session");
    // Clear cookie
    document.cookie = "stadium_session=; path=/; max-age=0; SameSite=Lax";
    router.push("/");
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
