export interface PortfolioJob {
  company: string
  title: string
  location?: string | null
  start_date: string
  end_date?: string | null
  is_current: boolean
  description?: string | null
  highlights: string[]
}

export interface PortfolioProject {
  slug: string
  name: string
  summary?: string | null
  description?: string | null
  tech_stack: string[]
  highlights: string[]
  links?: { repo_url?: string; live_url?: string } | null
  is_current: boolean
}

export interface PortfolioSkill {
  name: string
  category: string
}

/** Constrained theming tokens — not open CSS. Full custom theming is a v2 ask. */
export interface ThemeConfig {
  accent_color?: string
  font_pairing?: "sans" | "serif" | "mono"
}

export interface PortfolioProfile {
  slug: string
  full_name: string
  headline?: string | null
  bio?: string | null
  location?: string | null
  contact_email?: string | null
  avatar_url?: string | null
  portfolio_theme: string
  theme_config: ThemeConfig
  portfolio_visibility: string
}

export interface PortfolioData {
  profile: PortfolioProfile
  jobs: PortfolioJob[]
  projects: PortfolioProject[]
  skills: PortfolioSkill[]
}

export type PortfolioTemplateId = "minimal" | "developer"

export const PORTFOLIO_TEMPLATE_IDS: PortfolioTemplateId[] = ["minimal", "developer"]

export const DEFAULT_ACCENT_COLOR = "#2563eb"
