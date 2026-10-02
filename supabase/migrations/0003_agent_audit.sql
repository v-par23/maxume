-- Agent run audit log and the propose/confirm/apply change-set items.
-- The LLM only ever writes change_set_items rows (via tool calls); a separate
-- apply-executor performs the actual external/DB mutations once a human confirms.

create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  source text not null check (source in ('web', 'cli')),
  input_message text not null,
  llm_model text not null,
  status text not null default 'proposed'
    check (status in (
      'proposed', 'confirmed', 'applying', 'applied',
      'partially_applied', 'rejected', 'failed', 'expired'
    )),
  assistant_summary text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  applied_at timestamptz
);
create index agent_runs_user_created_idx on agent_runs (user_id, created_at desc);

create table change_set_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs (id) on delete cascade,
  target text not null check (target in ('profile', 'job', 'project', 'skill', 'resume', 'github_readme')),
  action text not null check (action in ('create', 'update', 'delete')),
  target_id uuid,
  payload jsonb not null,
  diff_summary text not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected', 'applying', 'applied', 'failed')),
  error text,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);
create index change_set_items_run_idx on change_set_items (run_id);

alter table resume_versions
  add constraint resume_versions_run_fk foreign key (generated_by_run_id) references agent_runs (id);
