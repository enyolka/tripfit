-- Migration: Create journeys table
-- Description: Creates the journeys table for storing travel plans
-- Author: Copilot
-- Date: 2025-04-17

-- Create journeys table
create table if not exists public.journeys (
    id bigserial primary key,
    destination varchar not null,
    departure_date date not null,
    return_date date not null,
    activities varchar,
    additional_notes text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_ids bigint[] default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint valid_dates check (departure_date <= return_date)
);

-- Enable Row Level Security
alter table public.journeys enable row level security;

-- Create policies for authenticated users
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

-- Create indexes
create index if not exists journeys_user_id_idx on public.journeys(user_id);
create index if not exists journeys_generation_ids_idx on public.journeys using gin (generation_ids);

-- Add comments
comment on table public.journeys is 'Travel journey plans created by users';
comment on column public.journeys.id is 'Unique identifier for the journey';
comment on column public.journeys.destination is 'Travel destination location';
comment on column public.journeys.departure_date is 'Journey start date';
comment on column public.journeys.return_date is 'Journey end date';
comment on column public.journeys.activities is 'Preferred activities for this journey';
comment on column public.journeys.additional_notes is 'Additional journey notes and requirements';
comment on column public.journeys.user_id is 'References auth.users.id of the journey owner';
comment on column public.journeys.generation_ids is 'Array of associated AI generation IDs';
comment on column public.journeys.created_at is 'Timestamp when the journey was created';
comment on column public.journeys.updated_at is 'Timestamp when the journey was last updated';