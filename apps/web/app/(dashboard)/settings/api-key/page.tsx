import { requireCurrentProfile } from "@/lib/current-profile"
import { ApiKeyForm } from "./api-key-form"

export default async function ApiKeySettingsPage() {
  const { supabase, user } = await requireCurrentProfile()
  const [{ data: hasAnthropicKey }, { data: hasOpenaiKey }] = await Promise.all([
    supabase.rpc("has_llm_api_key", { p_user_id: user.id, p_provider: "anthropic" }),
    supabase.rpc("has_llm_api_key", { p_user_id: user.id, p_provider: "openai" }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          API key
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Maxume uses your own API key to run the agent (bring-your-own-key) — this
          keeps your usage and cost entirely yours. Add either Anthropic or OpenAI (if
          both are saved, Anthropic is used).
        </p>
      </div>
      <ApiKeyForm provider="anthropic" hasKey={Boolean(hasAnthropicKey)} />
      <ApiKeyForm provider="openai" hasKey={Boolean(hasOpenaiKey)} />
    </div>
  )
}
