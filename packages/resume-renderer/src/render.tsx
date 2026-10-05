import { renderToBuffer } from "@react-pdf/renderer"
import { resolveResumeTemplate, type ResumeData } from "@maxume/resume-templates"

export async function renderResumePdf(templateId: string, data: ResumeData): Promise<Buffer> {
  const Template = resolveResumeTemplate(templateId)
  return renderToBuffer(<Template data={data} />)
}
