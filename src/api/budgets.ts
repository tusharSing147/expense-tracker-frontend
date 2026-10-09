import type { Budget, BudgetCopyRequest, BudgetCopyResponse, BudgetCreate, BudgetUpdate } from '../types/budget'
import { api } from './client'

export async function listBudgets(month?: number, year?: number): Promise<Budget[]> {
  const params: { month?: number; year?: number } = {}

  if (month !== undefined) {
    params.month = month
  }

  if (year !== undefined) {
    params.year = year
  }

  const response = await api.get<Budget[]>('/budgets', { params })

  return response.data
}

export async function createBudget(data: BudgetCreate): Promise<Budget> {
  const response = await api.post<Budget>('/budgets', data, { silentErrorToast: true })

  return response.data
}

export async function updateBudget(id: string, data: BudgetUpdate): Promise<Budget> {
  const response = await api.patch<Budget>(`/budgets/${id}`, { limit: data.limit }, { silentErrorToast: true })

  return response.data
}

export async function deleteBudget(id: string): Promise<void> {
  await api.delete<void>(`/budgets/${id}`, { silentErrorToast: true })
}

export async function copyBudgets(data: BudgetCopyRequest): Promise<BudgetCopyResponse> {
  const response = await api.post<BudgetCopyResponse>('/budgets/copy', data, { silentErrorToast: true })

  return response.data
}
