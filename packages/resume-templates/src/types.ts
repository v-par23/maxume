export interface ResumeJob {
  company: string
  title: string
  location?: string | null
  start_date: string
  end_date?: string | null
  is_current: boolean
  description?: string | null
  highlights: string[]
}

export interface ResumeProject {
  name: string
  summary?: string | null
  description?: string | null
  tech_stack: string[]
  highlights: string[]
  links?: { repo_url?: string; live_url?: string } | null
}

export interface ResumeSkill {
  name: string
  category: string
}

export interface ResumeData {
  full_name: string
  headline?: string | null
  bio?: string | null
  location?: string | null
  contact_email?: string | null
  jobs: ResumeJob[]
  projects: ResumeProject[]
  skills: ResumeSkill[]
}

export type ResumeTemplateId = "classic" | "modern"

export const RESUME_TEMPLATE_IDS: ResumeTemplateId[] = ["classic", "modern"]
