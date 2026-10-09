export const CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Health', 'Entertainment', 'Shopping', 'Education', 'Travel', 'Other'] as const
export type Category = (typeof CATEGORIES)[number]
export interface Expense { id: string; title: string; amount: number; category: Category; date: string; description: string | null; createdAt: string; updatedAt: string }
export interface ExpenseCreate { title: string; amount: number; category: Category; date: string; description?: string | null }
export interface ExpenseUpdate { title?: string; amount?: number; category?: Category; date?: string; description?: string | null }
export interface ListExpensesParams { page?: number; limit?: number; startDate?: string; endDate?: string; category?: Category[]; minAmount?: number; maxAmount?: number; search?: string; sortBy?: 'date' | 'amount' | 'createdAt'; order?: 'asc' | 'desc' }
export interface ExpenseListResponse { data: Expense[]; meta: { page: number; limit: number; total: number; totalPages: number }; totals: { sumAmount: number } }
