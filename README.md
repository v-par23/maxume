# maxume

Tell an AI agent once — "I got promoted", "I shipped a new project" — and it keeps your
resume, portfolio website, and GitHub profile in sync.

## Status

Phase A (of the v1 build plan) is done: monorepo scaffold, Supabase schema + RLS, auth,
and manual dashboard CRUD for profile/work history/projects/skills. The agent (propose →
confirm → apply), resume generation, public portfolio rendering, GitHub sync, and CLI are
not built yet.

## Monorepo layout

```
apps/
  web/      Next.js app — dashboard, auth, and (later) the agent + public portfolio pages
  cli/      (not yet built)
packages/
  db/       Supabase client helpers + generated types
  ...       (schemas, agent-core, integrations, resume-*, portfolio-templates: not yet built)
supabase/
  migrations/
```

## Local development

Requires [pnpm](https://pnpm.io), [Docker](https://www.docker.com) (for local Supabase),
and the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

```bash
pnpm install
supabase start          # spins up local Postgres/Auth/Storage; prints local keys
cp apps/web/.env.local.example apps/web/.env.local   # fill in from the `supabase start` output
pnpm --filter @maxume/web dev
```

After changing a migration under `supabase/migrations/`, run `supabase db reset` then
regenerate types: `supabase gen types typescript --local > packages/db/src/types.generated.ts`.
