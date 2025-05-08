-- Migration: Create generation_error_logs table
-- Description: Creates the generation_error_logs table for storing AI generation errors
-- Author: Copilot
-- Date: 2025-05-05

-- Create generation_error_logs table
create table if not exists public.generation_error_logs (
    id bigserial primary key,
    journey_id bigserial not null references public.journeys(id) on delete cascade,
    model varchar not null,
    source_text_hash text not null,
    source_text_length integer not null,
    error_code varchar(100) not null,
    error_message text not null,
    error_timestamp timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_generation_error_logs_journey_id on public.generation_error_logs(journey_id);
create index if not exists idx_generation_error_logs_error_timestamp on public.generation_error_logs(error_timestamp);

-- Add comments
comment on table public.generation_error_logs is 'Logs of AI generation errors';
comment on column public.generation_error_logs.id is 'Unique identifier for the error log';
comment on column public.generation_error_logs.journey_id is 'References the journey this error belongs to';
comment on column public.generation_error_logs.model is 'The AI model that generated the error';
comment on column public.generation_error_logs.source_text_hash is 'Hash of the source text that caused the error';
comment on column public.generation_error_logs.source_text_length is 'Length of the source text that caused the error';
comment on column public.generation_error_logs.error_code is 'Error code from the AI service';
comment on column public.generation_error_logs.error_message is 'Detailed error message';
comment on column public.generation_error_logs.error_timestamp is 'When the error occurred';