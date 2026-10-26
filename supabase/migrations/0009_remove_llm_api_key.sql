-- Removes a saved BYOK LLM API key entirely (not just overwriting it with a
-- new value, which is all set_llm_api_key supports). Same pattern as
-- disconnect_connected_account (0008): the authenticated role has no access
-- to the vault schema at all, so a plain row delete on llm_api_keys would
-- leave the stored key's Vault secret permanently orphaned.

create function public.remove_llm_api_key(p_user_id uuid, p_provider text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
begin
  select api_key_secret_id into v_secret_id
  from llm_api_keys
  where user_id = p_user_id and provider = p_provider;

  delete from llm_api_keys where user_id = p_user_id and provider = p_provider;

  if v_secret_id is not null then
    delete from vault.secrets where id = v_secret_id;
  end if;
end;
$$;

revoke all on function public.remove_llm_api_key(uuid, text) from public, anon, authenticated;
grant execute on function public.remove_llm_api_key(uuid, text) to service_role;
