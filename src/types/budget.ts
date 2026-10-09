import type { Category } from './expense'

export type BudgetStatus = 'ok' | 'warning' | 'exceeded'

export interface Budget {
  id: string
  category: Category
  limit: number
  month: number
  year: number
  spent: number
  remaining: number
  percentUsed: number
  status: BudgetStatus
}

export interface BudgetCreate {
  category: Category
  limit: number
  month: number
  year: number
}

export interface BudgetUpdate {
  limit: number
}

export interface BudgetCopyRequest {
  fromMonth: number
  fromYear: number
  toMonth: number
  toYear: number
}

export interface BudgetCopyResponse {
  copied: number
  skipped: number
}
