import Link from "next/link"
import { requireCurrentProfile } from "@/lib/current-profile"

export default async function DashboardOverviewPage() {
  const { supabase, profile } = await requireCurrentProfile()

  const [{ count: jobCount }, { count: projectCount }, { count: skillCount }] =
    await Promise.all([
      supabase.from("work_history").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("skills").select("id", { count: "exact", head: true }),
    ])

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Welcome{profile.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Portfolio is{" "}
          <span className="font-medium">{profile.portfolio_visibility}</span>. Fill in your
          profile, work history, projects, and skills below.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Jobs" value={jobCount ?? 0} href="/jobs" />
        <StatCard label="Projects" value={projectCount ?? 0} href="/projects" />
        <StatCard label="Skills" value={skillCount ?? 0} href="/skills" />
      </div>

      <Link
        href="/profile"
        className="w-fit rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        Edit profile
      </Link>
    </div>
  )
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
    >
      <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        {value}
      </span>
      <span className="text-xs text-neutral-500">{label}</span>
    </Link>
  )
}
