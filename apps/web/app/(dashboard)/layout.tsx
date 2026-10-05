import type { ReactNode } from "react"
import Link from "next/link"
import { requireCurrentProfile } from "@/lib/current-profile"
import { signOut } from "@/lib/actions/auth"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/chat", label: "Agent" },
  { href: "/profile", label: "Profile" },
  { href: "/jobs", label: "Work history" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/resume", label: "Resume" },
  { href: "/settings/integrations", label: "Integrations" },
  { href: "/settings/api-key", label: "API key" },
  { href: "/settings/tokens", label: "CLI tokens" },
]

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireCurrentProfile()

  return (
    <div className="flex min-h-full flex-1">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-neutral-200 p-4 dark:border-neutral-800">
        <div>
          <Link href="/dashboard" className="block px-2 pb-6 text-lg font-semibold">
            Maxume
          </Link>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 px-2">
          <span className="truncate text-xs text-neutral-500">{profile.slug}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
