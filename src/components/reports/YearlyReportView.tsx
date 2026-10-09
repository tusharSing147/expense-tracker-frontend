import { useState } from 'react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { downloadYearlyReport } from '../../api/reports'
import type { DownloadFormat, YearlyMonthlyTotal, YearlyReport } from '../../types/report'
import { saveBlob } from '../../utils/download'
import { apiErrorMessage } from '../../utils/errorMessages'
import { formatMoney, formatMonthYear } from '../../utils/format'
import { StatCard } from '../dashboard/StatCard'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'

export interface YearlyReportViewProps {
  report: YearlyReport
}

interface YearlyDatum extends YearlyMonthlyTotal {
  label: string
  year: number
}

const yearlyChartConfig = {
  total: {
    label: 'Spent',
    color: 'var(--chart-1)',
  },
  budget: {
    label: 'Budget',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

function compactAmount(value: number): string {
  const absolute = Math.abs(value)

  if (absolute >= 1_000_000) {
    return `${Math.round((value / 1_000_000) * 10) / 10}m`
  }

  if (absolute >= 1_000) {
    return `${Math.round((value / 1_000) * 10) / 10}k`
  }

  return String(value)
}

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

export function YearlyReportView({ report }: YearlyReportViewProps) {
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
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })

        saveBlob(blob, `expenses-${report.period.year}.json`)
      } else {
        const { blob, filename } = await downloadYearlyReport(report.period.year, kind)

        saveBlob(blob, filename)
      }
    } catch (e) {
      setError(apiErrorMessage(e, 'Download failed'))
    } finally {
      setBusy(null)
    }
  }

  const points: YearlyDatum[] = report.monthlyTotals.map((entry) => ({
    ...entry,
    year: report.period.year,
    label: new Date(Date.UTC(report.period.year, entry.month - 1, 1)).toLocaleDateString('en-US', {
      month: 'short',
      timeZone: 'UTC',
    }),
  }))

  const ranked = [...report.categoryTotals].sort((a, b) => b.total - a.total)
  const max = Math.max(...ranked.map((row) => row.total), 1)

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
        <StatCard label="Grand total" value={formatMoney(report.grandTotal)} />

        <StatCard
          label="Months with data"
          value={String(report.monthlyTotals.filter((entry) => entry.total > 0).length)}
        />

        <StatCard label="Categories" value={String(report.categoryTotals.length)} />
      </div>

      <Card className="gap-0 p-5">
        <h2 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
          Monthly totals
        </h2>

        <ChartContainer config={yearlyChartConfig} className="aspect-auto h-[280px]">
          <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={false}
              fontSize={12}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
            />
            <YAxis
              width={48}
              axisLine={false}
              tickLine={false}
              fontSize={12}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickFormatter={compactAmount}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(139,92,246,0.08)' }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const point = payload[0]?.payload as YearlyDatum | undefined

                    return point ? formatMonthYear(point.month, point.year) : null
                  }}
                  formatter={(value, name) => (
                    <span className="font-medium tabular-nums text-foreground">
                      {name}: {formatMoney(typeof value === 'number' ? value : 0)}
                    </span>
                  )}
                />
              }
            />
            <Bar
              dataKey="total"
              name="Spent"
              fill="var(--color-total)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="budget"
              name="Budget"
              fill="var(--color-budget)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <ChartLegend content={<ChartLegendContent className="text-muted-foreground" />} />
          </BarChart>
        </ChartContainer>
      </Card>

      <Card className="gap-0 p-5">
        <h2 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">By category</h2>

        {ranked.length === 0 ? (
          <Empty className="border border-border px-6 py-12">
            <EmptyHeader>
              <EmptyTitle>No expenses this year</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {ranked.map((row) => (
              <div key={row.category} className="flex items-center gap-4 py-3">
                <span className="w-28 shrink-0 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {row.category}
                </span>

                <div className="relative h-2 min-w-0 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-violet-600"
                    style={{ width: `${(row.total / max) * 100}%` }}
                  />
                </div>

                <span className="w-28 shrink-0 text-right text-sm tabular-nums text-gray-900 dark:text-gray-100">
                  {formatMoney(row.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
