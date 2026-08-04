create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

revoke all on table public.app_state from anon, authenticated;

comment on table public.app_state is
  'Server-only state for TransporteAluno. Access is restricted to the Supabase service role.';

