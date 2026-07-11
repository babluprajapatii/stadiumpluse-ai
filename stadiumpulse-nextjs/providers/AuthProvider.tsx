"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: "fan" | "volunteer" | "security" | "organizer" | "operator";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for persistent session
    const storedUser = localStorage.getItem("stadium_session");
    if (storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("stadium_session");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: string) => {
    setIsLoading(true);
    // Simulate API authorization response
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const loggedUser: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      email: email,
      name: email.split("@")[0].replace(/^\w/, (c) => c.toUpperCase()) + " O.",
      role: role as User["role"],
    };
    
    setUser(loggedUser);
    localStorage.setItem("stadium_session", JSON.stringify(loggedUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("stadium_session");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
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
