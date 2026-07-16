-- ============================================================================
-- StadiumPulse AI — 01_types.sql
-- Recreate custom PostgreSQL enum types idempotently
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
