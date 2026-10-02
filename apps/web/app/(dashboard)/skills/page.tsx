import { requireCurrentProfile } from "@/lib/current-profile"
import { createSkill, deleteSkill } from "@/lib/actions/skills"

const inputClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"

const CATEGORIES = ["language", "framework", "tool", "platform", "soft_skill", "other"] as const

export default async function SkillsPage() {
  const { supabase, user } = await requireCurrentProfile()
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", user.id)
    .order("category", { ascending: true })

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Skills</h1>

      <ul className="flex flex-wrap gap-2">
        {skills?.map((skill) => (
          <li
            key={skill.id}
            className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-sm dark:border-neutral-800"
          >
            <span>{skill.name}</span>
            <span className="text-xs text-neutral-400">{skill.category}</span>
            <form action={deleteSkill}>
              <input type="hidden" name="id" value={skill.id} />
              <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
                ×
              </button>
            </form>
          </li>
        ))}
        {skills?.length === 0 && (
          <p className="text-sm text-neutral-500">No skills yet — add your first one below.</p>
        )}
      </ul>

      <form
        action={createSkill}
        className="flex items-end gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</span>
          <input name="name" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</span>
          <select name="category" defaultValue="other" className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Add
        </button>
      </form>
    </div>
  )
}
