import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { AppHeader } from '../components/AppHeader'
import { BudgetsPanel } from '../components/budgets/BudgetsPanel'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { MonthPicker } from '../components/dashboard/MonthPicker'
import { RecentExpenses } from '../components/dashboard/RecentExpenses'
import { StatCard } from '../components/dashboard/StatCard'
import { TrendChart } from '../components/dashboard/TrendChart'
import { useDashboardSummary } from '../hooks/useDashboard'
import { formatMoney, formatMonthYear } from '../utils/format'

const NOW = new Date()
const CURRENT_UTC_MONTH = NOW.getUTCMonth() + 1
const CURRENT_UTC_YEAR = NOW.getUTCFullYear()

export function DashboardPage() {
  const [month, setMonth] = useState(CURRENT_UTC_MONTH)
  const [year, setYear] = useState(CURRENT_UTC_YEAR)

  const { data, isPending, isError, refetch } = useDashboardSummary(month, year)

  function handleMonthChange(nextMonth: number, nextYear: number) {
    setMonth(nextMonth)
    setYear(nextYear)
  }

  function handleRetry() {
    refetch()
  }

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {formatMonthYear(month, year)}
            </p>
          </div>

          <MonthPicker month={month} year={year} onChange={handleMonthChange} />
        </div>

        {isPending && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Spinner className="size-8" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-start gap-4">
            <Alert variant="destructive">
              <AlertDescription>Unable to load your dashboard summary.</AlertDescription>
            </Alert>

            <Button variant="secondary" size="sm" onClick={handleRetry}>
              Try again
            </Button>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total spent" value={formatMoney(data.totalSpent)} />

              <StatCard
                label="Total budget"
                value={data.totalBudget === 0 ? '—' : formatMoney(data.totalBudget)}
              />

              <StatCard
                label="Remaining budget"
                value={data.totalBudget === 0 ? '—' : formatMoney(data.remainingBudget)}
                tone={data.overBudget ? 'danger' : 'success'}
                hint={data.overBudget ? 'Over budget' : undefined}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-5 lg:col-span-2">
                <TrendChart data={data.monthlyTrend} />
              </Card>

              <RecentExpenses items={data.recentExpenses} />
            </div>

            <CategoryBreakdown rows={data.categories} />

            <BudgetsPanel month={month} year={year} />
          </div>
        )}
      </main>
    </div>
  )
}
