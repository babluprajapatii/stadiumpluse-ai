"use client";

import { useState, useEffect } from "react";
import { Zap, ArrowRight, CheckCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn, getErrorMessage } from "../ui/utils";
import type { Navigate, PageId } from "@/types";
import { AuthService } from "@/services/auth";

export function ResetPasswordPage({ navigate, token }: { navigate: Navigate; token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTokenError("Missing password reset token.");
      return;
    }
    AuthService.validateResetToken(token)
      .then(() => {
        setTokenError("");
      })
      .catch((err: unknown) => {
        setTokenError(getErrorMessage(err, "Invalid or expired reset token."));
      });
  }, [token]);

  // Real-time validations
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    match: password === confirmPassword && password.length > 0,
  };

  const isFormValid =
    checks.length &&
    checks.uppercase &&
    checks.lowercase &&
    checks.number &&
    checks.special &&
    checks.match;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isFormValid) {
      setErrorMsg("Please ensure all password requirements are satisfied.");
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Failed to reset password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-full flex flex-col md:flex-row focus:outline-none">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 bg-sidebar flex-col items-center justify-center p-12 min-h-full">
        <div className="max-w-xs w-full">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
            <Zap size={22} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-sidebar-foreground mb-2">StadiumPulse AI</h1>
          <p className="text-sidebar-accent-foreground/60 text-sm leading-relaxed mb-10">
            FIFA World Cup 2026 · GenAI-powered stadium operations.
          </p>
          <div className="space-y-4">
            {[
              "Real-time crowd intelligence",
              "AI-powered incident response",
              "Seamless fan experience",
              "Multi-role access control",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-success shrink-0" aria-hidden="true" />
                <span className="text-sm text-sidebar-foreground/80">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-background">
        <div className="w-full max-w-sm">
          {tokenError ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={28} className="text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Link Invalid or Expired</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
                {tokenError === "Missing password reset token."
                  ? "A valid security token is required to reset your password."
                  : "This password reset token is invalid, expired, or has already been used."}
              </p>
              <button
                onClick={() => navigate("forgot-password" as PageId)}
                className="w-full mb-3 px-4 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                Request New Link
              </button>
              <button
                onClick={() => navigate("login")}
                className="w-full px-4 py-2.5 text-xs font-medium border border-border text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Password Reset Successful</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
                Your password has been successfully updated. You can now log in using your new credentials.
              </p>
              <button
                onClick={() => navigate("login")}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Reset Password</h2>
              <p className="text-sm text-muted-foreground mb-7">Create a strong new password for your account.</p>

              {errorMsg && (
                <div
                  className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2"
                  role="alert"
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>

                {/* Password Strength Checklist */}
                <div className="p-3.5 bg-sidebar rounded-xl border border-sidebar-border space-y-2 mt-2">
                  <p className="text-[10px] font-semibold text-sidebar-accent-foreground/60 uppercase tracking-wider">
                    Password Requirements
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
                    {[
                      { label: "8+ Characters", met: checks.length },
                      { label: "Uppercase (A-Z)", met: checks.uppercase },
                      { label: "Lowercase (a-z)", met: checks.lowercase },
                      { label: "Number (0-9)", met: checks.number },
                      { label: "Special Char", met: checks.special },
                      { label: "Passwords Match", met: checks.match },
                    ].map((rule) => (
                      <div key={rule.label} className="flex items-center gap-1.5 text-[10px]">
                        <CheckCircle
                          size={11}
                          className={cn(
                            "shrink-0",
                            rule.met ? "text-success" : "text-sidebar-accent-foreground/30"
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            rule.met ? "text-foreground font-medium" : "text-sidebar-accent-foreground/65"
                          )}
                        >
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2 mt-2" size="lg" disabled={loading || !isFormValid}>
                  {loading ? "Resetting..." : "Reset Password"} <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
