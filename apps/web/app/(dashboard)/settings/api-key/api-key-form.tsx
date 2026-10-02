"use client"

import { useActionState } from "react"
import { saveLlmApiKey, type LlmKeyFormState } from "@/lib/actions/llm-key"

const initialState: LlmKeyFormState = {}

export function ApiKeyForm({ hasKey }: { hasKey: boolean }) {
  const [state, formAction, pending] = useActionState(saveLlmApiKey, initialState)

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Anthropic API key
        </span>
        <input
          name="api_key"
          type="password"
          placeholder={hasKey ? "Enter a new key to replace the saved one" : "sk-ant-..."}
          required
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"
        />
      </label>
      <p className="text-xs text-neutral-500">
        Stored encrypted (Supabase Vault). Only used server-side to run your agent
        requests — never shown back to you or logged.
      </p>
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
