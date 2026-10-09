import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import type { TrendPoint } from '../../types/dashboard'
import { formatMoney, formatMonthYear } from '../../utils/format'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

export interface TrendChartProps {
  data: TrendPoint[]
}

interface TrendDatum extends TrendPoint {
  label: string
}

const trendChartConfig = {
  total: {
    label: 'Total spent',
    color: 'var(--chart-1)',
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

export function TrendChart({ data }: TrendChartProps) {
  const points: TrendDatum[] = data.map((point) => ({
    ...point,
    label: formatMonthYear(point.month, point.year).split(' ')[0],
  }))

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Monthly trend</h2>

        <p className="text-xs text-gray-500 dark:text-gray-400">Last 6 months</p>
      </div>

      <ChartContainer config={trendChartConfig} className="aspect-auto h-[260px]">
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
                  const point = payload[0]?.payload as TrendDatum | undefined

                  return point ? formatMonthYear(point.month, point.year) : null
                }}
                formatter={(value) => (
                  <span className="font-medium tabular-nums text-foreground">
                    {formatMoney(typeof value === 'number' ? value : 0)}
                  </span>
                )}
              />
            }
          />
          <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ChartContainer>
    </section>
  )
}
