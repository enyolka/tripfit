-- Migration: Create preferences table
-- Description: Creates the preferences table for storing user preferences and fitness levels
-- Author: Copilot
-- Date: 2025-05-05

-- Drop the old preferences table if it exists
drop table if exists public.preferences;

-- Create preferences table
create table if not exists public.preferences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    activity_name varchar not null,
    level integer not null check (level between 1 and 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_preferences_user_id on public.preferences(user_id);

-- Add comments
comment on table public.preferences is 'User preferences containing activity types and fitness levels';
comment on column public.preferences.id is 'Unique identifier for the preference';
comment on column public.preferences.user_id is 'References auth.users.id';
comment on column public.preferences.activity_name is 'Name of the preferred activity';
comment on column public.preferences.level is 'User fitness level for this activity (1-5)';
comment on column public.preferences.created_at is 'When the preference was created';
comment on column public.preferences.updated_at is 'When the preference was last updated';