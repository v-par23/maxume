import type { PortfolioData } from "../types"
import { DEFAULT_ACCENT_COLOR, type ThemeConfig } from "../types"
import { formatDateRange } from "../format"

const FONT_CLASS: Record<NonNullable<ThemeConfig["font_pairing"]>, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
}

export function MinimalPortfolio({ data }: { data: PortfolioData }) {
  const { profile, jobs, projects, skills } = data
  const accent = profile.theme_config?.accent_color ?? DEFAULT_ACCENT_COLOR
  const fontClass = FONT_CLASS[profile.theme_config?.font_pairing ?? "sans"]

  return (
    <div className={`min-h-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 ${fontClass}`}>
      <main className="mx-auto max-w-2xl px-6 py-20">
        <header className="mb-16">
          <h1 className="text-3xl font-semibold tracking-tight">{profile.full_name}</h1>
          {profile.headline && (
            <p className="mt-2 text-lg" style={{ color: accent }}>
              {profile.headline}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
            {profile.location && <span>{profile.location}</span>}
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`} className="hover:underline">
                {profile.contact_email}
              </a>
            )}
          </div>
          {profile.bio && (
            <p className="mt-6 text-balance text-neutral-700 dark:text-neutral-300">
              {profile.bio}
            </p>
          )}
        </header>

        {jobs.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Experience
            </h2>
            <div className="flex flex-col gap-8">
              {jobs.map((job, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-medium">
                      {job.title} · {job.company}
                    </h3>
                    <span className="text-xs text-neutral-400">
                      {formatDateRange(job.start_date, job.end_date, job.is_current)}
                    </span>
                  </div>
                  {job.description && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {job.description}
                    </p>
                  )}
                  {job.highlights.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600 dark:text-neutral-400">
                      {job.highlights.map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Projects
            </h2>
            <div className="flex flex-col gap-8">
              {projects.map((project, i) => (
                <div key={i}>
                  <h3 className="font-medium">
                    {project.links?.live_url || project.links?.repo_url ? (
                      <a
                        href={project.links.live_url ?? project.links.repo_url}
                        className="hover:underline"
                        style={{ color: accent }}
                      >
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  {project.summary && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {project.summary}
                    </p>
                  )}
                  {project.tech_stack.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-400">
                      {project.tech_stack.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
