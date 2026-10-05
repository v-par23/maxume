import { requireCurrentProfile } from "@/lib/current-profile"
import { revokeCliToken } from "@/lib/actions/cli-tokens"
import { CreateTokenForm } from "./create-token-form"

export default async function TokensPage() {
  const { supabase, user } = await requireCurrentProfile()
  const { data: tokens } = await supabase
    .from("cli_tokens")
    .select("id, name, token_prefix, created_at, last_used_at, revoked_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          CLI tokens
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Personal access tokens for the <code>maxume</code> CLI. Run{" "}
          <code>maxume login</code> and paste one in.
        </p>
      </div>

      <CreateTokenForm />

      <ul className="flex flex-col gap-2">
        {tokens?.map((token) => (
          <li
            key={token.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {token.name}{" "}
                {token.revoked_at && (
                  <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-900">
                    Revoked
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-neutral-500">{token.token_prefix}…</span>
              <span className="text-xs text-neutral-400">
                Created {new Date(token.created_at).toLocaleDateString()}
                {token.last_used_at &&
                  ` · Last used ${new Date(token.last_used_at).toLocaleDateString()}`}
              </span>
            </div>
            {!token.revoked_at && (
              <form action={revokeCliToken}>
                <input type="hidden" name="id" value={token.id} />
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Revoke
                </button>
              </form>
            )}
          </li>
        ))}
        {tokens?.length === 0 && (
          <p className="text-sm text-neutral-500">No tokens yet.</p>
        )}
      </ul>
    </div>
  )
}
