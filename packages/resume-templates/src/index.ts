import type { ComponentType } from "react"
import { ClassicResume } from "./templates/classic"
import { ModernResume } from "./templates/modern"
import type { ResumeData, ResumeTemplateId } from "./types"

export { ClassicResume } from "./templates/classic"
export { ModernResume } from "./templates/modern"
export { formatDateRange } from "./format"
export * from "./types"

export const RESUME_TEMPLATES: Record<ResumeTemplateId, ComponentType<{ data: ResumeData }>> = {
  classic: ClassicResume,
  modern: ModernResume,
}

export function resolveResumeTemplate(templateId: string): ComponentType<{ data: ResumeData }> {
  return RESUME_TEMPLATES[templateId as ResumeTemplateId] ?? ClassicResume
}
