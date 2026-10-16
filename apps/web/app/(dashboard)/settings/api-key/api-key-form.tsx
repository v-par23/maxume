"use client"

import { useActionState } from "react"
import { saveLlmApiKey, type LlmKeyFormState } from "@/lib/actions/llm-key"

const initialState: LlmKeyFormState = {}

const PROVIDER_LABELS: Record<string, { label: string; placeholder: string }> = {
  anthropic: { label: "Anthropic API key", placeholder: "sk-ant-..." },
  openai: { label: "OpenAI API key", placeholder: "sk-..." },
}

export function ApiKeyForm({
  provider,
  hasKey,
}: {
  provider: "anthropic" | "openai"
  hasKey: boolean
}) {
  const [state, formAction, pending] = useActionState(saveLlmApiKey, initialState)
  const { label, placeholder } = PROVIDER_LABELS[provider]

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-3">
      <input type="hidden" name="provider" value={provider} />
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
        <input
          name="api_key"
          type="password"
          placeholder={hasKey ? "Enter a new key to replace the saved one" : placeholder}
          required
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Saving…" : hasKey ? "Replace key" : "Save key"}
      </button>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600 dark:text-green-400">Saved.</p>}
    </form>
  )
}
