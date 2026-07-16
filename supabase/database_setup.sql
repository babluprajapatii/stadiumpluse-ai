-- ============================================================================
-- StadiumPulse AI — database_setup.sql
-- Master setup script executing all database schema migrations in order
-- ============================================================================

-- ============================================================================
-- 1. Custom Types (Enums)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('fan', 'volunteer', 'security', 'organizer', 'operator', 'accessibility');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dashboard_type') THEN
    CREATE TYPE public.dashboard_type AS ENUM ('fan', 'volunteer', 'security', 'organizer', 'operator', 'accessibility');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_category') THEN
    CREATE TYPE public.notification_category AS ENUM ('security', 'ai', 'event', 'system', 'emergency', 'account');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority') THEN
    CREATE TYPE public.notification_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refresh_interval_type') THEN
    CREATE TYPE public.refresh_interval_type AS ENUM ('off', '5s', '10s', '30s');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_type') THEN
    CREATE TYPE public.theme_type AS ENUM ('light', 'dark', 'system');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lang_type') THEN
    CREATE TYPE public.lang_type AS ENUM ('en', 'hi');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'font_size_type') THEN
    CREATE TYPE public.font_size_type AS ENUM ('small', 'medium', 'large');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_action') THEN
    CREATE TYPE public.activity_action AS ENUM (
      'LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_RESET', 
      'PROFILE_UPDATED', 'SETTINGS_UPDATED', 'NOTIFICATION_READ', 
      'AI_REQUEST', 'ROLE_CHANGED'
    );
  END IF;
END$$;

-- ============================================================================
-- 2. Database Tables
-- ============================================================================
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES Table (Saves user profiles, linked 1-to-1 to auth.users)
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

-- SETTINGS Table (Saves user-specific UI / Accessibility preferences)
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

-- NOTIFICATIONS Table (Saves alerts, emergency broadcasts, and operational logs)
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

-- ACTIVITY LOGS Table (Saves security logs and operational audits)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  action public.activity_action NOT NULL,
  ip_address INET,
  user_agent TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 3. Query Optimization Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_notifications_unread_priority ON public.notifications(user_id, read_at) WHERE (read_at IS NULL);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON public.notifications(expires_at) WHERE (expires_at IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON public.activity_logs(user_id, action, created_at DESC);

-- ============================================================================
-- 4. Row Level Security (RLS) Configuration
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
CREATE POLICY "Users can select own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Settings Policies
DROP POLICY IF EXISTS "Users can select own settings" ON public.settings;
CREATE POLICY "Users can select own settings" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
CREATE POLICY "Users can insert own settings" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;
CREATE POLICY "Users can update own settings" ON public.settings
  FOR UPDATE WITH CHECK (auth.uid() = user_id);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
CREATE POLICY "Users can select own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Activity Logs Policies
DROP POLICY IF EXISTS "Users can select own activity logs" ON public.activity_logs;
CREATE POLICY "Users can select own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
CREATE POLICY "Users can insert own activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. Trigger Functions & Database Logic
-- ============================================================================
-- Automatically Set Updated Timestamp Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Automated User Provisioning Function (Auth Signup Hook)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val public.user_role;
BEGIN
  -- Validate and cast metadata role string to enum
  BEGIN
    user_role_val := (coalesce(new.raw_user_meta_data->>'role', 'fan'))::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'fan'::public.user_role;
  END;

  -- Create public profile row
  INSERT INTO public.profiles (id, name, email, role, is_verified)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Anonymous User'),
    new.email,
    user_role_val,
    coalesce((new.email_confirmed_at IS NOT NULL), false)
  );

  -- Create public setting options defaults mapping row
  INSERT INTO public.settings (user_id, default_dashboard)
  VALUES (
    new.id,
    user_role_val::text::public.dashboard_type
  );

  -- Create welcome notification row
  INSERT INTO public.notifications (user_id, type, title, message, priority)
  VALUES (
    new.id,
    'system',
    'Welcome to StadiumPulse AI!',
    'Your account has been created successfully. Explore real-time operational feeds and GenAI assistant support.',
    'MEDIUM'
  );

  -- Create initial activity log registration audit row
  INSERT INTO public.activity_logs (user_id, action, ip_address, user_agent)
  VALUES (
    new.id,
    'REGISTER',
    '127.0.0.1'::inet,
    'System Provisioning'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Email Confirmed Verification Status Trigger Function
CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF new.email_confirmed_at IS NOT NULL AND (old.email_confirmed_at IS NULL OR new.email_confirmed_at <> old.email_confirmed_at) THEN
    UPDATE public.profiles
    SET is_verified = true
    WHERE id = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expired Notifications Cleanup Utility Function
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Trigger Bindings Setup
-- ============================================================================
-- Profiles updated_at trigger
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Settings updated_at trigger
DROP TRIGGER IF EXISTS trg_settings_updated_at ON public.settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Notifications updated_at trigger
DROP TRIGGER IF EXISTS trg_notifications_updated_at ON public.notifications;
CREATE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- auth.users registration provisioning trigger
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Make sure legacy or duplicate trigger name is dropped and NOT recreated
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_timestamp_profiles ON public.profiles;
DROP TRIGGER IF EXISTS set_timestamp_settings ON public.settings;
DROP TRIGGER IF EXISTS set_timestamp_notifications ON public.notifications;

-- auth.users email confirmed listener trigger
DROP TRIGGER IF EXISTS trg_on_auth_email_confirmed ON auth.users;
CREATE TRIGGER trg_on_auth_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_email_confirmed();

-- ============================================================================
-- 7. Seeds and Grants Setup
-- ============================================================================
-- Grant correct privileges to anon and authenticated roles on tables
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.settings TO anon, authenticated, service_role;
GRANT ALL ON public.notifications TO anon, authenticated, service_role;
GRANT ALL ON public.activity_logs TO anon, authenticated, service_role;

-- Grant correct privileges to enum types
GRANT USAGE ON TYPE public.user_role TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.dashboard_type TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.notification_category TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.notification_priority TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.refresh_interval_type TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.theme_type TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.lang_type TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.font_size_type TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.activity_action TO anon, authenticated, service_role;
