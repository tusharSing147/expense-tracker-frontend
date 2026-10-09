import type { MonthlyReport } from '../../types/report'
import { formatDateOnly, formatINR, formatOver } from '../../utils/format'
import { getBudgetStatus } from '../../utils/status'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface MonthlyReportViewProps {
  report: MonthlyReport
}

const PREVIEW_LIMIT = 15

const SECTION_TITLE_CLASS = 'mb-[var(--space-4)] text-lg font-semibold tracking-[-0.01em] text-ink'
const HEAD_CLASS = 'h-9'

function SummaryFigure({
  label,
  value,
  hint,
  bordered = false,
}: {
  label: string
  value: string
  hint?: string
  bordered?: boolean
}) {
  return (
    <div
      className={cn(
        'p-[var(--space-6)]',
        bordered && 'border-t border-line sm:border-t-0 sm:border-l',
      )}
    >
      <p className="text-xs font-medium text-ink-muted">{label}</p>

      <p className="num mt-1 font-display text-2xl leading-[1.1] tracking-[var(--tracking-display)] text-ink">
        {value}
      </p>

      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

export function MonthlyReportView({ report }: MonthlyReportViewProps) {
  const categoryRows = report.categoryTotals
  const previewRows = report.expenses.slice(0, PREVIEW_LIMIT)
  const spentTotal = categoryRows.reduce((sum, row) => sum + row.spent, 0)

  return (
    <div className="flex flex-col gap-[var(--space-7)]">
      <section
        aria-label="Report summary"
        className="grid grid-cols-1 rounded-md border border-line bg-surface elevation-1 sm:grid-cols-3"
      >
        <SummaryFigure label="Total spent" value={formatINR(report.total)} />

        <SummaryFigure
          label="Expenses"
          value={String(report.expenses.length)}
          bordered
        />

        <SummaryFigure
          label="Categories with spend"
          value={String(categoryRows.length)}
          bordered
        />
      </section>

      <section>
        <h2 className={SECTION_TITLE_CLASS}>By category</h2>

        {categoryRows.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No expenses in this period</EmptyTitle>
              <EmptyDescription>Nothing to report for this month.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-md border border-line bg-surface elevation-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={HEAD_CLASS}>Category</TableHead>
                  <TableHead className={cn(HEAD_CLASS, 'text-right')}>Spent</TableHead>
                  <TableHead className={cn(HEAD_CLASS, 'text-right')}>Budget</TableHead>
                  <TableHead className={cn(HEAD_CLASS, 'text-right')}>Remaining</TableHead>
                  <TableHead className={cn(HEAD_CLASS, 'w-40')}>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categoryRows.map((row) => {
                  const status = getBudgetStatus(row.spent, row.budget)

                  return (
                    <TableRow key={row.category}>
                      <TableCell>
                        <Badge variant="neutral">{row.category}</Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="num text-ink">{formatINR(row.spent)}</span>
                      </TableCell>

                      <TableCell className="text-right">
                        {row.budget != null ? (
                          <span className="num text-ink">{formatINR(row.budget)}</span>
                        ) : (
                          <span className="text-xs text-ink-muted">No budget</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {row.remaining == null ? (
                          <span className="text-xs text-ink-muted">No budget</span>
                        ) : row.remaining < 0 ? (
                          <span className="num text-negative-ink">{formatOver(row.remaining)}</span>
                        ) : (
                          <span className="num text-ink">{formatINR(row.remaining)}</span>
                        )}
                      </TableCell>

                      <TableCell className="w-40 py-2">
                        <div className="flex flex-col gap-1">
                          <Badge variant={status.tone}>{status.label}</Badge>

                          {row.budget != null && (
                            <Progress
                              tone={status.tone}
                              value={status.displayPercent}
                              aria-label={`${row.category} budget used`}
                              aria-valuenow={Math.round(status.displayPercent)}
                              aria-valuetext={
                                status.remainingText
                                  ? `${status.label}, ${status.remainingText}`
                                  : status.label
                              }
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell className="font-medium text-ink">Total</TableCell>

                  <TableCell className="text-right">
                    <span className="num font-display text-lg font-medium tracking-[var(--tracking-display)] text-ink">
                      {formatINR(spentTotal)}
                    </span>
                  </TableCell>

                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </section>

      {report.expenses.length > 0 && (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>Expenses</h2>

          <div className="overflow-hidden rounded-md border border-line bg-surface elevation-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={HEAD_CLASS}>Date</TableHead>
                  <TableHead className={HEAD_CLASS}>Title</TableHead>
                  <TableHead className={HEAD_CLASS}>Category</TableHead>
                  <TableHead className={cn(HEAD_CLASS, 'text-right')}>Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {previewRows.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-ink-muted">{formatDateOnly(expense.date)}</TableCell>

                    <TableCell className="whitespace-normal">
                      <p className="font-medium text-ink">{expense.title}</p>

                      {expense.description && (
                        <p className="max-w-xs truncate text-xs text-ink-muted">
                          {expense.description}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="neutral">{expense.category}</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="num text-ink">{formatINR(expense.amount)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {report.expenses.length > PREVIEW_LIMIT && (
              <div className="border-t border-line bg-surface-sunken px-4 py-3 text-xs text-ink-muted">
                Showing {PREVIEW_LIMIT} of {report.expenses.length} rows. Download the report for
                the full list.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
