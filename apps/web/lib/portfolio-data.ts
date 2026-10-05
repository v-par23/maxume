import { cache } from "react"
import type { PortfolioData } from "@maxume/portfolio-templates"
import { createPublicSupabaseClient } from "@/lib/supabase/public"

/**
 * Cached per-request so generateMetadata and the page component (which both
 * need this) only hit the DB once for the same slug.
 */
export const getPortfolioData = cache(async (slug: string): Promise<PortfolioData | null> => {
  const supabase = createPublicSupabaseClient()
  const { data } = await supabase.rpc("get_portfolio_by_slug", { p_slug: slug })
  return (data as unknown as PortfolioData) ?? null
})
