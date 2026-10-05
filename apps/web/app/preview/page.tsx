import { DeveloperPortfolio, MinimalPortfolio, type PortfolioData } from "@maxume/portfolio-templates"
import { requireCurrentProfile } from "@/lib/current-profile"

export default async function PreviewPage() {
  const { supabase, user, profile } = await requireCurrentProfile()

  const [{ data: jobs }, { data: projects }, { data: skills }] = await Promise.all([
    supabase
      .from("work_history")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true }),
    supabase.from("skills").select("*").eq("user_id", user.id),
  ])

  const data: PortfolioData = {
    profile: {
      slug: profile.slug,
      full_name: profile.full_name,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      contact_email: profile.contact_email,
      avatar_url: profile.avatar_url,
      portfolio_theme: profile.portfolio_theme,
      theme_config: (profile.theme_config ?? {}) as PortfolioData["profile"]["theme_config"],
      portfolio_visibility: profile.portfolio_visibility,
    },
    jobs: (jobs ?? []).map((job) => ({
      company: job.company,
      title: job.title,
      location: job.location,
      start_date: job.start_date,
      end_date: job.end_date,
      is_current: job.is_current,
      description: job.description,
      highlights: job.highlights,
    })),
    projects: (projects ?? []).map((project) => ({
      slug: project.slug,
      name: project.name,
      summary: project.summary,
      description: project.description,
      tech_stack: project.tech_stack,
      highlights: project.highlights,
      links: project.links as PortfolioData["projects"][number]["links"],
      is_current: project.is_current,
    })),
    skills: (skills ?? []).map((skill) => ({ name: skill.name, category: skill.category })),
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-amber-300 bg-amber-50 px-6 py-2 text-center text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        Preview — this is how your portfolio looks, regardless of its publish status.
      </div>
      {data.profile.portfolio_theme === "developer" ? (
        <DeveloperPortfolio data={data} />
      ) : (
        <MinimalPortfolio data={data} />
      )}
    </div>
  )
}
