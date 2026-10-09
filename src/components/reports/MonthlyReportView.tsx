import { useState } from 'react'
import { downloadMonthlyReport } from '../../api/reports'
import type { BudgetStatus } from '../../types/budget'
import type { DownloadFormat, MonthlyReport } from '../../types/report'
import { cn } from '@/lib/utils'
import { saveBlob } from '../../utils/download'
import { apiErrorMessage } from '../../utils/errorMessages'
import { formatDateOnly, formatMoney } from '../../utils/format'
import { StatCard } from '../dashboard/StatCard'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface MonthlyReportViewProps {
  report: MonthlyReport
}

const statusLabels: Record<BudgetStatus, string> = {
  ok: 'On track',
  warning: 'Warning',
  exceeded: 'Over budget',
}

const STATUS_BADGE_CLASS: Record<BudgetStatus, string> = {
  ok: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  exceeded: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

const STATUS_PROGRESS_CLASS: Record<BudgetStatus, string> = {
  ok: '[&_[data-slot=progress-indicator]]:bg-emerald-500',
  warning: '[&_[data-slot=progress-indicator]]:bg-amber-500',
  exceeded: '[&_[data-slot=progress-indicator]]:bg-red-500',
}

const HEAD_CLASS = 'px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'

const HEADER_ROW_CLASS =
  'border-b border-gray-200 hover:bg-transparent dark:border-gray-800'

const BODY_ROW_CLASS =
  'border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-gray-800/50'

function DownloadIcon() {
  return (
    <svg
      className="size-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function statusFor(raw: number): BudgetStatus {
  if (raw < 80) {
    return 'ok'
  }

  if (raw <= 100) {
    return 'warning'
  }

  return 'exceeded'
}

export function MonthlyReportView({ report }: MonthlyReportViewProps) {
  const [busy, setBusy] = useState<DownloadFormat | 'json' | null>(null)
  const [error, setError] = useState('')

  async function handleDownload(kind: DownloadFormat | 'json') {
    if (busy) {
      return
    }

    setBusy(kind)
    setError('')

    try {
      if (kind === 'json') {
        const mm = String(report.period.month).padStart(2, '0')
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })

        saveBlob(blob, `expenses-${report.period.year}-${mm}.json`)
      } else {
        const { blob, filename } = await downloadMonthlyReport(
          report.period.month,
          report.period.year,
          kind,
        )

        saveBlob(blob, filename)
      }
    } catch (e) {
      setError(apiErrorMessage(e, 'Download failed'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-auto text-sm font-medium text-gray-900 dark:text-gray-100">
          Download
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={busy !== null}
          onClick={() => handleDownload('csv')}
        >
          {busy === 'csv' ? <Spinner className="size-3.5" /> : <DownloadIcon />}
          Download CSV
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={busy !== null}
          onClick={() => handleDownload('xlsx')}
        >
          {busy === 'xlsx' ? <Spinner className="size-3.5" /> : <DownloadIcon />}
          Download Excel
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={busy !== null}
          onClick={() => handleDownload('json')}
        >
          {busy === 'json' ? <Spinner className="size-3.5" /> : <DownloadIcon />}
          Download JSON
        </Button>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total spent" value={formatMoney(report.total)} />

        <StatCard label="Expenses" value={String(report.expenses.length)} />

        <StatCard label="Categories with spend" value={String(report.categoryTotals.length)} />
      </div>

      <Card className="gap-0 p-5">
        <h2 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">By category</h2>

        {report.categoryTotals.length === 0 ? (
          <Empty className="border border-border px-6 py-12">
            <EmptyHeader>
              <EmptyTitle>No expenses in this period</EmptyTitle>
              <EmptyDescription>Nothing to report for this month.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className={HEADER_ROW_CLASS}>
                <TableHead className={HEAD_CLASS}>Category</TableHead>

                <TableHead className={cn(HEAD_CLASS, 'text-right')}>Spent</TableHead>

                <TableHead className={cn(HEAD_CLASS, 'text-right')}>Budget</TableHead>

                <TableHead className={cn(HEAD_CLASS, 'text-right')}>Remaining</TableHead>

                <TableHead className={cn(HEAD_CLASS, 'w-40')}>Progress</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {report.categoryTotals.map((row) => {
                const raw =
                  row.budget != null
                    ? row.budget === 0
                      ? 100
                      : (row.spent / row.budget) * 100
                    : 0
                const status = statusFor(raw)

                return (
                  <TableRow key={row.category} className={BODY_ROW_CLASS}>
                    <TableCell className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {row.category}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right font-medium tabular-nums text-gray-900 dark:text-gray-100">
                      {formatMoney(row.spent)}
                    </TableCell>

                    <TableCell
                      className={cn(
                        'px-4 py-3 text-right tabular-nums',
                        row.budget != null
                          ? 'text-gray-600 dark:text-gray-300'
                          : 'text-gray-500 dark:text-gray-400',
                      )}
                    >
                      {row.budget != null ? formatMoney(row.budget) : '—'}
                    </TableCell>

                    <TableCell
                      className={cn(
                        'px-4 py-3 text-right tabular-nums',
                        row.remaining == null
                          ? 'text-gray-500 dark:text-gray-400'
                          : row.remaining < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-300',
                      )}
                    >
                      {row.remaining != null ? formatMoney(row.remaining) : '—'}
                    </TableCell>

                    <TableCell className="w-40 px-4 py-3">
                      {row.budget != null ? (
                        <div className="flex flex-col gap-1.5">
                          <Progress
                            value={raw}
                            className={STATUS_PROGRESS_CLASS[status]}
                            aria-label={`${row.category} budget usage`}
                          />

                          <Badge className={STATUS_BADGE_CLASS[status]}>
                            {statusLabels[status]}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary">No budget</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="gap-0 p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Expenses</h2>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {report.expenses.length} total
          </p>
        </div>

        {report.expenses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No expenses.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className={HEADER_ROW_CLASS}>
                  <TableHead className={HEAD_CLASS}>Date</TableHead>

                  <TableHead className={HEAD_CLASS}>Title</TableHead>

                  <TableHead className={HEAD_CLASS}>Category</TableHead>

                  <TableHead className={cn(HEAD_CLASS, 'text-right')}>Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {report.expenses.slice(0, 15).map((expense) => (
                  <TableRow key={expense.id} className={BODY_ROW_CLASS}>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatDateOnly(expense.date)}
                    </TableCell>

                    <TableCell className="whitespace-normal px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {expense.title}
                      </p>

                      {expense.description && (
                        <p className="max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                          {expense.description}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <Badge variant="secondary">{expense.category}</Badge>
                    </TableCell>

                    <TableCell className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-gray-900 dark:text-gray-100">
                      {formatMoney(expense.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {report.expenses.length > 15 && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Preview shows the first 15 of {report.expenses.length} rows — download the full
                report above.
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
