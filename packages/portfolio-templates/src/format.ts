const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function formatMonthYear(isoDate: string): string {
  const [year, month] = isoDate.split("-")
  const monthIndex = Number(month) - 1
  return `${MONTHS[monthIndex] ?? month} ${year}`
}

export function formatDateRange(
  startDate: string,
  endDate: string | null | undefined,
  isCurrent: boolean
): string {
  const start = formatMonthYear(startDate)
  const end = isCurrent || !endDate ? "Present" : formatMonthYear(endDate)
  return `${start} – ${end}`
}
