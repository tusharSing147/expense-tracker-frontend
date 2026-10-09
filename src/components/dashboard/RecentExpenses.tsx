import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import type { RecentExpense } from '../../types/dashboard'
import { formatDateOnly, formatINR } from '../../utils/format'

export interface RecentExpensesProps {
  items: RecentExpense[]
}

export function RecentExpenses({ items }: RecentExpensesProps) {
  return (
    <section className="flex h-full flex-col rounded-md border border-line bg-surface elevation-1">
      <div className="flex items-center justify-between gap-3 border-b border-line px-[var(--space-4)] py-3">
        <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">Recent expenses</h2>

        <Link
          to="/expenses"
          className="inline-flex h-8 items-center rounded-sm px-3 text-sm font-medium text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-ink"
        >
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="px-[var(--space-4)] py-[var(--space-5)] text-sm text-ink-muted">
          No expenses this month yet.
        </p>
      ) : (
        <ul className="flex-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-t border-line px-[var(--space-4)] py-3 transition-colors duration-[var(--duration-fast)] first:border-t-0 hover:bg-surface-sunken"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink" title={item.title}>
                  {item.title}
                </p>

                {item.description && (
                  <p
                    className="mt-0.5 truncate text-xs text-ink-muted"
                    title={item.description}
                  >
                    {item.description}
                  </p>
                )}

                <div className="mt-1.5 sm:hidden">
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </div>

              <Badge variant="secondary" className="hidden sm:inline-flex">
                {item.category}
              </Badge>

              <span className="hidden w-[92px] shrink-0 text-xs tabular-nums text-ink-muted sm:block">
                {formatDateOnly(item.date)}
              </span>

              <span className="num ml-auto shrink-0 text-right text-sm font-medium text-ink">
                {formatINR(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
