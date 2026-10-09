import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { YearlyMonthlyTotal, YearlyReport } from '../../types/report'
import { formatCompactINR, formatINR, formatMonthShort, formatMonthYear } from '../../utils/format'
import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
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

export interface YearlyReportViewProps {
  report: YearlyReport
}

interface YearlyDatum extends YearlyMonthlyTotal {
  label: string
  year: number
}

const SECTION_TITLE_CLASS = 'mb-[var(--space-4)] text-lg font-semibold tracking-[-0.01em] text-ink'
const HEAD_CLASS = 'h-9'

const yearlyChartConfig = {
  total: {
    label: 'Spent',
    color: 'var(--chart-bar-current)',
  },
  budget: {
    label: 'Budget',
    color: 'var(--chart-bar)',
  },
} satisfies ChartConfig

function formatShare(value: number): string {
  const rounded = Math.round(value * 10) / 10

  return `${rounded}%`
}

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

export function YearlyReportView({ report }: YearlyReportViewProps) {
  const points: YearlyDatum[] = report.monthlyTotals.map((entry) => ({
    ...entry,
    year: report.period.year,
    label: formatMonthShort(entry.month, report.period.year),
  }))

  const chartLabel = `Monthly spending for ${report.period.year}. ${points
    .map((point) => `${point.label} ${formatINR(point.total)}`)
    .join(', ')}`

  const ranked = [...report.categoryTotals].sort((a, b) => b.total - a.total)
  const monthsWithData = report.monthlyTotals.filter((entry) => entry.total > 0).length

  return (
    <div className="flex flex-col gap-[var(--space-7)]">
      <section
        aria-label="Report summary"
        className="grid grid-cols-1 rounded-md border border-line bg-surface elevation-1 sm:grid-cols-3"
      >
        <SummaryFigure label="Grand total" value={formatINR(report.grandTotal)} />

        <SummaryFigure
          label="Months with data"
          value={String(monthsWithData)}
          hint="of 12"
          bordered
        />

        <SummaryFigure
          label="Categories"
          value={String(report.categoryTotals.length)}
          bordered
        />
      </section>

      <section>
        <h2 className={SECTION_TITLE_CLASS}>Monthly totals</h2>

        <div className="rounded-md border border-line bg-surface p-[var(--space-5)] elevation-1">
          <ChartContainer
            config={yearlyChartConfig}
            className="aspect-auto h-[280px]"
            role="img"
            aria-label={chartLabel}
          >
            <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />

              <XAxis
                dataKey="label"
                axisLine={{ stroke: 'var(--chart-grid)' }}
                tickLine={false}
                fontSize={12}
              />

              <YAxis
                width={48}
                axisLine={false}
                tickLine={false}
                fontSize={12}
                tickFormatter={formatCompactINR}
              />

              <ChartTooltip
                cursor={{ fill: 'var(--color-accent-soft)' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const point = payload[0]?.payload as YearlyDatum | undefined

                      return point ? formatMonthYear(point.month, point.year) : null
                    }}
                    formatter={(value, name) => (
                      <span className="flex w-full items-center justify-between gap-6">
                        <span className="text-ink-muted">{name}</span>

                        <span className="num font-medium text-ink">
                          {formatINR(typeof value === 'number' ? value : 0)}
                        </span>
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

              <ChartLegend content={<ChartLegendContent className="text-ink-muted" />} />
            </BarChart>
          </ChartContainer>
        </div>
      </section>

      <section>
        <h2 className={SECTION_TITLE_CLASS}>By category</h2>

        {ranked.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No expenses this year</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-md border border-line bg-surface elevation-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={HEAD_CLASS}>Category</TableHead>
                  <TableHead className={cn(HEAD_CLASS, 'text-right')}>Spent</TableHead>
                  <TableHead className={cn(HEAD_CLASS, 'text-right')}>Share</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ranked.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell>
                      <Badge variant="neutral">{row.category}</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="num text-ink">{formatINR(row.total)}</span>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="num text-ink-muted">
                        {formatShare(report.grandTotal > 0 ? (row.total / report.grandTotal) * 100 : 0)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell className="font-medium text-ink">Total</TableCell>

                  <TableCell className="text-right">
                    <span className="num font-display text-lg font-medium tracking-[var(--tracking-display)] text-ink">
                      {formatINR(report.grandTotal)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="num text-ink-muted">100%</span>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
