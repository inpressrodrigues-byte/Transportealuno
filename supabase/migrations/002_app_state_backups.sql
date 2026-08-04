create table if not exists public.app_state_backups (
  id bigint generated always as identity primary key,
  state_id text not null,
  payload jsonb not null,
  reason text not null check (reason in ('daily', 'manual', 'before_reset')),
  backup_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists app_state_backups_state_date_idx
  on public.app_state_backups (state_id, backup_date desc);

alter table public.app_state_backups enable row level security;

revoke all on table public.app_state_backups from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, delete on table public.app_state_backups to service_role;
grant usage, select on sequence public.app_state_backups_id_seq to service_role;

comment on table public.app_state_backups is
  'Daily and pre-reset snapshots created by TransporteAluno. Server access only.';
