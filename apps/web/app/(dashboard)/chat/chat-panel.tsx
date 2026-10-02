"use client"

import { useState, type FormEvent } from "react"
import type { ChangeSetItem, RunStatus } from "./types"

const TARGET_LABELS: Record<string, string> = {
  profile: "Profile",
  job: "Work history",
  project: "Project",
  skill: "Skill",
  resume: "Resume",
  github_readme: "GitHub README",
}

const STATUS_STYLES: Record<string, string> = {
  pending: "text-neutral-500",
  confirmed: "text-blue-600 dark:text-blue-400",
  rejected: "text-neutral-400 line-through",
  applying: "text-amber-600 dark:text-amber-400",
  applied: "text-green-600 dark:text-green-400",
  failed: "text-red-600 dark:text-red-400",
}

export function ChatPanel({ hasApiKey }: { hasApiKey: boolean }) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [runId, setRunId] = useState<string | null>(null)
  const [runStatus, setRunStatus] = useState<RunStatus | null>(null)
  const [summary, setSummary] = useState("")
  const [items, setItems] = useState<ChangeSetItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/api/v1/agent/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.")

      setRunId(data.run_id)
      setSummary(data.summary)
      setItems(data.items)
      setSelected(new Set(data.items.map((i: ChangeSetItem) => i.id)))
      setRunStatus("proposed")
      setMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  async function handleConfirm() {
    if (!runId) return
    setConfirming(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/agent/runs/${runId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_ids: Array.from(selected) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.")
      setRunStatus(data.status)
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setConfirming(false)
    }
  }

  async function handleApply() {
    if (!runId) return
    setApplying(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/agent/runs/${runId}/apply`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.")
      setRunStatus(data.status)
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setApplying(false)
    }
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {!hasApiKey && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          No Anthropic API key saved yet — add one in Settings → API key before sending a
          message.
        </p>
      )}

      <form onSubmit={handleSend} className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`e.g. "I just shipped a new project called Foo, built with Next.js and Supabase"`}
          rows={3}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"
        />
        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="w-fit rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {sending ? "Thinking…" : "Send"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {runId && (
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          {summary && <p className="text-sm text-neutral-700 dark:text-neutral-300">{summary}</p>}

          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">No changes were proposed.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                >
                  {runStatus === "proposed" && (
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      className="mt-0.5"
                    />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      {TARGET_LABELS[item.target] ?? item.target}
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {item.diff_summary}
                    </span>
                    <span className={`text-xs ${STATUS_STYLES[item.status] ?? "text-neutral-500"}`}>
                      {item.status}
                      {item.error ? ` — ${item.error}` : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {runStatus === "proposed" && items.length > 0 && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-fit rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {confirming ? "Confirming…" : `Confirm ${selected.size} selected`}
            </button>
          )}

          {runStatus === "confirmed" && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-fit rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {applying ? "Applying…" : "Apply changes"}
            </button>
          )}

          {(runStatus === "applied" ||
            runStatus === "partially_applied" ||
            runStatus === "failed") && (
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Run {runStatus.replace("_", " ")}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
