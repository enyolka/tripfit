-- Migration: Create profiles table
-- Description: Creates the profiles table with user preferences and level, references auth.users
-- Author: Copilot
-- Date: 2025-04-17

-- Create profiles table
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    preferences varchar not null,
    level integer not null check (level between 1 and 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for authenticated users
create policy "Users can view their own profile"
    on public.profiles
    for select
    using (auth.uid() = id);

create policy "Users can insert their own profile"
    on public.profiles
    for insert
    with check (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles
    for update
    using (auth.uid() = id);

-- Create indexes
create index if not exists profiles_id_idx on public.profiles(id);

-- Add comments
comment on table public.profiles is 'User profiles containing preferences and fitness level';
comment on column public.profiles.id is 'References the auth.users.id this profile belongs to';
comment on column public.profiles.preferences is 'User preferences for activities and travel';
comment on column public.profiles.level is 'User fitness level from 1 to 5';
comment on column public.profiles.created_at is 'Timestamp when the profile was created';
comment on column public.profiles.updated_at is 'Timestamp when the profile was last updated';