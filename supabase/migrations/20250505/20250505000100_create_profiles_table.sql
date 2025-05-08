-- Migration: Create profiles table
-- Description: Creates the profiles table for storing user preferences and fitness levels
-- Author: Copilot
-- Date: 2025-05-05

-- Create profiles table
create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    preferences jsonb not null default '{}'::jsonb,
    level integer not null check (level between 1 and 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);

-- Add comments
comment on table public.profiles is 'User profiles containing preferences and fitness level';
comment on column public.profiles.user_id is 'References auth.users.id';
comment on column public.profiles.level is 'User fitness level (1-5)';
comment on column public.profiles.created_at is 'When the profile was created';
comment on column public.profiles.updated_at is 'When the profile was last updated';