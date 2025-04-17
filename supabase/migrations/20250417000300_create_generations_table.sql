-- Migration: Create generations table
-- Description: Creates the generations table for storing AI-generated travel plans
-- Author: Copilot
-- Date: 2025-04-17

-- Create generations table
create table if not exists public.generations (
    id bigserial primary key,
    journey_id bigint not null references public.journeys(id) on delete cascade,
    model varchar not null,
    generated_count integer not null default 0,
    accepted_unedited_count integer not null default 0,
    accepted_edited_count integer not null default 0,
    source_text_hash text not null,
    source_text_length integer not null,
    created_at timestamptz not null default now(),
    edited_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.generations enable row level security;

-- Create policies for authenticated users
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

-- Create indexes
create index if not exists generations_journey_id_idx on public.generations(journey_id);

-- Add comments
comment on table public.generations is 'AI-generated travel plans';
comment on column public.generations.id is 'Unique identifier for the generation';
comment on column public.generations.journey_id is 'References the journey this generation belongs to';
comment on column public.generations.model is 'The AI model used for generation';
comment on column public.generations.generated_count is 'Number of times this plan was generated';
comment on column public.generations.accepted_unedited_count is 'Number of times this plan was accepted without edits';
comment on column public.generations.accepted_edited_count is 'Number of times this plan was accepted with edits';
comment on column public.generations.source_text_hash is 'Hash of the source text used for generation';
comment on column public.generations.source_text_length is 'Length of the source text used for generation';
comment on column public.generations.created_at is 'Timestamp when the generation was created';
comment on column public.generations.edited_at is 'Timestamp when the generation was last edited';