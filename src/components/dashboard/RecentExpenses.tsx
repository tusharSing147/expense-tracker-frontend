import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RecentExpense } from '../../types/dashboard'
import { formatDateOnly, formatMoney } from '../../utils/format'

export interface RecentExpensesProps {
  items: RecentExpense[]
}

export function RecentExpenses({ items }: RecentExpensesProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-sm">Recent expenses</CardTitle>

        <CardAction>
          <Link
            to="/expenses"
            className="text-sm text-violet-600 hover:underline dark:text-violet-400"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses this month yet.</p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>

                  {item.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>

                <Badge variant="secondary" className="shrink-0">
                  {item.category}
                </Badge>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDateOnly(item.date)}
                </span>

                <span className="shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
                  {formatMoney(item.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
