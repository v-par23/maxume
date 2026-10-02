-- Core profile, work history, projects, skills, resume versions.

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text unique not null,
  full_name text not null default '',
  headline text,
  bio text,
  location text,
  contact_email text,
  avatar_url text,
  portfolio_theme text not null default 'minimal',
  theme_config jsonb not null default '{}'::jsonb,
  portfolio_visibility text not null default 'private'
    check (portfolio_visibility in ('public', 'unlisted', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table work_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  company text not null,
  title text not null,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text,
  highlights text[] not null default '{}',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index work_history_user_order_idx on work_history (user_id, display_order);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  slug text not null,
  name text not null,
  summary text,
  description text,
  role text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  tech_stack text[] not null default '{}',
  links jsonb not null default '{}'::jsonb,
  highlights text[] not null default '{}',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);
create index projects_user_order_idx on projects (user_id, display_order);

create table skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  category text not null default 'other'
    check (category in ('language', 'framework', 'tool', 'platform', 'soft_skill', 'other')),
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table resume_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  version_number int not null,
  template_id text not null default 'classic',
  data_snapshot jsonb not null,
  pdf_storage_path text not null,
  is_active boolean not null default false,
  generated_by_run_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, version_number)
);

-- Keep updated_at current on row updates.
create function set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger work_history_set_updated_at before update on work_history
  for each row execute function set_updated_at();
create trigger projects_set_updated_at before update on projects
  for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up, so every
-- authenticated user always has exactly one profiles row to build on.
create function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, slug, full_name)
  values (
    new.id,
    'u-' || substr(replace(new.id::text, '-', ''), 1, 10),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
