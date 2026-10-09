import type { DashboardSummary } from '../types/dashboard'
import { api } from './client'

export async function getDashboardSummary(month?: number, year?: number): Promise<DashboardSummary> {
  const params: { month?: number; year?: number } = {}

  if (month !== undefined) {
    params.month = month
  }

  if (year !== undefined) {
    params.year = year
  }

  const response = await api.get<DashboardSummary>('/dashboard/summary', { params })

  return response.data
}
