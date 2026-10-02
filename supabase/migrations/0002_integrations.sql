-- Connected OAuth accounts, BYOK LLM keys, and CLI personal access tokens.
-- Secret values are never stored in these tables directly — only a pointer
-- (uuid) to a Supabase Vault secret, whose ciphertext lives in vault.secrets
-- and is only readable via vault.decrypted_secrets inside trusted backend code.

create table connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  provider text not null check (provider in ('github', 'linkedin', 'twitter')),
  provider_user_id text not null,
  provider_username text,
  access_token_secret_id uuid not null,
  refresh_token_secret_id uuid,
  scopes text[] not null default '{}',
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, provider)
);
create trigger connected_accounts_set_updated_at before update on connected_accounts
  for each row execute function set_updated_at();

create table llm_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  provider text not null default 'anthropic',
  api_key_secret_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);
create trigger llm_api_keys_set_updated_at before update on llm_api_keys
  for each row execute function set_updated_at();

create table cli_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  token_prefix text not null,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
