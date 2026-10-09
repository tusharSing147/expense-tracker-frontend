import { ApiError } from '../types/api'
import type { DownloadFormat, MonthlyReport, ReportDownload, YearlyReport } from '../types/report'
import { parseFilename } from '../utils/download'
import { api } from './client'

function onlyDefined<T extends Record<string, unknown>>(params: T): Partial<T> {
  const result: Partial<T> = {}

  for (const key of Object.keys(params) as (keyof T)[]) {
    const value = params[key]

    if (value !== undefined) {
      result[key] = value
    }
  }

  return result
}

async function requestDownload(url: string, params: Record<string, unknown>, fallbackName: string): Promise<ReportDownload> {
  const response = await api.get(url, {
    params,
    responseType: 'blob',
    validateStatus: () => true,
  })
  const contentType = String(response.headers['content-type'] ?? '')

  if (response.status !== 200 || contentType.includes('application/json')) {
    const text = await (response.data as Blob).text()
    let body: unknown

    try {
      body = JSON.parse(text)
    } catch {
      body = {}
    }

    throw ApiError.fromBody(response.status, body)
  }

  return {
    blob: response.data as Blob,
    filename: parseFilename(response.headers['content-disposition'], fallbackName),
  }
}

export async function getMonthlyReport(month?: number, year?: number): Promise<MonthlyReport> {
  const response = await api.get<MonthlyReport>('/reports/monthly', {
    params: onlyDefined({ month, year, format: 'json' }),
  })

  return response.data
}

export async function getYearlyReport(year?: number): Promise<YearlyReport> {
  const response = await api.get<YearlyReport>('/reports/yearly', {
    params: onlyDefined({ year, format: 'json' }),
  })

  return response.data
}

export async function downloadMonthlyReport(month: number, year: number, format: DownloadFormat): Promise<ReportDownload> {
  const fallbackName = `expenses-${year}-${String(month).padStart(2, '0')}.${format}`

  return requestDownload('/reports/monthly', { month, year, format }, fallbackName)
}

export async function downloadYearlyReport(year: number, format: DownloadFormat): Promise<ReportDownload> {
  const fallbackName = `expenses-${year}.${format}`

  return requestDownload('/reports/yearly', { year, format }, fallbackName)
}
