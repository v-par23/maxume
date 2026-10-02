-- Service-role-only helpers for storing/reading the user's BYOK LLM API key
-- via Supabase Vault. Neither function is reachable by the anon/authenticated
-- roles (and therefore not by any client-side call or RLS-governed request) —
-- only backend code using the service-role key may call them. p_user_id is a
-- plain parameter (not derived from auth.uid()), so this restriction is load
-- bearing: without it, any authenticated user could read or overwrite another
-- user's key by passing an arbitrary id.

create function public.set_llm_api_key(p_user_id uuid, p_provider text, p_api_key text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_existing_secret_id uuid;
begin
  select api_key_secret_id into v_existing_secret_id
  from llm_api_keys
  where user_id = p_user_id and provider = p_provider;

  if v_existing_secret_id is not null then
    perform vault.update_secret(v_existing_secret_id, p_api_key);
  else
    insert into llm_api_keys (user_id, provider, api_key_secret_id)
    values (p_user_id, p_provider, vault.create_secret(p_api_key, p_user_id::text || ':' || p_provider));
  end if;
end;
$$;

-- Supabase grants EXECUTE on every new public-schema function to anon/authenticated
-- by default privilege, independently of the PUBLIC pseudo-role — each must be
-- revoked explicitly, or this stays callable by any signed-in (or anonymous) user.
revoke all on function public.set_llm_api_key(uuid, text, text) from public, anon, authenticated;
grant execute on function public.set_llm_api_key(uuid, text, text) to service_role;

create function public.get_decrypted_llm_api_key(p_user_id uuid, p_provider text default 'anthropic')
returns text
language sql
security definer
set search_path = public, vault
as $$
  select vs.decrypted_secret
  from llm_api_keys k
  join vault.decrypted_secrets vs on vs.id = k.api_key_secret_id
  where k.user_id = p_user_id and k.provider = p_provider;
$$;

revoke all on function public.get_decrypted_llm_api_key(uuid, text) from public, anon, authenticated;
grant execute on function public.get_decrypted_llm_api_key(uuid, text) to service_role;

create function public.has_llm_api_key(p_user_id uuid, p_provider text default 'anthropic')
returns boolean
language sql
security invoker
stable
as $$
  select exists (
    select 1 from llm_api_keys where user_id = p_user_id and provider = p_provider
  );
$$;
-- security invoker + the existing owner-only RLS policy on llm_api_keys make
-- this one safe to expose to authenticated callers directly (web settings UI
-- checking "is a key already saved?" without needing the plaintext).
