import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../api/meta'
import type { Category } from '../types/expense'
import { CATEGORIES } from '../types/expense'

export function useCategories(): Category[] {
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: Infinity,
  })

  return data ?? [...CATEGORIES]
}
