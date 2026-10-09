import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { CategoryLedger } from '../components/dashboard/CategoryLedger'
import { MonthPicker } from '../components/dashboard/MonthPicker'
import { RecentExpenses } from '../components/dashboard/RecentExpenses'
import { SummaryPanel } from '../components/dashboard/SummaryPanel'
import { TrendChart } from '../components/dashboard/TrendChart'
import { useDashboardSummary } from '../hooks/useDashboard'

const NOW = new Date()
const CURRENT_UTC_MONTH = NOW.getUTCMonth() + 1
const CURRENT_UTC_YEAR = NOW.getUTCFullYear()

export function DashboardPage() {
  const [month, setMonth] = useState(CURRENT_UTC_MONTH)
  const [year, setYear] = useState(CURRENT_UTC_YEAR)

  const { data, isPending, isError, refetch } = useDashboardSummary(month, year)

  const budgetedRows = data ? data.categories.filter((row) => row.budget !== null) : []
  const budgetedSpent = budgetedRows.reduce((sum, row) => sum + row.spent, 0)

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

      <main className="page flex flex-col gap-[var(--space-7)] py-[var(--space-5)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-xl font-medium tracking-[var(--tracking-display)] text-ink">
            Dashboard
          </h1>

          <MonthPicker month={month} year={year} onChange={handleMonthChange} />
        </div>

        {isPending && (
          <div className="flex flex-col gap-[var(--space-5)]" aria-hidden="true">
            <div className="h-[180px] animate-shimmer rounded-md bg-surface-sunken" />

            <div className="grid grid-cols-1 gap-[var(--space-5)] lg:grid-cols-12">
              <div className="h-[240px] animate-shimmer rounded-md bg-surface-sunken lg:col-span-8" />

              <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-[var(--space-4)] elevation-1 lg:col-span-4">
                <div className="h-14 animate-shimmer rounded-sm bg-surface-sunken" />
                <div className="h-14 animate-shimmer rounded-sm bg-surface-sunken" />
                <div className="h-14 animate-shimmer rounded-sm bg-surface-sunken" />
                <div className="h-14 animate-shimmer rounded-sm bg-surface-sunken" />
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-[color-mix(in_srgb,var(--color-negative)_35%,transparent)] bg-negative-soft p-[var(--space-5)] text-sm text-negative-ink">
            <p>Couldn&apos;t load your dashboard. Check your connection and try again.</p>

            <Button variant="secondary" className="mt-[var(--space-4)] h-[38px]" onClick={handleRetry}>
              Try again
            </Button>
          </div>
        )}

        {data && (
          <>
            <SummaryPanel
              leftToSpent={data.remainingBudget}
              spent={budgetedSpent}
              budgeted={data.totalBudget}
              outsideBudgets={data.totalSpent - budgetedSpent}
              budgetedCategoryCount={budgetedRows.length}
            />

            <div className="grid grid-cols-1 gap-[var(--space-5)] lg:grid-cols-12">
              <div className="lg:col-span-8">
                <TrendChart data={data.monthlyTrend} />
              </div>

              <div className="lg:col-span-4">
                <RecentExpenses items={data.recentExpenses} />
              </div>
            </div>

            <CategoryLedger rows={data.categories} month={month} year={year} />
          </>
        )}
      </main>
    </div>
  )
}
