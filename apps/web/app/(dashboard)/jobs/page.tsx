import { requireCurrentProfile } from "@/lib/current-profile"
import { createJob, deleteJob } from "@/lib/actions/jobs"

const inputClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-50"

export default async function JobsPage() {
  const { supabase, user } = await requireCurrentProfile()
  const { data: jobs } = await supabase
    .from("work_history")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false })

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        Work history
      </h1>

      <ul className="flex flex-col gap-3">
        {jobs?.map((job) => (
          <li
            key={job.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-50">
                {job.title} · {job.company}
              </p>
              <p className="text-xs text-neutral-500">
                {job.start_date} — {job.is_current ? "present" : job.end_date}
              </p>
              {job.description && (
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {job.description}
                </p>
              )}
            </div>
            <form action={deleteJob}>
              <input type="hidden" name="id" value={job.id} />
              <button type="submit" className="text-xs text-red-600 hover:underline dark:text-red-400">
                Delete
              </button>
            </form>
          </li>
        ))}
        {jobs?.length === 0 && (
          <p className="text-sm text-neutral-500">No work history yet — add your first one below.</p>
        )}
      </ul>

      <form action={createJob} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Add a job</h2>
        <div className="grid grid-cols-2 gap-3">
          <input name="title" placeholder="Title" required className={inputClass} />
          <input name="company" placeholder="Company" required className={inputClass} />
          <input name="start_date" type="date" required className={inputClass} />
          <input name="end_date" type="date" className={inputClass} />
          <input name="location" placeholder="Location" className={`${inputClass} col-span-2`} />
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <input type="checkbox" name="is_current" /> I currently work here
        </label>
        <textarea name="description" placeholder="Description" rows={3} className={inputClass} />
        <textarea
          name="highlights"
          placeholder="Highlights, one per line"
          rows={3}
          className={inputClass}
        />
        <button
          type="submit"
          className="w-fit rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Add job
        </button>
      </form>
    </div>
  )
}
