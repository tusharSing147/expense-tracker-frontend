import { ReceiptTextIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import type { BudgetStatus } from '../../types/budget'
import type { DashboardCategoryRow } from '../../types/dashboard'
import { cn } from '@/lib/utils'
import { formatMoney } from '../../utils/format'

export interface CategoryBreakdownProps {
  rows: DashboardCategoryRow[]
}

const statusLabels: Record<BudgetStatus, string> = {
  ok: 'On track',
  warning: 'Warning',
  exceeded: 'Over budget',
}

const statusBadgeClasses: Record<BudgetStatus, string> = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  exceeded: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const statusIndicatorClasses: Record<BudgetStatus, string> = {
  ok: '[&_[data-slot=progress-indicator]]:bg-emerald-500',
  warning: '[&_[data-slot=progress-indicator]]:bg-amber-500',
  exceeded: '[&_[data-slot=progress-indicator]]:bg-red-500',
}

export function CategoryBreakdown({ rows }: CategoryBreakdownProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-foreground">Spending by category</h2>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptTextIcon />
            </EmptyMedia>

            <EmptyTitle>No spending yet</EmptyTitle>

            <EmptyDescription>
              Expenses and budgets for this month will show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="gap-0 divide-y divide-gray-200 p-0 dark:divide-gray-800">
          {rows.map((row) => (
            <div key={row.category} className="flex items-center gap-4 px-5 py-4">
              <div className="w-32 shrink-0">
                <p className="truncate text-sm font-medium text-foreground">{row.category}</p>
              </div>

              <div className="min-w-0 flex-1">
                <Progress
                  value={row.percentUsed ?? 0}
                  aria-label={`${row.category} budget usage`}
                  className={row.status ? statusIndicatorClasses[row.status] : undefined}
                />

                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatMoney(row.spent)}
                  {row.budget != null ? ` of ${formatMoney(row.budget)}` : ' (no budget)'}
                </p>
              </div>

              <div className="w-40 text-right">
                <Badge
                  variant={row.status ? 'default' : 'secondary'}
                  className={row.status ? statusBadgeClasses[row.status] : undefined}
                >
                  {row.status ? statusLabels[row.status] : 'No budget'}
                </Badge>

                <p
                  className={cn(
                    'mt-1.5 text-xs',
                    row.remaining != null && row.remaining < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground',
                  )}
                >
                  {row.remaining != null ? `${formatMoney(row.remaining)} left` : ''}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </section>
  )
}
