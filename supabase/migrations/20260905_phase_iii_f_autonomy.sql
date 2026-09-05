create extension if not exists vector;

create table if not exists public.world_model_events (
  id uuid primary key default gen_random_uuid(),
  delivery_id text unique,
  event_type text not null,
  repository text not null,
  before_sha text,
  after_sha text,
  ref text,
  changed_files jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'PENDING',
  error text
);

create table if not exists public.world_model_entity_history (
  id uuid primary key default gen_random_uuid(),
  entity_id text not null,
  operation text not null,
  before_state jsonb,
  after_state jsonb,
  evidence jsonb not null default '[]'::jsonb,
  source text not null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.world_model_snapshots (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  model_version text,
  entity_count integer not null default 0,
  edge_count integer not null default 0,
  event_count integer not null default 0,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.world_model_agent_runs (
  id uuid primary key default gen_random_uuid(),
  trigger_event_id uuid references public.world_model_events(id) on delete set null,
  status text not null default 'RUNNING',
  observations jsonb not null default '[]'::jsonb,
  proposed_mutations jsonb not null default '[]'::jsonb,
  committed_mutations jsonb not null default '[]'::jsonb,
  tool_trace jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error text
);

create table if not exists public.world_model_proactive_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  priority text not null default 'normal',
  payload jsonb not null default '{}'::jsonb,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists world_model_events_status_idx on public.world_model_events(status, received_at);
create index if not exists world_model_events_repo_idx on public.world_model_events(repository, received_at desc);
create index if not exists world_model_entity_history_entity_idx on public.world_model_entity_history(entity_id, occurred_at desc);
create index if not exists world_model_proactive_events_pending_idx on public.world_model_proactive_events(acknowledged_at, created_at desc);

alter table public.world_model_events enable row level security;
alter table public.world_model_entity_history enable row level security;
alter table public.world_model_snapshots enable row level security;
alter table public.world_model_agent_runs enable row level security;
alter table public.world_model_proactive_events enable row level security;

create policy "public can read world events" on public.world_model_events for select using (true);
create policy "public can read entity history" on public.world_model_entity_history for select using (true);
create policy "public can read snapshots" on public.world_model_snapshots for select using (true);
create policy "public can read proactive events" on public.world_model_proactive_events for select using (true);
