import { formatINR, formatOver } from './format'

export type StatusTone = 'ok' | 'warn' | 'over' | 'neutral'

export type StatusLabel = 'On track' | 'Nearing limit' | 'Fully used' | 'Over budget' | 'No budget'

export interface BudgetStatus {
  tone: StatusTone
  label: StatusLabel
  remainingText: string | null
  /** Share of budget used, in percent. Null when there is no budget. */
  percent: number | null
  /** Percent clamped to 0–100 for progress bar widths. */
  displayPercent: number
  /** Sort rank: over budget first, then nearing limit / fully used, then on track, then no budget. */
  order: number
}

const TOLERANCE = 0.005

export function getBudgetStatus(spent: number, budget: number | null | undefined): BudgetStatus {
  if (budget === null || budget === undefined || budget <= 0) {
    return {
      tone: 'neutral',
      label: 'No budget',
      remainingText: null,
      percent: null,
      displayPercent: 0,
      order: 3,
    }
  }

  const percent = (spent / budget) * 100
  const remaining = budget - spent

  if (spent - budget > TOLERANCE) {
    return {
      tone: 'over',
      label: 'Over budget',
      remainingText: formatOver(spent - budget),
      percent,
      displayPercent: 100,
      order: 0,
    }
  }

  if (Math.abs(remaining) <= TOLERANCE) {
    return {
      tone: 'warn',
      label: 'Fully used',
      remainingText: 'Nothing left',
      percent,
      displayPercent: 100,
      order: 1,
    }
  }

  if (percent >= 80) {
    return {
      tone: 'warn',
      label: 'Nearing limit',
      remainingText: `${formatINR(remaining)} left`,
      percent,
      displayPercent: Math.min(100, percent),
      order: 1,
    }
  }

  return {
    tone: 'ok',
    label: 'On track',
    remainingText: `${formatINR(remaining)} left`,
    percent,
    displayPercent: Math.min(100, percent),
    order: 2,
  }
}

export function compareByStatus(a: BudgetStatus, b: BudgetStatus): number {
  return a.order - b.order
}
