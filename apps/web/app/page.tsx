import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Maxume
      </h1>
      <p className="max-w-md text-balance text-neutral-600 dark:text-neutral-400">
        Tell your agent once — &ldquo;I got promoted&rdquo;, &ldquo;I shipped a new
        project&rdquo; — and it keeps your resume, portfolio, and GitHub profile in sync.
      </p>
      <Link
        href="/login"
        className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        Get started
      </Link>
    </main>
  )
}
