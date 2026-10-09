import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toast'
import { createExpense, deleteExpense, listExpenses, updateExpense } from '../api/expenses'
import type { Expense, ExpenseCreate, ExpenseUpdate, ListExpensesParams } from '../types/expense'

async function invalidateExpenseQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['expenses'] })
  await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  await queryClient.invalidateQueries({ queryKey: ['budgets'] })
}

export function useExpenses(params: ListExpensesParams) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => listExpenses(params),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ExpenseCreate) => createExpense(data),
    onSuccess: () => {
      toast.add({ title: 'Expense added', type: 'success' })

      return invalidateExpenseQueries(queryClient)
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseUpdate }) => updateExpense(id, data),
    onSuccess: () => {
      toast.add({ title: 'Expense updated', type: 'success' })

      return invalidateExpenseQueries(queryClient)
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expense: Expense) => deleteExpense(expense.id),
    onSuccess: (_data, expense) => {
      const toastId = toast.add({
        title: 'Expense deleted',
        type: 'success',
        actionProps: {
          children: 'Undo',
          onClick: () => {
            createExpense({
              title: expense.title,
              amount: expense.amount,
              category: expense.category,
              date: expense.date,
              description: expense.description,
            }).then(
              () => {
                toast.close(toastId)

                return invalidateExpenseQueries(queryClient)
              },
              () => {
                toast.add({
                  type: 'error',
                  title: 'Expense not restored',
                  description: 'Add it again from the expenses page.',
                })
              },
            )
          },
        },
      })

      return invalidateExpenseQueries(queryClient)
    },
  })
}
