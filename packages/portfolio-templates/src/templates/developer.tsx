import type { PortfolioData } from "../types"
import { DEFAULT_ACCENT_COLOR } from "../types"
import { formatDateRange } from "../format"

// A deliberately fixed dark, terminal-leaning aesthetic — not theme-dependent
// like minimal's light/dark split. This template's identity *is* dark.
export function DeveloperPortfolio({ data }: { data: PortfolioData }) {
  const { profile, jobs, projects, skills } = data
  const accent = profile.theme_config?.accent_color ?? DEFAULT_ACCENT_COLOR
  const useMono = profile.theme_config?.font_pairing !== "sans"

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-200">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-14 border-b border-neutral-800 pb-8">
          <p className="text-xs" style={{ color: accent }}>
            ~/{profile.slug}
          </p>
          <h1 className={`mt-1 text-2xl font-semibold text-white ${useMono ? "font-mono" : ""}`}>
            {profile.full_name}
          </h1>
          {profile.headline && <p className="mt-1 text-neutral-400">{profile.headline}</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
            {profile.location && <span>{profile.location}</span>}
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`} className="hover:text-neutral-300">
                {profile.contact_email}
              </a>
            )}
          </div>
          {profile.bio && <p className="mt-5 max-w-xl text-sm text-neutral-400">{profile.bio}</p>}
        </header>

        {skills.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
              // stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
              // projects
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project, i) => (
                <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                  <h3 className="font-medium text-white">
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
                    <p className="mt-1 text-sm text-neutral-400">{project.summary}</p>
                  )}
                  {project.tech_stack.length > 0 && (
                    <p className="mt-2 font-mono text-xs text-neutral-500">
                      {project.tech_stack.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {jobs.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
              // experience
            </h2>
            <div className="flex flex-col gap-6">
              {jobs.map((job, i) => (
                <div key={i} className="border-l-2 border-neutral-800 pl-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-medium text-white">
                      {job.title} <span className="text-neutral-500">@ {job.company}</span>
                    </h3>
                    <span className="font-mono text-xs text-neutral-500">
                      {formatDateRange(job.start_date, job.end_date, job.is_current)}
                    </span>
                  </div>
                  {job.highlights.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-400">
                      {job.highlights.map((h, j) => (
                        <li key={j}>› {h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
