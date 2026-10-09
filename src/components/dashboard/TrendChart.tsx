import { cn } from '@/lib/utils'
import type { TrendPoint } from '../../types/dashboard'
import { formatCompactINR, formatINR, formatMonthShort, formatMonthYear } from '../../utils/format'

export interface TrendChartProps {
  data: TrendPoint[]
}

const NOW = new Date()
const CURRENT_MONTH = NOW.getUTCMonth() + 1
const CURRENT_YEAR = NOW.getUTCFullYear()

const PLOT_HEIGHT = 210
const Y_AXIS_GUTTER = 'pl-14'

function niceMax(value: number): number {
  if (value <= 0) {
    return 100
  }

  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10

  return step * magnitude
}

export function TrendChart({ data }: TrendChartProps) {
  const points = data
  const maxTotal = points.length > 0 ? Math.max(...points.map((point) => point.total)) : 0
  const max = niceMax(maxTotal)
  const ticks = [1, 0.75, 0.5, 0.25, 0]
  const summary = `Spending by month: ${points
    .map((point) => `${formatMonthYear(point.month, point.year)} ${formatINR(point.total)}`)
    .join(', ')}`

  return (
    <section className="flex h-full flex-col rounded-md border border-line bg-surface p-[var(--space-5)] elevation-1">
      <h2 className="mb-4 text-lg font-semibold tracking-[-0.01em] text-ink">Last 6 months</h2>

      <div className="h-[240px]">
        <div
          className="relative"
          style={{ height: `${PLOT_HEIGHT}px` }}
          role="img"
          aria-label={summary}
        >
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute right-0 left-14 border-t border-chart-grid"
              style={{ bottom: `${tick * 100}%` }}
            >
              <span className="num absolute top-0 right-full mr-2 w-12 -translate-y-1/2 text-right text-xs text-chart-axis-ink">
                {formatCompactINR(max * tick)}
              </span>
            </div>
          ))}

          <div className="absolute inset-y-0 right-0 left-14 flex items-end gap-3">
            {points.map((point, index) => {
              const isCurrent = point.month === CURRENT_MONTH && point.year === CURRENT_YEAR
              const height = max > 0 ? (point.total / max) * 100 : 0
              const isFirst = index === 0
              const isLast = index === points.length - 1
              const tooltipPositionClass =
                isFirst === isLast ? 'left-1/2 -translate-x-1/2' : isFirst ? 'left-0' : 'right-0'

              return (
                <button
                  key={`${point.year}-${point.month}`}
                  type="button"
                  aria-label={`${formatMonthYear(point.month, point.year)}: ${formatINR(point.total)}`}
                  className={cn(
                    'group relative min-h-[2px] flex-1 rounded-t-[var(--radius-xs)] transition-[height,background-color] duration-[var(--duration-slow)] ease-[var(--ease-out)]',
                    isCurrent ? 'bg-chart-bar-current' : 'bg-chart-bar',
                  )}
                  style={{ height: `${height}%` }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'num pointer-events-none absolute bottom-full z-10 mb-2 rounded-sm border border-line bg-raised px-2 py-1 text-xs whitespace-nowrap text-ink opacity-0 transition-opacity duration-[var(--duration-fast)] elevation-2 group-hover:opacity-100 group-focus-visible:opacity-100',
                      tooltipPositionClass,
                    )}
                  >
                    {formatMonthYear(point.month, point.year)}: {formatINR(point.total)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className={cn('mt-2 flex gap-3', Y_AXIS_GUTTER)}>
          {points.map((point) => {
            const isCurrent = point.month === CURRENT_MONTH && point.year === CURRENT_YEAR

            return (
              <div key={`${point.year}-${point.month}`} className="flex-1 text-center">
                <span className="text-xs text-chart-axis-ink">
                  {formatMonthShort(point.month, point.year)}
                </span>

                {isCurrent && (
                  <span className="mt-1 block h-0.5 w-full bg-metal" aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>

        <table className="sr-only">
          <caption>Spending by month</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={`${point.year}-${point.month}`}>
                <th scope="row">{formatMonthYear(point.month, point.year)}</th>
                <td>{formatINR(point.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
