-- Migration: Create preferences table
-- Description: Creates the preferences table for storing user preferences and fitness levels
-- Author: Copilot
-- Date: 2025-05-05

-- Create preferences table
create table if not exists public.preferences (
    user_id uuid primary key references auth.users(id) on delete cascade,
    preference varchar not null,
    level integer not null check (level between 1 and 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_preferences_user_id on public.preferences(user_id);

-- Add comments
comment on table public.preferences is 'User preferences containing preference type and fitness level';
comment on column public.preferences.user_id is 'References auth.users.id';
comment on column public.preferences.preference is 'User preference type';
comment on column public.preferences.level is 'User fitness level (1-5)';
comment on column public.preferences.created_at is 'When the preference was created';
comment on column public.preferences.updated_at is 'When the preference was last updated';