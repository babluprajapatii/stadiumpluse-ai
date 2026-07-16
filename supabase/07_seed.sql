-- ============================================================================
-- StadiumPulse AI — 07_seed.sql
-- Recreate database seed data and default permissions grants
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
