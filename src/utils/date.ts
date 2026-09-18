import { format, isValid, parseISO } from 'date-fns'

/** Return a display label without throwing for missing or invalid dates. */
export function formatDate(value: string | Date | null | undefined, pattern = 'dd MMM yyyy'): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  return isValid(date) ? format(date, pattern) : '—'
}
