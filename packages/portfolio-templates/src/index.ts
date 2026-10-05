import type { ComponentType } from "react"
import { MinimalPortfolio } from "./templates/minimal"
import { DeveloperPortfolio } from "./templates/developer"
import type { PortfolioData, PortfolioTemplateId } from "./types"

export { MinimalPortfolio } from "./templates/minimal"
export { DeveloperPortfolio } from "./templates/developer"
export { formatDateRange } from "./format"
export * from "./types"

export const PORTFOLIO_TEMPLATES: Record<
  PortfolioTemplateId,
  ComponentType<{ data: PortfolioData }>
> = {
  minimal: MinimalPortfolio,
  developer: DeveloperPortfolio,
}

export function resolvePortfolioTemplate(
  templateId: string
): ComponentType<{ data: PortfolioData }> {
  return PORTFOLIO_TEMPLATES[templateId as PortfolioTemplateId] ?? MinimalPortfolio
}
