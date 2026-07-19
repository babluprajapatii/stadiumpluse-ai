import { useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight, CheckCircle, ChevronLeft, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn, getErrorMessage } from "../ui/utils";
import type { Navigate, PageId } from "@/types";
import { useAuth } from "@/providers/AuthProvider";
import { PageSchema } from "../seo/PageSchema";

export function LoginPage({ navigate }: { navigate: Navigate }) {
  const [role, setRole] = useState("fan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login, oauthLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password, rememberMe);
      navigate(loggedUser.role as PageId);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const loggedUser = await oauthLogin(`${role}_oauth@stadium.com`, `${role.toUpperCase()} User`, role);
      navigate(loggedUser.role as PageId);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "OAuth login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-full flex flex-col md:flex-row focus:outline-none">
      <PageSchema
        breadcrumbs={[
          { name: "Home", item: "https://stadiumpulse.ai" },
          { name: "Login", item: "https://stadiumpulse.ai/login" }
        ]}
      />
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
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-success shrink-0" aria-hidden="true" />
                <span className="text-sm text-sidebar-foreground/80">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-background">
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate("landing")}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded disabled:opacity-50 cursor-pointer"
          >
            <ChevronLeft size={14} aria-hidden="true" /> Back to home
          </button>
          <h2 className="text-xl font-bold text-foreground mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-7">Select your role to continue.</p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2" role="alert">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="mb-6">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-2.5">I am a…</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Select your role">
                {["Fan", "Volunteer", "Security", "Organizer", "Operator", "Accessibility"].map(r => {
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
            
            <div className="space-y-4 mb-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="alex@stadium.com"
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    onClick={(e) => {
                      if (navigate) {
                        e.preventDefault();
                        navigate("forgot-password" as PageId);
                      }
                    }}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 pb-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="rounded border-border text-primary focus:ring-ring cursor-pointer"
              />
              <Label htmlFor="remember" className="text-xs text-muted-foreground font-normal cursor-pointer select-none">
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"} <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-border" />
            <span className="text-[10px] text-muted-foreground">or continue with</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              {
                name: "Google",
                svg: (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                ),
              },
              {
                name: "Apple",
                svg: (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                ),
              },
            ].map(({ name, svg }) => (
              <Button key={name} variant="outline" className="gap-2" disabled={loading} onClick={handleOAuthLogin}>
                {svg}{name}
              </Button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline"
              onClick={(e) => {
                if (navigate) {
                  e.preventDefault();
                  navigate("register" as PageId);
                }
              }}
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
