-- Service-role-only helpers for storing/reading a connected GitHub account's
-- OAuth access token via Supabase Vault. Same locked-down pattern as
-- 0005_vault_functions.sql's LLM key functions, and for the same reason:
-- p_user_id is a plain parameter, not derived from auth.uid().

create function public.set_connected_account_token(
  p_user_id uuid,
  p_provider text,
  p_provider_user_id text,
  p_provider_username text,
  p_access_token text,
  p_scopes text[]
)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_existing_secret_id uuid;
begin
  select access_token_secret_id into v_existing_secret_id
  from connected_accounts
  where user_id = p_user_id and provider = p_provider;

  if v_existing_secret_id is not null then
    perform vault.update_secret(v_existing_secret_id, p_access_token);
    update connected_accounts
    set provider_user_id = p_provider_user_id,
        provider_username = p_provider_username,
        scopes = p_scopes,
        revoked_at = null,
        updated_at = now()
    where user_id = p_user_id and provider = p_provider;
  else
    insert into connected_accounts (
      user_id, provider, provider_user_id, provider_username,
      access_token_secret_id, scopes
    )
    values (
      p_user_id, p_provider, p_provider_user_id, p_provider_username,
      vault.create_secret(p_access_token, p_user_id::text || ':' || p_provider),
      p_scopes
    );
  end if;
end;
$$;

revoke all on function public.set_connected_account_token(uuid, text, text, text, text, text[])
  from public, anon, authenticated;
grant execute on function public.set_connected_account_token(uuid, text, text, text, text, text[])
  to service_role;

create function public.get_decrypted_connected_account_token(p_user_id uuid, p_provider text)
returns table (access_token text, provider_username text)
language sql
security definer
set search_path = public, vault
as $$
  select vs.decrypted_secret, ca.provider_username
  from connected_accounts ca
  join vault.decrypted_secrets vs on vs.id = ca.access_token_secret_id
  where ca.user_id = p_user_id and ca.provider = p_provider and ca.revoked_at is null;
$$;

revoke all on function public.get_decrypted_connected_account_token(uuid, text)
  from public, anon, authenticated;
grant execute on function public.get_decrypted_connected_account_token(uuid, text)
  to service_role;

-- Owner-select RLS on connected_accounts already covers "is it connected?"
-- from the dashboard with the regular user-scoped client. Disconnect must go
-- through a service-role function rather than a plain row delete, though:
-- the authenticated role has no access to the vault schema at all, so a
-- client-side delete can only remove the connected_accounts row, leaving its
-- Vault secret orphaned (and another one created on every reconnect).
create function public.disconnect_connected_account(p_user_id uuid, p_provider text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
begin
  select access_token_secret_id into v_secret_id
  from connected_accounts
  where user_id = p_user_id and provider = p_provider;

  delete from connected_accounts where user_id = p_user_id and provider = p_provider;

  if v_secret_id is not null then
    delete from vault.secrets where id = v_secret_id;
  end if;
end;
$$;

revoke all on function public.disconnect_connected_account(uuid, text)
  from public, anon, authenticated;
grant execute on function public.disconnect_connected_account(uuid, text) to service_role;
