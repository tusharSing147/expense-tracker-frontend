import { useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { MonthPicker } from '../components/dashboard/MonthPicker'
import { MonthlyReportView } from '../components/reports/MonthlyReportView'
import { YearlyReportView } from '../components/reports/YearlyReportView'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { YearPicker } from '@/components/ui/YearPicker'
import { useMonthlyReport, useYearlyReport } from '../hooks/useReports'

const NOW = new Date()
const CURRENT_UTC_MONTH = NOW.getUTCMonth() + 1
const CURRENT_UTC_YEAR = NOW.getUTCFullYear()

export function ReportsPage() {
  const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly')
  const [month, setMonth] = useState(CURRENT_UTC_MONTH)
  const [year, setYear] = useState(CURRENT_UTC_YEAR)

  const monthly = useMonthlyReport(month, year)
  const yearly = useYearlyReport(year)

  function handleMonthChange(nextMonth: number, nextYear: number) {
    setMonth(nextMonth)
    setYear(nextYear)
  }

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Reports</h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Export your expenses as JSON, CSV or Excel
          </p>
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value)}>
          <div className="flex flex-col gap-4">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center justify-between gap-4">
              {tab === 'monthly' ? (
                <MonthPicker month={month} year={year} onChange={handleMonthChange} />
              ) : (
                <YearPicker year={year} onChange={setYear} min={2000} max={CURRENT_UTC_YEAR} />
              )}
            </div>
          </div>

          <TabsContent value="monthly" className="pt-4">
            {monthly.isPending && (
              <div className="flex justify-center py-16 text-muted-foreground">
                <Spinner className="size-8" />
              </div>
            )}

            {monthly.isError && (
              <div className="flex flex-col items-start gap-4">
                <Alert variant="destructive">Unable to load your report.</Alert>

                <Button variant="secondary" size="sm" onClick={() => monthly.refetch()}>
                  Try again
                </Button>
              </div>
            )}

            {monthly.data && <MonthlyReportView report={monthly.data} />}
          </TabsContent>

          <TabsContent value="yearly" className="pt-4">
            {yearly.isPending && (
              <div className="flex justify-center py-16 text-muted-foreground">
                <Spinner className="size-8" />
              </div>
            )}

            {yearly.isError && (
              <div className="flex flex-col items-start gap-4">
                <Alert variant="destructive">Unable to load your report.</Alert>

                <Button variant="secondary" size="sm" onClick={() => yearly.refetch()}>
                  Try again
                </Button>
              </div>
            )}

            {yearly.data && <YearlyReportView report={yearly.data} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
