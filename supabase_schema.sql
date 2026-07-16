-- ============================================================================
-- StadiumPulse AI — Database Schema Migration
-- Production-Ready Supabase SQL Configuration
-- ============================================================================

-- Enable UUID Extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. Custom Types (Enums)
-- ============================================================================
create type public.user_role as enum ('fan', 'volunteer', 'security', 'organizer', 'operator');
create type public.dashboard_type as enum ('fan', 'volunteer', 'security', 'organizer', 'operator');
create type public.notification_category as enum ('security', 'ai', 'event', 'system', 'emergency', 'account');
create type public.notification_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type public.refresh_interval_type as enum ('off', '5s', '10s', '30s');
create type public.theme_type as enum ('light', 'dark', 'system');
create type public.lang_type as enum ('en', 'hi');
create type public.font_size_type as enum ('small', 'medium', 'large');
create type public.activity_action as enum (
  'LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_RESET', 
  'PROFILE_UPDATED', 'SETTINGS_UPDATED', 'NOTIFICATION_READ', 
  'AI_REQUEST', 'ROLE_CHANGED'
);

-- ============================================================================
-- 2. Database Tables
-- ============================================================================

-- PROFILES Table (Saves user profiles, linked 1-to-1 to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null check (char_length(name) <= 100),
  email text not null unique check (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
  role public.user_role not null default 'fan',
  phone text check (phone is null or phone ~* '^\+?[1-9]\d{1,14}$'),
  organization text check (organization is null or char_length(organization) <= 100),
  bio text check (bio is null or char_length(bio) <= 300),
  avatar_url text,
  is_verified boolean default false not null,
  member_since timestamp with time zone default now() not null,
  last_login timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- SETTINGS Table (Saves user-specific UI / Accessibility preferences)
create table public.settings (
  user_id uuid references public.profiles on delete cascade primary key,
  theme public.theme_type default 'system' not null,
  language public.lang_type default 'en' not null,
  time_zone text default 'UTC' not null,
  date_format text default 'MM/DD/YYYY' not null,
  email_notifications boolean default true not null,
  push_notifications boolean default true not null,
  security_alerts boolean default true not null,
  ai_recommendations boolean default true not null,
  match_updates boolean default true not null,
  emergency_alerts boolean default true not null,
  high_contrast boolean default false not null,
  font_size public.font_size_type default 'medium' not null,
  reduced_motion boolean default false not null,
  screen_reader boolean default false not null,
  keyboard_nav boolean default false not null,
  default_dashboard public.dashboard_type default 'fan' not null,
  auto_refresh public.refresh_interval_type default '30s' not null,
  ai_preference text default 'concierge' not null,
  sidebar_collapsed boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- NOTIFICATIONS Table (Saves alerts, emergency broadcasts, and operational logs)
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  type public.notification_category not null,
  title text not null check (char_length(title) <= 150),
  message text not null check (char_length(message) <= 1000),
  priority public.notification_priority default 'LOW' not null,
  read_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ACTIVITY LOGS Table (Saves security logs and operational audits)
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  action public.activity_action not null,
  ip_address inet not null,
  user_agent text not null,
  metadata jsonb,
  created_at timestamp with time zone default now() not null
);

-- ============================================================================
-- 3. Query Optimization Indexes
-- ============================================================================
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_role on public.profiles(role);
create index idx_notifications_unread_priority on public.notifications(user_id, read_at) where (read_at is null);
create index idx_notifications_expires on public.notifications(expires_at) where (expires_at is not null);
create index idx_activity_logs_user_action on public.activity_logs(user_id, action, created_at desc);

-- ============================================================================
-- 4. Automatically Set Timestamps Trigger setup
-- ============================================================================
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp_profiles
  before update on public.profiles
  for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp_settings
  before update on public.settings
  for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp_notifications
  before update on public.notifications
  for each row execute procedure public.trigger_set_timestamp();

-- ============================================================================
-- 5. Automated User Provisioning Trigger (Auth hook)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role_val public.user_role;
begin
  -- Validate and cast metadata role string to enum
  begin
    user_role_val := (coalesce(new.raw_user_meta_data->>'role', 'fan'))::public.user_role;
  exception when others then
    user_role_val := 'fan'::public.user_role;
  end;

  -- Create public profile
  insert into public.profiles (id, name, email, role, is_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Anonymous User'),
    new.email,
    user_role_val,
    coalesce((new.email_confirmed_at is not null), false)
  );

  -- Create public setting options mapping defaults
  insert into public.settings (user_id, default_dashboard)
  values (
    new.id,
    user_role_val::text::public.dashboard_type
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 6. Row Level Security (RLS) Configuration
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles Policies
create policy "Users can select own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update with check (auth.uid() = id);

-- Settings Policies
create policy "Users can select own settings" on public.settings
  for select using (auth.uid() = user_id);

create policy "Users can insert own settings" on public.settings
  for insert with check (auth.uid() = user_id);

create policy "Users can update own settings" on public.settings
  for update with check (auth.uid() = user_id);

-- Notifications Policies
create policy "Users can select own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update with check (auth.uid() = user_id);

create policy "Users can delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- Activity Logs Policies
create policy "Users can select own activity logs" on public.activity_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own activity logs" on public.activity_logs
  for insert with check (auth.uid() = user_id);
