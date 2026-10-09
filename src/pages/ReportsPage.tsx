import { useState } from 'react'
import { DownloadIcon } from 'lucide-react'
import { downloadMonthlyReport, downloadYearlyReport } from '../api/reports'
import { AppHeader } from '../components/AppHeader'
import { MonthPicker } from '../components/dashboard/MonthPicker'
import { MonthlyReportView } from '../components/reports/MonthlyReportView'
import { YearlyReportView } from '../components/reports/YearlyReportView'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { YearPicker } from '@/components/ui/YearPicker'
import type { DownloadFormat } from '../types/report'
import { cn } from '@/lib/utils'
import { saveBlob } from '../utils/download'
import { apiErrorMessage } from '../utils/errorMessages'
import { useMonthlyReport, useYearlyReport } from '../hooks/useReports'

const NOW = new Date()
const CURRENT_UTC_MONTH = NOW.getUTCMonth() + 1
const CURRENT_UTC_YEAR = NOW.getUTCFullYear()

const ERROR_PANEL_CLASS =
  'rounded-md border border-[color-mix(in_srgb,var(--color-negative)_35%,transparent)] bg-negative-soft p-[var(--space-5)] text-sm text-negative-ink'

function ReportError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className={ERROR_PANEL_CLASS}>
      <p>Couldn&apos;t load the report. Check your connection and try again.</p>

      <Button variant="outline" className="mt-[var(--space-4)]" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-[var(--space-7)]" role="status" aria-label="Loading report">
      <div className="grid grid-cols-1 rounded-md border border-line bg-surface elevation-1 sm:grid-cols-3">
        {[0, 1, 2].map((cell) => (
          <div
            key={cell}
            className={cn(
              'p-[var(--space-6)]',
              cell > 0 && 'border-t border-line sm:border-t-0 sm:border-l',
            )}
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-36" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-line bg-surface elevation-1">
        <div className="flex h-9 items-center gap-6 bg-surface-sunken px-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>

        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex h-[52px] items-center gap-6 border-t border-line px-4">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReportsPage() {
  const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly')
  const [month, setMonth] = useState(CURRENT_UTC_MONTH)
  const [year, setYear] = useState(CURRENT_UTC_YEAR)
  const [busy, setBusy] = useState<DownloadFormat | 'json' | null>(null)
  const [downloadError, setDownloadError] = useState('')

  const monthly = useMonthlyReport(month, year)
  const yearly = useYearlyReport(year)

  const activeReport = tab === 'monthly' ? monthly.data : yearly.data

  function handleTabChange(value: 'monthly' | 'yearly') {
    setTab(value)
    setDownloadError('')
  }

  function handleMonthChange(nextMonth: number, nextYear: number) {
    setMonth(nextMonth)
    setYear(nextYear)
    setDownloadError('')
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear)
    setDownloadError('')
  }

  async function handleDownload(kind: DownloadFormat | 'json') {
    if (busy || !activeReport) {
      return
    }

    setBusy(kind)
    setDownloadError('')

    try {
      if (tab === 'monthly') {
        const report = monthly.data

        if (!report) {
          return
        }

        if (kind === 'json') {
          const monthLabel = String(report.period.month).padStart(2, '0')

          saveBlob(
            new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
            `expenses-${report.period.year}-${monthLabel}.json`,
          )
        } else {
          const { blob, filename } = await downloadMonthlyReport(
            report.period.month,
            report.period.year,
            kind,
          )

          saveBlob(blob, filename)
        }
      } else {
        const report = yearly.data

        if (!report) {
          return
        }

        if (kind === 'json') {
          saveBlob(
            new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
            `expenses-${report.period.year}.json`,
          )
        } else {
          const { blob, filename } = await downloadYearlyReport(report.period.year, kind)

          saveBlob(blob, filename)
        }
      }
    } catch (error) {
      setDownloadError(
        apiErrorMessage(error, 'The report could not be downloaded. Check your connection and try again.'),
      )
    } finally {
      setBusy(null)
    }
  }

  const downloadDisabled = busy !== null || !activeReport

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="page flex flex-col gap-[var(--space-7)] py-[var(--space-5)]">
        <div>
          <h1 className="font-display text-xl font-medium tracking-[var(--tracking-display)] text-ink">
            Reports
          </h1>

          <p className="mt-1 text-sm text-ink-muted">
            {tab === 'monthly'
              ? 'See how your spending adds up, month by month.'
              : 'See how your spending adds up across the year.'}
          </p>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-[var(--space-4)]">
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>

              {tab === 'monthly' ? (
                <MonthPicker month={month} year={year} onChange={handleMonthChange} />
              ) : (
                <YearPicker
                  year={year}
                  onChange={handleYearChange}
                  min={2000}
                  max={CURRENT_UTC_YEAR}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Download report">
              <Button
                variant="outline"
                disabled={downloadDisabled}
                onClick={() => handleDownload('csv')}
              >
                {busy === 'csv' ? <Spinner /> : <DownloadIcon className="h-4 w-4" />}
                CSV
              </Button>

              <Button
                variant="outline"
                disabled={downloadDisabled}
                onClick={() => handleDownload('xlsx')}
              >
                {busy === 'xlsx' ? <Spinner /> : <DownloadIcon className="h-4 w-4" />}
                Excel
              </Button>

              <Button
                variant="outline"
                disabled={downloadDisabled}
                onClick={() => handleDownload('json')}
              >
                {busy === 'json' ? <Spinner /> : <DownloadIcon className="h-4 w-4" />}
                JSON
              </Button>
            </div>
          </div>

          {downloadError && (
            <div role="alert" className={ERROR_PANEL_CLASS}>
              {downloadError}
            </div>
          )}

          <TabsContent value="monthly" className="pt-[var(--space-5)]">
            {monthly.data && <MonthlyReportView report={monthly.data} />}

            {!monthly.data && monthly.isError && (
              <ReportError onRetry={() => void monthly.refetch()} />
            )}

            {!monthly.data && !monthly.isError && <ReportSkeleton />}
          </TabsContent>

          <TabsContent value="yearly" className="pt-[var(--space-5)]">
            {yearly.data && <YearlyReportView report={yearly.data} />}

            {!yearly.data && yearly.isError && (
              <ReportError onRetry={() => void yearly.refetch()} />
            )}

            {!yearly.data && !yearly.isError && <ReportSkeleton />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
