# StadiumPulse AI

**GenAI-powered intelligent stadium operations platform — built for FIFA World Cup 2026.**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](#)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

---

## 📋 Overview

StadiumPulse AI is a production-ready, multi-role stadium management platform that uses **Generative AI** to deliver real-time operational intelligence, fan engagement tools, and accessibility services — all in a single unified interface.

The platform supports **six distinct user roles**, each with a tailored dashboard and feature set:

| Role | Dashboard | Key Features |
|---|---|---|
| **Fan** | `/fan` | Live event data, food ordering, AI assistant, rewards |
| **Organizer** | `/organizer` | Operations timeline, analytics, AI insights |
| **Security** | `/security` | Incident management, crowd monitoring, emergency dispatch |
| **Volunteer** | `/volunteer` | Task assignment, shift scheduling, incident reporting |
| **Operator** | `/operator` | Facility monitoring, live system status |
| **Accessibility** | `/accessibility` | Accessibility services, wayfinding, assistance requests |

---

## 🤖 Gen AI Usage (Mandatory Disclosure)

> **Challenge 4 Requirement:** It is mandatory to use Gen AI. Below is a full accounting of every Gen AI touchpoint in this project.

### AI Tools Used

| Tool | Purpose |
|---|---|
| **Google Gemini** (via Antigravity IDE) | Primary development assistant — architecture design, code generation, debugging, refactoring, SQL schema generation, security auditing |
| **Google Gemini / Generative AI API** | In-app AI Command Center — crowd intelligence, incident recommendations, operational predictions |

### Where Gen AI Was Applied

#### 1. Architecture & Design
- Designed the multi-role App Router architecture with role-based middleware routing
- Suggested the Provider pattern for AuthProvider + AppContext separation
- Recommended the Supabase trigger-based profile creation pattern

#### 2. Code Generation
- Generated the entire database schema (SQL — see `/supabase/`)
- Scaffolded all 6 role-specific dashboard components
- Generated Supabase RLS policies for all tables
- Generated the authentication flow (register → verify → login → role-redirect)

#### 3. In-App GenAI Feature (AI Command Center — `/ai`)
The AI Command Center (`components/pages/AICommandCenter.tsx`) demonstrates real GenAI integration:
- **Crowd Risk Analysis** — AI detects crowd density anomalies and recommends gate changes
- **Operational Recommendations** — GenAI generates actionable stadium management suggestions with confidence scores
- **Pulse AI Chat** — Natural language interface for operational queries
- **Predictive Analytics** — AI forecasts attendance, queue lengths, and incident probability

#### 4. Debugging & QA
- Used to identify and fix registration flow errors (`{}` serialization bug)
- Used to audit and fix authentication race conditions
- Used to detect and remediate security issues (sensitive data in cookies, hardcoded IPs)

#### 5. Database Design
- Generated all 8 SQL migration files under `/supabase/`
- Designed RLS policies for multi-tenant data isolation
- Generated database functions (`handle_new_user`, `handle_updated_at`, etc.)

#### 6. Testing & Optimization
- Suggested TypeScript strict mode improvements
- Generated the accessibility audit and WCAG compliance review
- Identified unused dependencies and optimized bundle size

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI**: [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + custom design tokens
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **Component Library**: [Radix UI](https://www.radix-ui.com/) primitives
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com/) project

### 1. Clone the Repository

```bash
git clone https://github.com/babluprajapatii/stadiumpluse-ai.git
cd stadiumpluse-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> Find these in your Supabase dashboard under **Project Settings → API**.

### 4. Set Up the Database

Run the SQL files in your Supabase SQL editor **in order**:

```
supabase/01_types.sql        # Enums
supabase/02_tables.sql       # Tables, PKs, FKs, constraints
supabase/03_indexes.sql      # Performance indexes
supabase/04_policies.sql     # Row Level Security policies
supabase/05_functions.sql    # PostgreSQL functions
supabase/06_triggers.sql     # Database triggers
supabase/07_seed.sql         # Optional seed data
```

Or run the combined file:

```
supabase/database_setup.sql  # All-in-one idempotent setup
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
stadiumpluse-ai/
├── app/                          # Next.js App Router pages
│   ├── (dashboard)/              # Protected role dashboards
│   │   ├── fan/                  # Fan portal
│   │   ├── organizer/            # Organizer dashboard
│   │   ├── security/             # Security dashboard
│   │   ├── volunteer/            # Volunteer portal
│   │   ├── operator/             # Operator dashboard
│   │   ├── accessibility/        # Accessibility hub
│   │   ├── ai/                   # AI Command Center
│   │   ├── notifications/        # Notification center
│   │   ├── profile/              # User profile
│   │   └── settings/             # User settings
│   ├── login/                    # Sign in page
│   ├── register/                 # Sign up page
│   ├── forgot-password/          # Password reset request
│   ├── reset-password/           # Password reset form
│   ├── verify-email/             # Email verification
│   └── layout.tsx                # Root layout with providers
├── components/
│   ├── layout/                   # AppShell, Sidebar
│   ├── pages/                    # Full-page components
│   ├── shared/                   # Reusable shared components
│   ├── ui/                       # Base UI primitives (Radix UI wrappers)
│   └── widgets/                  # Chart and data widget components
├── lib/
│   ├── supabase.ts               # Supabase client singleton
│   └── api.ts                    # HTTP API client utility
├── providers/
│   ├── AuthProvider.tsx          # Authentication context
│   └── AppContext.tsx            # App-wide state (emergency, accessibility)
├── services/
│   ├── auth.ts                   # AuthService (register, login, logout, etc.)
│   ├── ai.ts                     # AIService (recommendations, chat)
│   ├── notifications.ts          # NotificationsService
│   ├── settings.ts               # SettingsService
│   └── stadium.ts                # Stadium data service
├── styles/
│   └── theme.css                 # CSS custom properties, dark mode, accessibility
├── supabase/                     # Database SQL files
├── types/
│   └── index.ts                  # Global type definitions
├── proxy.ts                      # Next.js 16 middleware (routing, security headers)
└── next.config.ts                # Next.js configuration
```

---

## 🔐 Security

- **Row Level Security (RLS)** enabled on all Supabase tables
- **Role-based routing** enforced at the middleware level (`proxy.ts`)
- **Security headers** added to every response: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`
- **Minimal cookie payload** — only the user role is stored in the middleware cookie (not sensitive profile data)
- **Environment variables** — all secrets are stored in `.env.local` (never committed)
- **No `SELECT *`** — all Supabase queries use explicit column selection
- **Production console suppression** — `console.log` is removed in production builds; `console.error` is retained

---

## ♿ Accessibility

StadiumPulse AI targets **WCAG 2.2 AA** compliance:

- Semantic HTML throughout (landmarks: `<nav>`, `<main>`, `<aside>`, `<footer>`)
- All interactive elements have `aria-label` or accessible text
- Focus-visible styles on all keyboard-navigable elements
- `aria-hidden="true"` on decorative icons
- `aria-current="page"` on active navigation items
- `aria-expanded` on collapsible navigation
- `role="alert"` on error messages
- High-contrast mode and reduced-motion support via CSS custom properties
- Font size scaling (small/medium/large) via user settings
- Touch targets meet 44×44px minimum
- Mobile-responsive design throughout

---

## 🗄️ Database Schema

### Tables

| Table | Purpose |
|---|---|
| `profiles` | User profile data (role, name, contact info) |
| `settings` | Per-user UI and notification preferences |
| `notifications` | In-app notification messages |
| `activity_logs` | Audit trail for login, logout, profile changes |

### Key Patterns

- **Trigger-based profile creation**: `handle_new_user()` creates a profile row automatically when a user signs up via Supabase Auth
- **Automatic timestamps**: `handle_updated_at()` keeps `updated_at` accurate on every table
- **Soft verification**: `is_verified` field tracks email confirmation status
- **Expired notification cleanup**: `cleanup_expired_notifications()` function removes stale notifications

---

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler check
```

---

## 🌐 Deployment

The project is ready for deployment on:

- **[Vercel](https://vercel.com/)** (recommended — zero-config Next.js)
- **[Netlify](https://netlify.com/)**
- Any Node.js hosting provider

Set the following environment variables on your hosting platform:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📄 License

MIT © 2026 StadiumPulse AI
