-- Migration: Create generations table
-- Description: Creates the generations table for storing AI-generated travel plans
-- Author: Copilot
-- Date: 2025-05-05

-- Create generations table
create table if not exists public.generations (
    id bigserial primary key,
    journey_id bigserial not null references public.journeys(id) on delete cascade,
    model varchar not null,
    generated_text text not null,
    edited_text text,
    status varchar(20) not null check (status in ('generated', 'accepted_unedited', 'accepted_edited', 'rejected')) default 'generated',
    source_text_hash text not null,
    source_text_length integer not null,
    created_at timestamptz not null default now(),
    edited_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_generations_journey_id on public.generations(journey_id);
create index if not exists idx_generations_status on public.generations(status);
create index if not exists idx_generations_created_at on public.generations(created_at);

-- Add comments
comment on table public.generations is 'AI-generated travel plans';
comment on column public.generations.id is 'Unique identifier for the generation';
comment on column public.generations.journey_id is 'References the journey this generation belongs to';
comment on column public.generations.model is 'The AI model used for generation';
comment on column public.generations.generated_text is 'The original AI-generated plan text';
comment on column public.generations.edited_text is 'Optional edited version of the plan';
comment on column public.generations.status is 'Current status of the generation (generated/accepted_unedited/accepted_edited/rejected)';
comment on column public.generations.source_text_hash is 'Hash of the source text used for generation';
comment on column public.generations.source_text_length is 'Length of the source text used for generation';
comment on column public.generations.created_at is 'When the generation was created';
comment on column public.generations.edited_at is 'When the generation was last edited';