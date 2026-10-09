import type { BudgetStatus } from './budget'
import type { Category } from './expense'

export interface DashboardCategoryRow {
  category: Category
  spent: number
  budget: number | null
  remaining: number | null
  percentUsed: number | null
  status: BudgetStatus | null
}

export interface RecentExpense {
  id: string
  title: string
  amount: number
  category: Category
  date: string
  description: string | null
  createdAt: string
}

export interface TrendPoint {
  month: number
  year: number
  total: number
}

export interface DashboardSummary {
  period: { month: number; year: number }
  totalSpent: number
  totalBudget: number
  remainingBudget: number
  overBudget: boolean
  categories: DashboardCategoryRow[]
  recentExpenses: RecentExpense[]
  monthlyTrend: TrendPoint[]
}
