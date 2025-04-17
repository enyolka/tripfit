-- Migration: Disable RLS policies
-- Description: Disables all RLS policies for profiles, journeys, generations, and generation_error_logs tables
-- Author: Copilot
-- Date: 2025-04-17

-- Drop policies for profiles table
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- Drop policies for journeys table
drop policy if exists "Users can view their own journeys" on public.journeys;
drop policy if exists "Users can create their own journeys" on public.journeys;
drop policy if exists "Users can update their own journeys" on public.journeys;
drop policy if exists "Users can delete their own journeys" on public.journeys;

-- Drop policies for generations table
drop policy if exists "Users can view generations for their journeys" on public.generations;
drop policy if exists "Users can create generations for their journeys" on public.generations;
drop policy if exists "Users can update generations for their journeys" on public.generations;
drop policy if exists "Users can delete generations for their journeys" on public.generations;

-- Drop policies for generation_error_logs table
drop policy if exists "Users can view their own error logs" on public.generation_error_logs;
drop policy if exists "Users can create error logs for their journeys" on public.generation_error_logs;

-- Disable RLS on all tables
alter table public.profiles disable row level security;
alter table public.journeys disable row level security;
alter table public.generations disable row level security;
alter table public.generation_error_logs disable row level security;