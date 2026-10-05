import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DeveloperPortfolio, MinimalPortfolio } from "@maxume/portfolio-templates"
import { getPortfolioData } from "@/lib/portfolio-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getPortfolioData(slug)
  if (!data) return {}

  return {
    title: `${data.profile.full_name}${data.profile.headline ? ` — ${data.profile.headline}` : ""}`,
    description: data.profile.bio ?? data.profile.headline ?? undefined,
    robots: data.profile.portfolio_visibility === "unlisted" ? { index: false } : undefined,
  }
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getPortfolioData(slug)
  if (!data) notFound()

  // Direct branching (not a dynamically-resolved component reference) so
  // react-hooks/static-components doesn't flag this as an unstable component.
  if (data.profile.portfolio_theme === "developer") {
    return <DeveloperPortfolio data={data} />
  }
  return <MinimalPortfolio data={data} />
}
