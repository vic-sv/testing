// Date/time formatting helpers using Kyiv timezone and Ukrainian locale.

const KYIV = 'Europe/Kyiv'

export function formatKyiv(
  date: Date | string,
  opts?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('uk-UA', {
    timeZone: KYIV,
    ...(opts ?? {}),
  })
}

// Date + time: e.g. "11 черв., 22:00"
export function formatKyivDateTime(date: Date | string): string {
  return formatKyiv(date, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Date + time with year (admin view).
export function formatKyivDateTimeYear(date: Date | string): string {
  return formatKyiv(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Date only: e.g. "11 черв. 2026 р."
export function formatKyivDate(date: Date | string): string {
  return formatKyiv(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
