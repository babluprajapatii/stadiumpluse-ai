"use client";

import { useState } from "react";
import { Zap, ArrowRight, CheckCircle, ChevronLeft, AlertTriangle, Key } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Navigate } from "@/types";
import { AuthService } from "@/services/auth";
import { getErrorMessage } from "../ui/utils";
import { PageSchema } from "../seo/PageSchema";

export function ForgotPasswordPage({ navigate }: { navigate: Navigate }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToken, setSuccessToken] = useState("");

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const token = await AuthService.generateResetToken(trimmed);
      setSuccessToken(token);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "An error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-full flex flex-col md:flex-row focus:outline-none">
      <PageSchema
        breadcrumbs={[
          { name: "Home", item: "https://stadiumpulse.ai" },
          { name: "Forgot Password", item: "https://stadiumpulse.ai/forgot-password" }
        ]}
      />
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
          {!successToken ? (
            <>
              <button
                onClick={() => navigate("login")}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft size={14} aria-hidden="true" /> Back to login
              </button>
              <h2 className="text-xl font-bold text-foreground mb-1">Forgot Password</h2>
              <p className="text-sm text-muted-foreground mb-7">
                Enter your email address and we&apos;ll send you a password reset link.
              </p>

              {errorMsg && (
                <div
                  className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2"
                  role="alert"
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSendLink} className="space-y-4">
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
                </div>

                <Button type="submit" className="w-full gap-2 pt-1" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"} <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key size={28} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Reset Link Generated</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
                We&apos;ve simulated generating a secure password reset link for{" "}
                <strong className="text-foreground">{email}</strong>. Click below to simulate visiting the reset page.
              </p>

              <button
                onClick={() => {
                  // Direct navigation to reset-password with query parameter token
                  window.location.href = `/reset-password?token=${successToken}`;
                }}
                className="w-full mb-3 px-4 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                Simulate Reset Email Click
              </button>

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
    </main>
  );
}
