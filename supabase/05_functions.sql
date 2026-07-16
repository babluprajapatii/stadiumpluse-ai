-- ============================================================================
-- StadiumPulse AI — 05_functions.sql
-- Recreate trigger functions and utility database functions
-- ============================================================================

-- 1. Automatically Set Updated Timestamp Function
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

-- 2. Automated User Provisioning Function (Auth Signup Hook)
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

-- 3. Email Confirmed Verification Status Trigger Function
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

-- 4. Expired Notifications Cleanup Utility Function
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
