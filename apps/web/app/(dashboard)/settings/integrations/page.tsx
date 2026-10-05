import { requireCurrentProfile } from "@/lib/current-profile"
import { disconnectGithub } from "@/lib/actions/connected-accounts"

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const { supabase, user } = await requireCurrentProfile()
  const params = await searchParams

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("provider_username, scopes, connected_at")
    .eq("user_id", user.id)
    .eq("provider", "github")
    .maybeSingle()

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Connect accounts the agent can push updates to.
        </p>
      </div>

      {params.connected && (
        <p className="text-sm text-green-600 dark:text-green-400">GitHub connected.</p>
      )}
      {params.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Couldn&apos;t connect GitHub: {params.error}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-neutral-900 dark:text-neutral-100">GitHub</h2>
          {account ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
              Connected
            </span>
          ) : (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-900">
              Not connected
            </span>
          )}
        </div>

        {account ? (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Connected as{" "}
              <span className="font-medium">@{account.provider_username}</span>
            </p>
            <p className="text-xs text-neutral-500">Scopes: {account.scopes.join(", ")}</p>
            <p className="text-xs text-neutral-500">
              The agent can update your profile README (your {account.provider_username}/
              {account.provider_username} repo).
            </p>
            <form action={disconnectGithub}>
              <button
                type="submit"
                className="w-fit rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                Disconnect
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Lets the agent update your GitHub profile README when something changes.
            </p>
            <a
              href="/api/v1/connected-accounts/github/start"
              className="w-fit rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Connect GitHub
            </a>
          </>
        )}
      </div>
    </div>
  )
}
