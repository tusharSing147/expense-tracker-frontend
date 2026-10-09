import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../api/dashboard'

export function useDashboardSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', month, year],
    queryFn: () => getDashboardSummary(month, year),
  })
}
