/**
 * Updates named sections of a profile README in place, using HTML-comment
 * markers (`<!-- maxume:key -->...<!-- /maxume:key -->`) so repeated syncs
 * only ever touch content maxume itself wrote, leaving everything else the
 * user has in their README untouched. A section with no existing markers is
 * appended; a brand-new README gets a minimal header first.
 */
export function mergeReadmeSections(
  existingContent: string | null,
  sections: Record<string, string>,
  fullName: string
): string {
  let content = existingContent ?? `# Hi, I'm ${fullName}\n`

  for (const [key, value] of Object.entries(sections)) {
    const start = `<!-- maxume:${key} -->`
    const end = `<!-- /maxume:${key} -->`
    const block = `${start}\n${value}\n${end}`

    const startIdx = content.indexOf(start)
    const endIdx = content.indexOf(end)

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      content = content.slice(0, startIdx) + block + content.slice(endIdx + end.length)
    } else {
      content = `${content.trimEnd()}\n\n${block}\n`
    }
  }

  return content
}
