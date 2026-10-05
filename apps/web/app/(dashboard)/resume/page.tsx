import Link from "next/link"
import { requireCurrentProfile } from "@/lib/current-profile"

export default async function ResumePage() {
  const { supabase, user } = await requireCurrentProfile()
  const { data: resumes } = await supabase
    .from("resume_versions")
    .select("id, version_number, template_id, is_active, created_at")
    .eq("user_id", user.id)
    .order("version_number", { ascending: false })

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Resume</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Generated from your profile, work history, projects, and skills. Ask the{" "}
          <Link href="/chat" className="underline">
            agent
          </Link>{" "}
          to regenerate it whenever something changes.
        </p>
      </div>

      {resumes && resumes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {resumes.map((resume) => (
            <li
              key={resume.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Version {resume.version_number}
                  {resume.is_active && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      Active
                    </span>
                  )}
                </span>
                <span className="text-xs text-neutral-500">
                  {resume.template_id} template ·{" "}
                  {new Date(resume.created_at).toLocaleDateString()}
                </span>
              </div>
              <a
                href={`/api/v1/resumes/${resume.id}/download`}
                className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">
          No resume generated yet — tell the agent something changed and it can generate one
          for you.
        </p>
      )}
    </div>
  )
}
