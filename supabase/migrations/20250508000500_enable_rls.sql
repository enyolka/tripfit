-- Migration: Enable RLS policies
-- Description: Enables RLS and creates policies for all tables
-- Author: Copilot
-- Date: 2025-05-05

-- Enable RLS on all tables
alter table public.preferences enable row level security;
alter table public.journeys enable row level security;
alter table public.generations enable row level security;
alter table public.generation_error_logs enable row level security;

-- Create policies for preferences table
create policy "Users can view their own preferences"
    on public.preferences
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
    on public.preferences
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
    on public.preferences
    for update
    using (auth.uid() = user_id);

-- Create policies for journeys table
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

-- Create policies for generations table
create policy "Users can view generations for their journeys"
    on public.generations
    for select
    using (
        exists (
            select 1 from public.journeys
            where journeys.id = generations.journey_id
            and journeys.user_id = auth.uid()
        )
    );

create policy "Users can create generations for their journeys"
    on public.generations
    for insert
    with check (
        exists (
            select 1 from public.journeys
            where journeys.id = journey_id
            and journeys.user_id = auth.uid()
        )
    );

create policy "Users can update generations for their journeys"
    on public.generations
    for update
    using (
        exists (
            select 1 from public.journeys
            where journeys.id = generations.journey_id
            and journeys.user_id = auth.uid()
        )
    );

create policy "Users can delete generations for their journeys"
    on public.generations
    for delete
    using (
        exists (
            select 1 from public.journeys
            where journeys.id = generations.journey_id
            and journeys.user_id = auth.uid()
        )
    );

-- Create policies for generation_error_logs table
create policy "Users can view their own error logs"
    on public.generation_error_logs
    for select
    using (
        exists (
            select 1 from public.journeys
            where journeys.id = generation_error_logs.journey_id
            and journeys.user_id = auth.uid()
        )
    );

create policy "Users can create error logs for their journeys"
    on public.generation_error_logs
    for insert
    with check (
        exists (
            select 1 from public.journeys
            where journeys.id = journey_id
            and journeys.user_id = auth.uid()
        )
    );