"use client"

import { useState, type FormEvent } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setError(null)

    const supabase = createBrowserSupabaseClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (otpError) {
      setStatus("error")
      setError(otpError.message)
      return
    }
    setStatus("sent")
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Check <span className="font-medium">{email}</span> for a sign-in link.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {status === "sending" ? "Sending link…" : "Send sign-in link"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  )
}
