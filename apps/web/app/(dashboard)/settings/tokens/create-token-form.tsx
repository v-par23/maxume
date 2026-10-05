"use client"

import { useActionState } from "react"
import { createCliToken, type CreateTokenState } from "@/lib/actions/cli-tokens"

const initialState: CreateTokenState = {}

export function CreateTokenForm() {
  const [state, formAction, pending] = useActionState(createCliToken, initialState)

  if (state.rawToken) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
          Copy this token now — it won&apos;t be shown again.
        </p>
        <code className="break-all rounded bg-white px-3 py-2 text-sm dark:bg-neutral-900">
          {state.rawToken}
        </code>
        <p className="text-xs text-amber-800 dark:text-amber-300">
          Run <code>maxume login</code> and paste it in when prompted.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Token name
        </span>
        <input
          name="name"
          required
          placeholder="My laptop"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Creating…" : "Create token"}
      </button>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  )
}
