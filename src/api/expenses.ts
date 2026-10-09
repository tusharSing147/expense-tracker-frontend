import type { Expense, ExpenseCreate, ExpenseListResponse, ExpenseUpdate, ListExpensesParams } from '../types/expense'
import { api } from './client'

export async function listExpenses(params: ListExpensesParams = {}): Promise<ExpenseListResponse> {
  const { category, ...rest } = params
  const query: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      query[key] = value
    }
  }

  if (category && category.length > 0) {
    query.category = category.join(',')
  }

  const response = await api.get<ExpenseListResponse>('/expenses', { params: query })

  return response.data
}

export async function createExpense(data: ExpenseCreate): Promise<Expense> {
  const response = await api.post<Expense>('/expenses', data, { silentErrorToast: true })

  return response.data
}

export async function getExpense(id: string): Promise<Expense> {
  const response = await api.get<Expense>(`/expenses/${id}`)

  return response.data
}

export async function updateExpense(id: string, data: ExpenseUpdate): Promise<Expense> {
  const body: ExpenseUpdate = {}

  if (data.title !== undefined) {
    body.title = data.title
  }

  if (data.amount !== undefined) {
    body.amount = data.amount
  }

  if (data.category !== undefined) {
    body.category = data.category
  }

  if (data.date !== undefined) {
    body.date = data.date
  }

  if (data.description !== undefined) {
    body.description = data.description
  }

  const response = await api.patch<Expense>(`/expenses/${id}`, body, { silentErrorToast: true })

  return response.data
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete<void>(`/expenses/${id}`, { silentErrorToast: true })
}
