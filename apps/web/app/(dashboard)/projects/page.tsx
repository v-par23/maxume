import { requireCurrentProfile } from "@/lib/current-profile"
import { createProject, deleteProject } from "@/lib/actions/projects"

const inputClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"

export default async function ProjectsPage() {
  const { supabase, user } = await requireCurrentProfile()
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true })

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Projects</h1>

      <ul className="flex flex-col gap-3">
        {projects?.map((project) => (
          <li
            key={project.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-50">{project.name}</p>
              {project.summary && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{project.summary}</p>
              )}
              {project.tech_stack.length > 0 && (
                <p className="mt-1 text-xs text-neutral-500">{project.tech_stack.join(" · ")}</p>
              )}
            </div>
            <form action={deleteProject}>
              <input type="hidden" name="id" value={project.id} />
              <button type="submit" className="text-xs text-red-600 hover:underline dark:text-red-400">
                Delete
              </button>
            </form>
          </li>
        ))}
        {projects?.length === 0 && (
          <p className="text-sm text-neutral-500">No projects yet — add your first one below.</p>
        )}
      </ul>

      <form
        action={createProject}
        className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Add a project</h2>
        <input name="name" placeholder="Project name" required className={inputClass} />
        <input name="summary" placeholder="One-line summary" className={inputClass} />
        <textarea name="description" placeholder="Description" rows={3} className={inputClass} />
        <input name="tech_stack" placeholder="Tech stack, comma-separated" className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <input name="repo_url" placeholder="Repo URL" className={inputClass} />
          <input name="live_url" placeholder="Live URL" className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <input type="checkbox" name="is_current" /> Currently working on this
        </label>
        <button
          type="submit"
          className="w-fit rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Add project
        </button>
      </form>
    </div>
  )
}
