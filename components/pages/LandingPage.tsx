"use client";

import Link from "next/link";
import { Zap, ArrowRight, Star, Shield, Activity, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { LiveBadge } from "../ui/live-badge";
import { Surface } from "../shared/Surface";

/**
 * Public landing page — no authentication required.
 * All navigation uses Next.js Link for optimal prefetching and accessibility.
 * "use client" is only here for the smooth scroll handler on nav anchors.
 */
export function LandingPage() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-background min-h-full">
      <nav
        className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-5 py-3.5 flex items-center justify-between"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
            <Zap size={13} className="text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-sm text-foreground">StadiumPulse</span>
          <Badge className="text-[9px] px-1.5 py-0 h-4">AI</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-5 mr-3">
            {(["Features", "Pricing", "Docs", "About"] as const).map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={(e) => handleScroll(e, l.toLowerCase())}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {l}
              </a>
            ))}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </nav>

      <section className="px-5 pt-16 pb-12 md:px-12 md:pt-24 max-w-5xl mx-auto">
        <LiveBadge label="FIFA World Cup 2026 · 47K live · Gate B open" className="mb-5" />
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
          The intelligent<br />stadium platform.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-xl">
          GenAI-powered operations for FIFA World Cup 2026 — real-time intelligence for fans, volunteers, security, and operators.
        </p>
        <div className="flex gap-3 flex-wrap mb-12">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/login">
              Explore as Fan <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">View AI Command Center</Link>
          </Button>
        </div>
        <Link
          href="/login"
          className="w-full h-56 md:h-80 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-border relative overflow-hidden group flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open the demo — click to sign in"
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.2) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="relative">
              <div className="w-56 h-32 md:w-80 md:h-44 rounded-[50%] border-2 border-primary/30" />
              <div className="absolute inset-4 rounded-[50%] border border-primary/20" />
              <div className="absolute inset-8 md:inset-12 rounded-[50%] bg-primary/10 border border-primary/15" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary/50 rounded-full" />
            </div>
          </div>
          <span className="relative z-10 bg-foreground/90 text-background text-xs font-semibold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Click to explore →
          </span>
          <div className="absolute bottom-4 right-4" aria-hidden="true">
            <LiveBadge label="Live" />
          </div>
        </Link>
      </section>

      <section className="border-y border-border py-8 px-5 md:px-12" aria-label="Platform statistics">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {(
            [
              ["150K+", "Active fans"],
              ["200+", "Events / year"],
              ["99.9%", "Uptime SLA"],
              ["6 roles", "Supported"],
            ] as const
          ).map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-3xl font-bold text-foreground tabular-nums">{n}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-5 py-14 md:px-12 max-w-5xl mx-auto scroll-mt-20">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">Features</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Built for every role.</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { Icon: Star,     title: "Fan Experience",    desc: "Real-time wayfinding, food queue estimates, and loyalty rewards delivered instantly." },
            { Icon: Shield,   title: "Security Ops",      desc: "AI incident detection, crowd density alerts, and rapid dispatch routing." },
            { Icon: Activity, title: "AI Command Center", desc: "GenAI operations hub — live insights, predictions, and automated recommendations." },
          ].map(({ Icon, title, desc }) => (
            <Surface key={title} className="group hover:border-primary/30 cursor-default">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon size={18} className="text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1.5">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </Surface>
          ))}
        </div>
      </section>

      <section id="pricing" className="px-5 py-14 md:px-12 max-w-5xl mx-auto border-t border-border scroll-mt-20">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">Pricing</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Flexible plans for any tournament size.</h2>
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-8 max-w-xl">
          Scale operations from local matches to world championship finals with adaptive pricing models.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <Surface className="flex flex-col justify-between p-6">
            <div>
              <h3 className="font-bold text-base text-foreground mb-1">Fan &amp; Volunteer Core</h3>
              <p className="text-xs text-muted-foreground mb-4">Essential tools for stadium entry and volunteering.</p>
              <div className="text-3xl font-bold text-foreground mb-6">Free</div>
              <ul className="space-y-3 mb-6">
                {["Live wayfinding maps", "Digital concession ordering", "Volunteer duty rosters", "Standard emergency alerts"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={14} className="text-success shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </Surface>

          <Surface className="flex flex-col justify-between p-6 border-primary/30 bg-primary/5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-base text-foreground">Intelligent Command</h3>
                <Badge>Recommended</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">GenAI-powered decision making and command center orchestration.</p>
              <div className="text-3xl font-bold text-foreground mb-6">Contact Sales</div>
              <ul className="space-y-3 mb-6">
                {["All Basic features", "GenAI operation recommendations", "Real-time crowd heatmaps", "Automated incident dispatching", "99.9% uptime SLA"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={14} className="text-primary shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Button className="w-full" asChild>
              <Link href="/login">Contact Operations</Link>
            </Button>
          </Surface>
        </div>
      </section>

      <section id="docs" className="px-5 py-14 md:px-12 max-w-5xl mx-auto border-t border-border scroll-mt-20">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">Docs</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Developer &amp; Operational Reference</h2>
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-8 max-w-xl">
          Integrate StadiumPulse AI core endpoints, dispatch loops, and AI agent frameworks.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: "Command Center SDK", desc: "Integrate camera feeds, crowd counts, and localized gate traffic estimators directly into the AI core." },
            { title: "Incident Dispatch Protocol", desc: "Configure automated notification channels for security teams and local emergency dispatches." },
            { title: "Fan Concessions API", desc: "Sync stadium food menus, retrieve wait-time estimations, and execute POS queue handshakes." },
            { title: "Accessibility Standards", desc: "Compliance workflows and screen-reader assets for inclusive stadium wayfinding." },
          ].map((doc) => (
            <Surface key={doc.title} className="p-4 hover:border-primary/20 transition-colors">
              <h3 className="font-semibold text-xs text-foreground mb-1">{doc.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{doc.desc}</p>
              <span className="text-[10px] text-primary font-medium inline-flex items-center gap-1">
                Read guides <ArrowRight size={10} aria-hidden="true" />
              </span>
            </Surface>
          ))}
        </div>
      </section>

      <section id="about" className="px-5 py-14 md:px-12 max-w-5xl mx-auto border-t border-border scroll-mt-20">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">About</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Empowering the world&apos;s grandest stages.</h2>
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-8 max-w-xl">
          StadiumPulse AI was born out of a mission to ensure modern sports events are secure, accessible, and delight every visitor.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Our Mission", text: "Providing real-time operational safety and inclusive assistance tools to fans and crews alike." },
            { label: "GenAI Intelligence", text: "Harnessing deep neural prediction systems to coordinate evacuations and guide gate entry." },
            { label: "FIFA 2026 Ready", text: "Fully tested and architected to support concurrent high-capacity stadium crowd flows." },
          ].map((item) => (
            <Surface key={item.label} className="p-4 bg-muted/40">
              <h3 className="font-bold text-xs text-foreground mb-1.5">{item.label}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.text}</p>
            </Surface>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 md:px-12 max-w-5xl mx-auto">
        <div className="bg-foreground dark:bg-card rounded-2xl p-10 text-center border border-border">
          <h2 className="text-2xl font-bold text-background dark:text-foreground mb-3">Transform your stadium.</h2>
          <p className="text-sm text-background/60 dark:text-muted-foreground mb-8">FIFA World Cup 2026 · Powered by GenAI.</p>
          <Button size="lg" className="gap-2 text-white" asChild>
            <Link href="/register">
              Start free trial <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 md:px-12" role="contentinfo">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center" aria-hidden="true">
              <Zap size={10} className="text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-xs text-foreground">StadiumPulse AI</span>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-5 list-none p-0 m-0">
              {["Privacy", "Terms", "Support", "Careers", "Blog", "Status"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-[10px] text-muted-foreground/60">© 2026 StadiumPulse AI, Inc.</p>
        </div>
      </footer>
    </div>
  );
}
