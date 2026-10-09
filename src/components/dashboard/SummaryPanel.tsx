import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatINR } from '../../utils/format'

export interface SummaryPanelProps {
  leftToSpent: number
  spent: number
  budgeted: number
  outsideBudgets: number
  budgetedCategoryCount: number
}

const COUNT_DURATION_MS = 360
const EASE_X1 = 0.2
const EASE_Y1 = 0.7
const EASE_X2 = 0.2
const EASE_Y2 = 1

function bezierValue(t: number, c1: number, c2: number): number {
  const mt = 1 - t

  return 3 * mt * mt * t * c1 + 3 * mt * t * t * c2 + t * t * t
}

function easeOut(x: number): number {
  if (x <= 0) {
    return 0
  }

  if (x >= 1) {
    return 1
  }

  let low = 0
  let high = 1
  let t = x

  for (let i = 0; i < 24; i += 1) {
    t = (low + high) / 2

    if (bezierValue(t, EASE_X1, EASE_X2) < x) {
      low = t
    } else {
      high = t
    }
  }

  return bezierValue(t, EASE_Y1, EASE_Y2)
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function SummaryPanel({
  leftToSpent,
  spent,
  budgeted,
  outsideBudgets,
  budgetedCategoryCount,
}: SummaryPanelProps) {
  const overBudget = leftToSpent < 0
  const target = Math.abs(leftToSpent)
  const [figure, setFigure] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    let frame = 0

    if (prefersReducedMotion()) {
      frame = requestAnimationFrame(() => setFigure(target))

      return () => cancelAnimationFrame(frame)
    }

    const start = performance.now()

    function step(now: number): void {
      const progress = Math.min(1, (now - start) / COUNT_DURATION_MS)

      setFigure(target * easeOut(progress))

      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frame)
  }, [target])

  return (
    <section
      aria-label="Monthly summary"
      className="grid w-full grid-cols-1 rounded-md border border-line bg-surface elevation-1 sm:[grid-template-columns:1.4fr_1fr_1fr]"
    >
      <div className="order-first p-[var(--space-6)]">
        <p className="text-xs font-medium text-ink-muted">
          {overBudget ? 'Over budget by' : 'Left to spend'}
        </p>

        <p
          className={cn(
            'num mt-1 break-all font-display text-hero leading-[1.1] tracking-[var(--tracking-display)]',
            overBudget ? 'text-negative-ink' : 'text-ink',
          )}
        >
          {formatINR(figure)}
        </p>

        <div className="animate-brass-draw mt-[var(--space-3)] h-px w-[72px] bg-metal" aria-hidden="true" />
      </div>

      <div className="border-t border-line px-[var(--space-5)] py-[var(--space-6)] sm:border-t-0 sm:border-l">
        <p className="text-xs font-medium text-ink-muted">Spent</p>

        <p className="num mt-1 font-display text-2xl leading-[1.1] tracking-[var(--tracking-display)] text-ink">
          {formatINR(spent)}
        </p>

        <p className="mt-1 text-xs text-ink-muted">in budgeted categories</p>
      </div>

      <div className="border-t border-line px-[var(--space-5)] py-[var(--space-6)] sm:border-t-0 sm:border-l">
        <p className="text-xs font-medium text-ink-muted">Budgeted</p>

        <p className="num mt-1 font-display text-2xl leading-[1.1] tracking-[var(--tracking-display)] text-ink">
          {formatINR(budgeted)}
        </p>

        <p className="mt-1 text-xs text-ink-muted">across {budgetedCategoryCount} categories</p>
      </div>

      <div className="border-t border-line px-[var(--space-6)] py-[var(--space-4)] text-sm text-ink-muted sm:col-span-3">
        Outside budgets: <span className="num">{formatINR(outsideBudgets)}</span>
      </div>
    </section>
  )
}
