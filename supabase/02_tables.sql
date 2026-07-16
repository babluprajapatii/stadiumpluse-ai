-- ============================================================================
-- StadiumPulse AI — 02_tables.sql
-- Recreate database tables with constraints, default values, and primary/foreign keys
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (Saves user profiles, linked 1-to-1 to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  role public.user_role NOT NULL DEFAULT 'fan',
  phone TEXT CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$'),
  organization TEXT CHECK (organization IS NULL OR char_length(organization) <= 100),
  bio TEXT CHECK (bio IS NULL OR char_length(bio) <= 300),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. SETTINGS Table (Saves user-specific UI / Accessibility preferences)
CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE PRIMARY KEY,
  theme public.theme_type DEFAULT 'system' NOT NULL,
  language public.lang_type DEFAULT 'en' NOT NULL,
  time_zone TEXT DEFAULT 'UTC' NOT NULL,
  date_format TEXT DEFAULT 'MM/DD/YYYY' NOT NULL,
  email_notifications BOOLEAN DEFAULT true NOT NULL,
  push_notifications BOOLEAN DEFAULT true NOT NULL,
  security_alerts BOOLEAN DEFAULT true NOT NULL,
  ai_recommendations BOOLEAN DEFAULT true NOT NULL,
  match_updates BOOLEAN DEFAULT true NOT NULL,
  emergency_alerts BOOLEAN DEFAULT true NOT NULL,
  high_contrast BOOLEAN DEFAULT false NOT NULL,
  font_size public.font_size_type DEFAULT 'medium' NOT NULL,
  reduced_motion BOOLEAN DEFAULT false NOT NULL,
  screen_reader BOOLEAN DEFAULT false NOT NULL,
  keyboard_nav BOOLEAN DEFAULT false NOT NULL,
  default_dashboard public.dashboard_type DEFAULT 'fan' NOT NULL,
  auto_refresh public.refresh_interval_type DEFAULT '30s' NOT NULL,
  ai_preference TEXT DEFAULT 'concierge' NOT NULL,
  sidebar_collapsed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. NOTIFICATIONS Table (Saves alerts, emergency broadcasts, and operational logs)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  type public.notification_category NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 150),
  message TEXT NOT NULL CHECK (char_length(message) <= 1000),
  priority public.notification_priority DEFAULT 'LOW' NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. ACTIVITY LOGS Table (Saves security logs and operational audits)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  action public.activity_action NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
