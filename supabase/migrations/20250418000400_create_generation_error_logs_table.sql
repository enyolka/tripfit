-- Migration: Create generation_error_logs table
-- Description: Creates the generation_error_logs table for tracking AI generation errors
-- Author: Copilot
-- Date: 2025-04-18

-- Create generation_error_logs table
create table if not exists public.generation_error_logs (
    id uuid primary key default gen_random_uuid(),
    journey_id uuid not null references public.journeys(id) on delete cascade,
    model varchar not null,
    source_text_hash text not null,
    source_text_length integer not null,
    error_code varchar(100) not null,
    error_message text not null,
    error_timestamp timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.generation_error_logs enable row level security;

-- Create policies for authenticated users
create policy "Users can view error logs for their journeys"
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

-- Create indexes
create index if not exists idx_generation_error_logs_journey_id on public.generation_error_logs(journey_id);
create index if not exists idx_generation_error_logs_error_timestamp on public.generation_error_logs(error_timestamp);
create index if not exists idx_generation_error_logs_error_code on public.generation_error_logs(error_code);

-- Add comments
comment on table public.generation_error_logs is 'Logs of errors that occurred during AI plan generation';
comment on column public.generation_error_logs.id is 'Unique identifier for the error log';
comment on column public.generation_error_logs.journey_id is 'References the journey where the error occurred';
comment on column public.generation_error_logs.model is 'The AI model that generated the error';
comment on column public.generation_error_logs.source_text_hash is 'Hash of the source text that caused the error';
comment on column public.generation_error_logs.source_text_length is 'Length of the source text that caused the error';
comment on column public.generation_error_logs.error_code is 'Error code for categorization';
comment on column public.generation_error_logs.error_message is 'Detailed error message';
comment on column public.generation_error_logs.error_timestamp is 'When the error occurred';