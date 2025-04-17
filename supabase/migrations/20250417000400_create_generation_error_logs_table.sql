-- Migration: Create generation_error_logs table
-- Description: Creates the generation_error_logs table for tracking AI generation errors
-- Author: Copilot
-- Date: 2025-04-17

-- Create generation_error_logs table
create table if not exists public.generation_error_logs (
    id bigserial primary key,
    journey_id bigint not null references public.journeys(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
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
create policy "Users can view their own error logs"
    on public.generation_error_logs
    for select
    using (auth.uid() = user_id);

create policy "Users can create error logs for their journeys"
    on public.generation_error_logs
    for insert
    with check (auth.uid() = user_id);

-- Note: Update and delete policies are not needed as error logs should be immutable

-- Create indexes
create index if not exists generation_error_logs_journey_id_idx on public.generation_error_logs(journey_id);
create index if not exists generation_error_logs_user_id_idx on public.generation_error_logs(user_id);
create index if not exists generation_error_logs_error_timestamp_idx on public.generation_error_logs(error_timestamp);

-- Add comments
comment on table public.generation_error_logs is 'Error logs for AI generation attempts';
comment on column public.generation_error_logs.id is 'Unique identifier for the error log';
comment on column public.generation_error_logs.journey_id is 'References the journey where the error occurred';
comment on column public.generation_error_logs.user_id is 'References auth.users.id of the user who experienced the error';
comment on column public.generation_error_logs.model is 'The AI model that generated the error';
comment on column public.generation_error_logs.source_text_hash is 'Hash of the source text that caused the error';
comment on column public.generation_error_logs.source_text_length is 'Length of the source text that caused the error';
comment on column public.generation_error_logs.error_code is 'Error code for categorization';
comment on column public.generation_error_logs.error_message is 'Detailed error message';
comment on column public.generation_error_logs.error_timestamp is 'Timestamp when the error occurred';