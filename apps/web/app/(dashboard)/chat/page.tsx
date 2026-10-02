import { requireCurrentProfile } from "@/lib/current-profile"
import { ChatPanel } from "./chat-panel"

export default async function ChatPage() {
  const { supabase, user } = await requireCurrentProfile()
  const { data: hasKey } = await supabase.rpc("has_llm_api_key", {
    p_user_id: user.id,
    p_provider: "anthropic",
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Agent</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tell it what changed — it proposes updates for you to review before anything is
          applied.
        </p>
      </div>
      <ChatPanel hasApiKey={Boolean(hasKey)} />
    </div>
  )
}
