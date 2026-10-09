import { useQuery } from '@tanstack/react-query'
import { getMonthlyReport, getYearlyReport } from '../api/reports'

export function useMonthlyReport(month: number, year: number) {
  return useQuery({
    queryKey: ['report', 'monthly', month, year],
    queryFn: () => getMonthlyReport(month, year),
  })
}

export function useYearlyReport(year: number) {
  return useQuery({
    queryKey: ['report', 'yearly', year],
    queryFn: () => getYearlyReport(year),
  })
}
