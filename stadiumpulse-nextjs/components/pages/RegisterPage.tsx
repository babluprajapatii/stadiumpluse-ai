"use client";

import { useState } from "react";
import { Zap, ArrowRight, CheckCircle, ChevronLeft, Mail, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import type { Navigate } from "@/types";
import { AuthService, RegisteredUser } from "@/services/auth";

export function RegisterPage({ navigate }: { navigate: Navigate }) {
  const [role, setRole] = useState("fan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Flow states: "form" | "pending" | "verified"
  const [flowState, setFlowState] = useState<"form" | "pending" | "verified">("form");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [verificationToken, setVerificationToken] = useState("");

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptTerms) {
      errors.terms = "You must accept the terms and conditions.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Register via AuthService
      await AuthService.register(name, email, password, role as RegisteredUser["role"]);
      const token = await AuthService.generateVerificationToken(email);
      setVerificationToken(token);
      setFlowState("pending");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendToken = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = await AuthService.generateVerificationToken(email);
      setVerificationToken(token);
      alert("Verification email simulated again successfully.");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVerification = async () => {
    setLoading(true);
    try {
      await AuthService.verifyEmailWithToken(verificationToken);
      setFlowState("verified");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col md:flex-row">
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
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {flowState === "form" && (
            <>
              <button
                onClick={() => navigate("login")}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft size={14} aria-hidden="true" /> Back to login
              </button>
              <h2 className="text-xl font-bold text-foreground mb-1">Create Account</h2>
              <p className="text-sm text-muted-foreground mb-5">Join the FIFA 2026 digital operations platform.</p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2" role="alert">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    disabled={loading}
                  />
                  {validationErrors.name && (
                    <p className="text-[10px] text-destructive">{validationErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@stadium.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                  {validationErrors.email && (
                    <p className="text-[10px] text-destructive">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-2">My Role</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Select your role">
                    {["Fan", "Volunteer", "Security", "Organizer", "Operator"].map((r) => {
                      const on = role === r.toLowerCase();
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r.toLowerCase())}
                          disabled={loading}
                          aria-pressed={on}
                          className={cn(
                            "px-3.5 py-1.5 text-xs rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 cursor-pointer",
                            on
                              ? "bg-primary text-white border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                          )}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {validationErrors.password && (
                    <p className="text-[10px] text-destructive">{validationErrors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-[10px] text-destructive">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex items-start gap-2.5 pt-1.5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={loading}
                    className="mt-0.5 rounded border-border text-primary focus:ring-ring cursor-pointer"
                  />
                  <Label htmlFor="terms" className="text-xs text-muted-foreground leading-normal font-normal cursor-pointer select-none">
                    I accept the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                  </Label>
                </div>
                {validationErrors.terms && (
                  <p className="text-[10px] text-destructive mt-1">{validationErrors.terms}</p>
                )}

                <Button type="submit" className="w-full gap-2 mt-2" size="lg" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </form>
            </>
          )}

          {flowState === "pending" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail size={28} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Verification Pending</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
                We&apos;ve simulated sending a verification link to <strong className="text-foreground">{email}</strong>.
                Click the simulation button below to complete verification.
              </p>
              <Button onClick={handleSimulateVerification} className="w-full" size="lg" disabled={loading}>
                {loading ? "Verifying..." : "Simulate Link Click"}
              </Button>
              <button
                type="button"
                onClick={handleResendToken}
                disabled={loading}
                className="mt-4 text-xs text-primary hover:underline block mx-auto cursor-pointer focus-visible:outline-none"
              >
                Resend Verification Email
              </button>
            </div>
          )}

          {flowState === "verified" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Account Verified!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
                Your email address has been successfully verified. You are now ready to sign in.
              </p>
              <Button onClick={() => navigate("login")} className="w-full" size="lg">
                Proceed to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
