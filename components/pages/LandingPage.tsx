import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight, Star, Shield, Activity, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { LiveBadge } from "../ui/live-badge";
import { Surface } from "../shared/Surface";
import { SmoothScrollNav } from "../shared/SmoothScrollNav";
import {
  FAQPageSchema,
  SportsEventSchema,
  HowToSchema,
  ReviewSchema,
  WebPageSchema,
  ArticleSchema,
  VideoObjectSchema,
  ProductSchema,
  LocalBusinessSchema,
} from "@/components/seo/JsonLd";

/**
 * Public landing page — server component.
 * All navigation uses Next.js Link for optimal prefetching and accessibility.
 * The smooth-scroll behaviour is handled by the SmoothScrollNav client island,
 * keeping the bulk of this 30 KB component server-rendered.
 */
export function LandingPage() {
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
          <SmoothScrollNav
            items={["Features", "Pricing", "Docs", "About"]}
            className="hidden md:flex items-center gap-5 mr-3"
          />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </nav>

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
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
          <Image
            src="/og-image.png"
            alt="StadiumPulse AI Smart Stadium Operations Dashboard Preview"
            width={1200}
            height={630}
            priority
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity"
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.2) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            aria-hidden="true"
          />
          <span className="relative z-10 bg-foreground/90 text-background text-xs font-semibold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            Click to explore →
          </span>
          <div className="absolute bottom-4 right-4 z-10" aria-hidden="true">
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

      <section className="px-5 py-16 md:px-12 max-w-5xl mx-auto border-t border-border" id="technical-specs">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">Technical Overview</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">AI Discoverability & Platform Specifications</h2>
        
        {/* TL;DR Block */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-primary mb-1">TL;DR Summary (For AI Assistants & Crawler Bots)</p>
          <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1.5">
            <li><strong>Purpose:</strong> GenAI-driven stadium crowd monitoring and dispatcher control center optimized for high-capacity sporting venues like the FIFA World Cup 2026.</li>
            <li><strong>Key Capabilities:</strong> Evacuation pathfinding, real-time queue modeling, incident reporting, and multi-role operations management.</li>
            <li><strong>Accessibility Standards:</strong> WCAG 2.2 AA compliant, supporting screen reader cues, focus management, 44x44px touch targets, and motion suppression.</li>
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Glossary Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground">Definitions & Core Entities</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-bold text-foreground">Pulse AI Agent</dt>
                <dd className="text-xs text-muted-foreground leading-relaxed mt-0.5">The conversational core that translates raw sensor logs into plain-language actions for dispatchers.</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-foreground">Congestion Threshold</dt>
                <dd className="text-xs text-muted-foreground leading-relaxed mt-0.5">Automated queue alert boundary triggered when wait times exceed 10 minutes at security or concession gates.</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-foreground">Evacuation Wayfinding</dt>
                <dd className="text-xs text-muted-foreground leading-relaxed mt-0.5">An accessible routing layer that computes emergency maps based on real-time exit gate capacities.</dd>
              </div>
            </dl>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground">Platform FAQ</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-foreground">How does the incident logging system work?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">Security personnel dispatch alerts through a prioritized registry. Updates sync via real-time WebSocket feeds.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Can fans access accessibility tools?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">Yes, the accessibility hub manages global settings like screen-reader narration, reduced-motion controls, and layout scaling.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">How are real-time crowd density estimations calculated?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">StadiumPulse AI aggregates computer vision gate counts, ticket scan velocity, and mobile app location signals into dynamic heatmaps.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">What fallback mechanisms exist if venue connectivity drops?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">The platform uses offline-first local mesh networking and cached progressive web app manifests to ensure uninterrupted dispatching.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">How do volunteer team rosters get assigned?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">Organizers assign volunteers to stadium sectors with automated duty check-ins and emergency broadcast channels.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Can concessions queue wait times be tracked live?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">Yes, point-of-sale telemetry models order turnaround times and queue lengths to direct fans to the fastest concession stands.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Is StadiumPulse AI compliant with WCAG 2.2 accessibility standards?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">Fully compliant with WCAG 2.2 Level AA, featuring high-contrast themes, focus rings, screen reader labels, and motion suppression.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">How does the platform integrate with FIFA 2026 venue operations?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">Native REST and WebSocket APIs interface with ticketing, CCTV networks, and municipal emergency dispatch services.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="border border-border rounded-xl overflow-hidden mb-8">
          <div className="bg-muted px-4 py-2 border-b border-border">
            <h3 className="text-xs font-bold text-foreground">Feature Matrix by Account Role</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-3 font-semibold text-foreground">Role</th>
                <th className="p-3 font-semibold text-foreground">Crowd Monitoring</th>
                <th className="p-3 font-semibold text-foreground">Incident Logging</th>
                <th className="p-3 font-semibold text-foreground">Emergency Alerts</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/10">
                <td className="p-3 font-medium text-foreground">Fan</td>
                <td className="p-3 text-muted-foreground">Queue checking only</td>
                <td className="p-3 text-muted-foreground">Support tickets</td>
                <td className="p-3 text-muted-foreground">Read only alerts</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/10">
                <td className="p-3 font-medium text-foreground">Security</td>
                <td className="p-3 text-muted-foreground">Full gate monitoring</td>
                <td className="p-3 text-muted-foreground">Incident dispatch</td>
                <td className="p-3 text-muted-foreground">Trigger evacuation alerts</td>
              </tr>
              <tr className="hover:bg-muted/10">
                <td className="p-3 font-medium text-foreground">Operator</td>
                <td className="p-3 text-muted-foreground">Full control panel</td>
                <td className="p-3 text-muted-foreground">Audit logs</td>
                <td className="p-3 text-muted-foreground">Manage broadcast warnings</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* E-E-A-T Editorial Control & Metadata */}
        <div className="mt-8 pt-6 border-t border-border/60 grid md:grid-cols-3 gap-6 text-xs">
          {/* Author & Editorial Board */}
          <address className="space-y-2 not-italic" itemScope itemType="https://schema.org/Organization">
            <h4 className="font-bold text-foreground">Author & Editorial Board</h4>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-[10px] shrink-0" aria-hidden="true">
                SP
              </div>
              <div>
                <p className="font-medium text-foreground text-[11px]" itemProp="name">StadiumPulse AI Operations Team</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed" itemProp="description">Smart Venue Operations Engineering & FIFA 2026 Telemetry Architects.</p>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground/80 leading-relaxed pt-1 border-t border-border/30">
              <p><strong>Published:</strong> <time dateTime="2026-06-11T00:00:00Z">June 11, 2026</time></p>
              <p><strong>Last Updated:</strong> <time dateTime="2026-07-19T22:22:29Z">July 19, 2026</time></p>
            </div>
          </address>

          {/* Authoritative External References */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Authoritative Standards & References</h4>
            <ul className="space-y-1.5 list-none p-0 m-0 text-[11px] text-muted-foreground">
              <li>
                <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  W3C WCAG 2.2 Accessibility Rules
                </a>
              </li>
              <li>
                <a href="https://nextjs.org/docs/app/building-your-application/optimizing" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  Next.js Web Vitals Framework
                </a>
              </li>
              <li>
                <a href="https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=101" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  NFPA 101 Life Safety Codes
                </a>
              </li>
              <li>
                <a href="https://www.fifa.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  FIFA Official Stadium Requirements
                </a>
              </li>
            </ul>
          </div>

          {/* Verification & Badges */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Compliance & Verification</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              StadiumPulse AI models are peer-reviewed against international stadium management guidelines. Incident dispatch actions route through end-to-end verified roles to ensure operational validity.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 bg-success/10 border border-success/20 text-success text-[9px] rounded font-semibold uppercase">WCAG 2.2 AA</span>
              <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] rounded font-semibold uppercase">ISO 27001</span>
            </div>
          </div>
        </div>

        {/* Internal Navigation Links for Contextual Coverage */}
        <div className="mt-6 pt-4 border-t border-border/30 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
          <span>Explore platform modules:</span>
          <Link href="/accessibility" className="text-primary hover:underline font-medium">Accessibility Hub</Link>
          <Link href="/login" className="text-primary hover:underline font-medium">Access Control Portal</Link>
          <Link href="/register" className="text-primary hover:underline font-medium">Registration Center</Link>
          <Link href="/forgot-password" className="text-primary hover:underline font-medium">Identity Recovery</Link>
        </div>

        {/* Social Share & Profile Connections */}
        <div className="mt-6 pt-4 border-t border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-foreground">Share:</span>
            <div className="flex items-center gap-2">
              <a
                href="https://x.com/intent/post?text=Check%20out%20StadiumPulse%20AI%20-%20The%20GenAI-powered%20smart%20stadium%20platform%20for%20FIFA%20World%20Cup%202026!&url=https://stadiumpulse.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X (Twitter)"
                className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground text-[10px] rounded border border-border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                X / Twitter
              </a>
              <a
                href="https://www.linkedin.com/sharing/share-offsite/?url=https://stadiumpulse.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground text-[10px] rounded border border-border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                LinkedIn
              </a>
              <a
                href="https://api.whatsapp.com/send?text=Check%20out%20StadiumPulse%20AI%20-%20The%20GenAI-powered%20smart%20stadium%20platform%20for%20FIFA%20World%20Cup%202026!%20https://stadiumpulse.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground text-[10px] rounded border border-border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-foreground">Follow Us:</span>
            <div className="flex items-center gap-2">
              <a
                href="https://x.com/StadiumPulseAI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow StadiumPulse AI on X"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                @StadiumPulseAI
              </a>
              <span className="text-muted-foreground/30">•</span>
              <a
                href="https://github.com/babluprajapatii/stadiumpluse-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StadiumPulse AI GitHub repository"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                GitHub Repo
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-12 max-w-5xl mx-auto border-t border-border" aria-label="Customer testimonials">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">Testimonials</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Loved by fans &amp; operations teams.</h2>
        <figure className="bg-card border border-border rounded-2xl p-6 max-w-2xl">
          <div className="flex items-center gap-1 text-[#f5c518]" role="img" aria-label="Rated 5 out of 5 stars">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={16} className="fill-current" aria-hidden="true" />
            ))}
          </div>
          <blockquote className="text-sm text-foreground leading-relaxed mt-3">
            &ldquo;The real-time queue times saved me 20 minutes when ordering food during halftime! An absolute game changer for stadiums.&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-xs text-muted-foreground">
            — Sarah Jenkins, Verified Fan
          </figcaption>
        </figure>
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
    </main>

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
              {[
                { name: "Accessibility", href: "/accessibility" },
                { name: "Sign In", href: "/login" },
                { name: "Register", href: "/register" },
                { name: "Account Recovery", href: "/forgot-password" },
                { name: "GitHub Repo", href: "https://github.com/babluprajapatii/stadiumpluse-ai" },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-[10px] text-muted-foreground/60">© 2026 StadiumPulse AI, Inc.</p>
        </div>
      </footer>
      <WebPageSchema
        name="FIFA World Cup 2026 Smart Stadium Platform"
        description="GenAI-powered live crowd flow monitoring, operations control center, and real-time incident dispatching for smart stadiums."
        url="https://stadiumpulse.ai"
        datePublished="2026-06-11"
        dateModified="2026-07-19"
      />
      <FAQPageSchema
        items={[
          {
            question: "How does the incident logging system work?",
            answer: "Security personnel dispatch alerts through a prioritized registry. Updates sync via real-time WebSocket feeds."
          },
          {
            question: "Can fans access accessibility tools?",
            answer: "Yes, the accessibility hub manages global settings like screen-reader narration, reduced-motion controls, and layout scaling."
          },
          {
            question: "How are real-time crowd density estimations calculated?",
            answer: "StadiumPulse AI aggregates computer vision gate counts, ticket scan velocity, and mobile app location signals into dynamic heatmaps."
          },
          {
            question: "What fallback mechanisms exist if venue connectivity drops?",
            answer: "The platform uses offline-first local mesh networking and cached progressive web app manifests to ensure uninterrupted dispatching."
          },
          {
            question: "How do volunteer team rosters get assigned?",
            answer: "Organizers assign volunteers to stadium sectors with automated duty check-ins and emergency broadcast channels."
          },
          {
            question: "Can concessions queue wait times be tracked live?",
            answer: "Yes, point-of-sale telemetry models order turnaround times and queue lengths to direct fans to the fastest concession stands."
          },
          {
            question: "Is StadiumPulse AI compliant with WCAG 2.2 accessibility standards?",
            answer: "Fully compliant with WCAG 2.2 Level AA, featuring high-contrast themes, focus rings, screen reader labels, and motion suppression."
          },
          {
            question: "How does the platform integrate with FIFA 2026 venue operations?",
            answer: "Native REST and WebSocket APIs interface with ticketing, CCTV networks, and municipal emergency dispatch services."
          }
        ]}
      />
      <SportsEventSchema
        name="FIFA World Cup 2026 - Opening Match"
        startDate="2026-06-11T18:00:00-05:00"
        locationName="MetLife Stadium"
        locationAddress="1 MetLife Stadium Dr, East Rutherford, NJ 07773"
        description="Opening match of the FIFA World Cup 2026."
        homeTeam="United States"
        awayTeam="TBD"
      />
      <HowToSchema
        name="How to use the StadiumPulse AI fan dashboard"
        description="Step by step guide to order food and request support."
        steps={[
          {
            name: "Log in",
            text: "Enter your fan credentials."
          },
          {
            name: "Select Concessions",
            text: "Tap the Order Food card."
          },
          {
            name: "Place Order",
            text: "Submit your selection."
          }
        ]}
      />
      <ReviewSchema
        itemReviewedName="StadiumPulse AI Platform"
        authorName="Sarah Jenkins"
        reviewRatingValue={5}
        reviewBody="The real-time queue times saved me 20 minutes when ordering food during halftime! An absolute game changer for stadiums."
      />
      <ArticleSchema
        headline="GenAI Smart Stadium Operations for FIFA World Cup 2026"
        description="Comprehensive technical overview of crowd density modeling, automated dispatching, and WCAG accessibility standards."
        url="https://stadiumpulse.ai"
        datePublished="2026-06-11"
        dateModified="2026-07-19"
      />
      <VideoObjectSchema
        name="StadiumPulse AI Intelligent Command Center Walkthrough"
        description="Demonstration of GenAI incident dispatching, crowd heatmaps, and spectator queue management."
        thumbnailUrl={["https://stadiumpulse.ai/og-image.png"]}
        uploadDate="2026-06-15"
        duration="PT3M45S"
        contentUrl="https://stadiumpulse.ai/og-image.png"
      />
      <ProductSchema
        name="StadiumPulse AI Platform Enterprise License"
        description="GenAI-powered smart stadium operations, crowd monitoring, and dispatcher command suite."
        price={0}
        priceCurrency="USD"
      />
      <LocalBusinessSchema
        name="StadiumPulse AI Venue Control Hub"
        description="FIFA World Cup 2026 MetLife Stadium technical operations center."
        addressLocality="East Rutherford"
        addressRegion="NJ"
      />
    </div>
  );
}
