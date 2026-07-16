-- ============================================================================
-- StadiumPulse AI — 99_verify.sql
-- Run verification script to audit database tables, types, triggers, and functions
-- ============================================================================

-- 1. Table existence audit
SELECT 'Table existence: profiles' as check, COUNT(*) = 1 as passed
FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'
UNION ALL
SELECT 'Table existence: settings' as check, COUNT(*) = 1 as passed
FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'settings'
UNION ALL
SELECT 'Table existence: notifications' as check, COUNT(*) = 1 as passed
FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications'
UNION ALL
SELECT 'Table existence: activity_logs' as check, COUNT(*) = 1 as passed
FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs';

-- 2. RLS audit
SELECT 'RLS Enabled: ' || tablename as check, rowsecurity as passed
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('profiles', 'settings', 'notifications', 'activity_logs');

-- 3. Trigger audit
SELECT 'Trigger Enabled: ' || trigger_name as check, COUNT(*) = 1 as passed
FROM information_schema.triggers 
WHERE event_object_schema = 'public' AND trigger_name IN (
  'trg_profiles_updated_at', 'set_timestamp_profiles',
  'trg_settings_updated_at', 'set_timestamp_settings',
  'trg_notifications_updated_at', 'set_timestamp_notifications'
) OR (event_object_table = 'users' AND trigger_name IN ('trg_on_auth_user_created', 'on_auth_user_created', 'trg_on_auth_email_confirmed'))
GROUP BY trigger_name;

-- 4. Function existence audit
SELECT 'Function existence: ' || routine_name as check, COUNT(*) = 1 as passed
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name IN (
  'handle_updated_at', 'trigger_set_timestamp', 'handle_new_user', 'handle_email_confirmed', 'cleanup_expired_notifications'
)
GROUP BY routine_name;
