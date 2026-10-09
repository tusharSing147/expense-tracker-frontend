import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toast'
import { copyBudgets, createBudget, deleteBudget, listBudgets, updateBudget } from '../api/budgets'
import type { BudgetCopyRequest, BudgetCreate, BudgetUpdate } from '../types/budget'
import { formatMonthYear } from '../utils/format'

async function invalidateBudgetQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['budgets'] })
  await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
}

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => listBudgets(month, year),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BudgetCreate) => createBudget(data),
    onSuccess: () => {
      toast.add({ title: 'Budget created', type: 'success' })

      return invalidateBudgetQueries(queryClient)
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetUpdate }) => updateBudget(id, data),
    onSuccess: () => {
      toast.add({ title: 'Budget updated', type: 'success' })

      return invalidateBudgetQueries(queryClient)
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      toast.add({ title: 'Budget deleted', type: 'success' })

      return invalidateBudgetQueries(queryClient)
    },
  })
}

export function useCopyBudgets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BudgetCopyRequest) => copyBudgets(data),
    onSuccess: (_data, variables) => {
      toast.add({
        title: 'Budgets copied',
        description: `Copied to ${formatMonthYear(variables.toMonth, variables.toYear)}`,
        type: 'success',
      })

      return invalidateBudgetQueries(queryClient)
    },
  })
}
