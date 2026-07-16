"use client";

import { useState, useEffect } from "react";
import { Zap, CheckCircle, ShieldAlert, ArrowRight, Mail, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getErrorMessage } from "../ui/utils";
import { AuthService } from "@/services/auth";
import type { Navigate } from "@/types";

export function VerifyEmailPage({ navigate, token }: { navigate: Navigate; token: string }) {
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Resend flow states
  const [email, setEmail] = useState("");
  const [resendSuccessToken, setResendSuccessToken] = useState("");
  const [resendError, setResendError] = useState("");

  // Validate and verify on mount
  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVerificationError("Missing email verification token.");
      return;
    }
    setLoading(true);
    AuthService.verifyEmailWithToken(token)
      .then(() => {
        setIsSuccess(true);
        setVerificationError("");
      })
      .catch((err) => {
        setVerificationError(getErrorMessage(err, "Invalid or expired verification token."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError("");
    setResendSuccessToken("");

    const trimmed = email.trim();
    if (!trimmed) {
      setResendError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setResendError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const newToken = await AuthService.generateVerificationToken(trimmed);
      setResendSuccessToken(newToken);
    } catch (err: unknown) {
      setResendError(getErrorMessage(err, "We could not find an account with that email address."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col md:flex-row bg-background">
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
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {loading ? (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">Verifying your email address...</p>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Account Verified!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
                Your email address has been successfully verified. You are now ready to sign in.
              </p>
              <button
                onClick={() => navigate("login")}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                Proceed to Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert size={28} className="text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Link Expired or Invalid</h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {verificationError === "Missing email verification token."
                    ? "A security verification token is required to verify your account."
                    : "This email verification link is invalid, expired, or has already been used."}
                </p>
              </div>

              {/* Resend Flow */}
              {!resendSuccessToken ? (
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-foreground">Request New Verification Link</h3>
                  
                  {resendError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2" role="alert">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>{resendError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResendEmail} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="resend-email">Registered Email Address</Label>
                      <Input
                        id="resend-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@stadium.com"
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? "Generating..." : "Resend Verification Email"}{" "}
                      <ArrowRight size={14} aria-hidden="true" />
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-5 text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <Mail size={22} className="text-primary" />
                  </div>
                  <h3 className="text-xs font-bold text-foreground">Verification Link Sent</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    We&apos;ve simulated sending a new verification link to <strong className="text-foreground">{email}</strong>.
                    Click below to simulate visiting the verification page.
                  </p>
                  <button
                    onClick={() => {
                      window.location.href = `/verify-email?token=${resendSuccessToken}`;
                    }}
                    className="w-full px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors cursor-pointer"
                  >
                    Simulate Verification Link Click
                  </button>
                </div>
              )}

              <button
                onClick={() => navigate("login")}
                className="w-full px-4 py-2.5 text-xs font-medium border border-border text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
