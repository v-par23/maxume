"use client"

import { useActionState, type ReactNode } from "react"
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile"
import type { Tables } from "@maxume/db"

const initialState: ProfileFormState = {}

export function ProfileForm({ profile }: { profile: Tables<"profiles"> }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field label="Slug (used in your portfolio URL: /u/your-slug)">
        <input name="slug" defaultValue={profile.slug} required className={inputClass} />
      </Field>
      <Field label="Full name">
        <input name="full_name" defaultValue={profile.full_name} className={inputClass} />
      </Field>
      <Field label="Headline">
        <input
          name="headline"
          defaultValue={profile.headline ?? ""}
          placeholder="Senior Software Engineer"
          className={inputClass}
        />
      </Field>
      <Field label="Bio">
        <textarea name="bio" defaultValue={profile.bio ?? ""} rows={4} className={inputClass} />
      </Field>
      <Field label="Location">
        <input name="location" defaultValue={profile.location ?? ""} className={inputClass} />
      </Field>
      <Field label="Contact email">
        <input
          name="contact_email"
          type="email"
          defaultValue={profile.contact_email ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Portfolio visibility">
        <select
          name="portfolio_visibility"
          defaultValue={profile.portfolio_visibility}
          className={inputClass}
        >
          <option value="private">Private (only you)</option>
          <option value="unlisted">Unlisted (link only, no indexing)</option>
          <option value="public">Public</option>
        </select>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Saved.</p>
      )}
    </form>
  )
}

const inputClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      {children}
    </label>
  )
}
