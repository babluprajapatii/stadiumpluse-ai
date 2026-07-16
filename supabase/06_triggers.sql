-- ============================================================================
-- StadiumPulse AI — 06_triggers.sql
-- Recreate database table triggers and bind them to functions
-- ============================================================================

-- 1. Profiles updated_at trigger
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 2. Settings updated_at trigger
DROP TRIGGER IF EXISTS trg_settings_updated_at ON public.settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 3. Notifications updated_at trigger
DROP TRIGGER IF EXISTS trg_notifications_updated_at ON public.notifications;
CREATE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4. auth.users registration provisioning trigger
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Make sure legacy or duplicate trigger name is dropped and NOT recreated
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_timestamp_profiles ON public.profiles;
DROP TRIGGER IF EXISTS set_timestamp_settings ON public.settings;
DROP TRIGGER IF EXISTS set_timestamp_notifications ON public.notifications;

-- 5. auth.users email confirmed listener trigger
DROP TRIGGER IF EXISTS trg_on_auth_email_confirmed ON auth.users;
CREATE TRIGGER trg_on_auth_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_email_confirmed();
