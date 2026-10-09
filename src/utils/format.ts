const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatINR(amount: number): string {
  return moneyFormatter.format(amount)
}

export function formatOver(amount: number): string {
  return `${formatINR(Math.abs(amount))} over`
}

function trimTenth(value: number): string {
  const rounded = (Math.round(value * 10) / 10).toFixed(1)
  return rounded.endsWith('.0') ? rounded.slice(0, -2) : rounded
}

/** Compact Indian notation for chart axes only: ₹550, ₹1.1k, ₹2.2L, ₹1.1Cr */
export function formatCompactINR(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1e7) return `${sign}₹${trimTenth(abs / 1e7)}Cr`
  if (abs >= 1e5) return `${sign}₹${trimTenth(abs / 1e5)}L`
  if (abs >= 1e3) return `${sign}₹${trimTenth(abs / 1e3)}k`
  return `${sign}₹${Math.round(abs)}`
}

/** Short month name without locale surprises ("Sep", never "Sept"). */
const shortMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
})

export function formatDateOnly(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)

  if (!match) {
    return date
  }

  const [, year, month, day] = match
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))

  return `${day} ${shortMonthFormatter.format(parsed)} ${year}`
}

export function formatMonthYear(month: number, year: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Chart axis month label: "Oct". */
export function formatMonthShort(month: number, year: number): string {
  return shortMonthFormatter.format(new Date(Date.UTC(year, month - 1, 1)))
}
