-- Row Level Security: every table is owner-only (auth.uid() = user_id / id).
-- The service-role key (trusted backend code only: apply-executor, resume
-- renderer, GitHub sync) bypasses RLS by design and is never exposed to clients.

alter table profiles enable row level security;
create policy "profiles_owner_select" on profiles for select using (auth.uid() = id);
create policy "profiles_owner_update" on profiles for update using (auth.uid() = id);
-- No insert/delete policy: rows are created by the handle_new_user trigger
-- (security definer) and deleted via auth.users cascade, never directly by clients.

alter table work_history enable row level security;
create policy "work_history_owner_all" on work_history for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table projects enable row level security;
create policy "projects_owner_all" on projects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table skills enable row level security;
create policy "skills_owner_all" on skills for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table resume_versions enable row level security;
create policy "resume_versions_owner_select" on resume_versions for select
  using (auth.uid() = user_id);
-- Inserts/updates to resume_versions happen only via the service-role apply-executor.

alter table connected_accounts enable row level security;
create policy "connected_accounts_owner_select" on connected_accounts for select
  using (auth.uid() = user_id);
create policy "connected_accounts_owner_delete" on connected_accounts for delete
  using (auth.uid() = user_id);
-- Inserts happen only via the OAuth callback route (service role), never direct client writes.

alter table llm_api_keys enable row level security;
create policy "llm_api_keys_owner_select" on llm_api_keys for select
  using (auth.uid() = user_id);
create policy "llm_api_keys_owner_delete" on llm_api_keys for delete
  using (auth.uid() = user_id);

alter table cli_tokens enable row level security;
create policy "cli_tokens_owner_all" on cli_tokens for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table agent_runs enable row level security;
create policy "agent_runs_owner_select" on agent_runs for select
  using (auth.uid() = user_id);

alter table change_set_items enable row level security;
create policy "change_set_items_owner_select" on change_set_items for select
  using (
    exists (
      select 1 from agent_runs
      where agent_runs.id = change_set_items.run_id
        and agent_runs.user_id = auth.uid()
    )
  );
create policy "change_set_items_owner_update" on change_set_items for update
  using (
    exists (
      select 1 from agent_runs
      where agent_runs.id = change_set_items.run_id
        and agent_runs.user_id = auth.uid()
    )
  );
-- ^ owners can flip pending items to confirmed/rejected during the confirm step;
-- the apply-executor (service role) is what transitions confirmed -> applied/failed.
