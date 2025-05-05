-- Migration: Re-enable RLS policies
-- Description: Re-enables all RLS policies for profiles, journeys, generations, and generation_error_logs tables
-- Author: Copilot
-- Date: 2025-05-05

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.journeys enable row level security;
alter table public.generations enable row level security;
alter table public.generation_error_logs enable row level security;

-- Recreate policies for profiles table
create policy "Users can view their own profile"
    on public.profiles
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own profile"
    on public.profiles
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own profile"
    on public.profiles
    for update
    using (auth.uid() = user_id);

-- Recreate policies for journeys table
create policy "Users can view their own journeys"
    on public.journeys
    for select
    using (auth.uid() = user_id);

create policy "Users can create their own journeys"
    on public.journeys
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own journeys"
    on public.journeys
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own journeys"
    on public.journeys
    for delete
    using (auth.uid() = user_id);

-- Recreate policies for generations table
create policy "Users can view generations for their journeys"
    on public.generations
    for select
    using (auth.uid() = (select user_id from journeys where id = journey_id));

create policy "Users can create generations for their journeys"
    on public.generations
    for insert
    with check (auth.uid() = (select user_id from journeys where id = journey_id));

create policy "Users can update generations for their journeys"
    on public.generations
    for update
    using (auth.uid() = (select user_id from journeys where id = journey_id));

create policy "Users can delete generations for their journeys"
    on public.generations
    for delete
    using (auth.uid() = (select user_id from journeys where id = journey_id));

-- Recreate policies for generation_error_logs table
create policy "Users can view their own error logs"
    on public.generation_error_logs
    for select
    using (auth.uid() = (select user_id from journeys where id = journey_id));

create policy "Users can create error logs for their journeys"
    on public.generation_error_logs
    for insert
    with check (auth.uid() = (select user_id from journeys where id = journey_id));