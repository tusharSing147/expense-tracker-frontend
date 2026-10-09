import type { Category } from './expense'

export type ReportFormat = 'json' | 'csv' | 'xlsx'
export type DownloadFormat = 'csv' | 'xlsx'
export interface ReportExpenseRow { id: string; date: string; title: string; category: Category; amount: number; description: string | null; createdAt: string }
export interface MonthlyCategoryTotal { category: Category; spent: number; budget: number | null; remaining: number | null }
export interface MonthlyReport { period: { month: number; year: number }; expenses: ReportExpenseRow[]; categoryTotals: MonthlyCategoryTotal[]; total: number }
export interface YearlyMonthlyTotal { month: number; total: number; budget: number }
export interface YearlyCategoryTotal { category: Category; total: number }
export interface YearlyReport { period: { year: number }; monthlyTotals: YearlyMonthlyTotal[]; categoryTotals: YearlyCategoryTotal[]; grandTotal: number }
export interface ReportDownload { blob: Blob; filename: string }
