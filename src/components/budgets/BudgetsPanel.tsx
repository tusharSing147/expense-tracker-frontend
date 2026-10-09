import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { BudgetFormModal } from './BudgetFormModal'
import { useBudgets, useCopyBudgets, useDeleteBudget } from '../../hooks/useBudgets'
import type { Budget, BudgetStatus } from '../../types/budget'
import { CATEGORIES } from '../../types/expense'
import { formatMoney, formatMonthYear } from '../../utils/format'
import { apiErrorMessage } from '../../utils/errorMessages'

const STATUS_LABELS: Record<BudgetStatus, string> = {
  ok: 'On track',
  warning: 'Warning',
  exceeded: 'Over budget',
}

const STATUS_BADGE_CLASS: Record<BudgetStatus, string> = {
  ok: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  exceeded: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

const STATUS_PROGRESS_CLASS: Record<BudgetStatus, string> = {
  ok: '[&_[data-slot=progress-indicator]]:bg-emerald-500',
  warning: '[&_[data-slot=progress-indicator]]:bg-amber-500',
  exceeded: '[&_[data-slot=progress-indicator]]:bg-red-500',
}

export interface BudgetsPanelProps {
  month: number
  year: number
}

export function BudgetsPanel({ month, year }: BudgetsPanelProps) {
  const { data: budgets = [], isPending, isError, refetch } = useBudgets(month, year)
  const copyMutation = useCopyBudgets()
  const deleteMutation = useDeleteBudget()

  const [banner, setBanner] = useState('')
  const [notice, setNotice] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null)

  const existingCategories = budgets.map((budget) => budget.category)
  const canAdd = CATEGORIES.some((item) => !existingCategories.includes(item))
  const previousMonth = month === 1 ? 12 : month - 1
  const previousYear = month === 1 ? year - 1 : year

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = setTimeout(() => setNotice(''), 5000)

    return () => clearTimeout(timer)
  }, [notice])

  function handleAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function handleEdit(budget: Budget) {
    setEditing(budget)
    setModalOpen(true)
  }

  async function handleCopy() {
    setBanner('')

    try {
      const result = await copyMutation.mutateAsync({
        fromMonth: previousMonth,
        fromYear: previousYear,
        toMonth: month,
        toYear: year,
      })

      setNotice(`Copied ${result.copied} budget(s), skipped ${result.skipped}.`)
    } catch (error) {
      setBanner(apiErrorMessage(error, 'Could not copy budgets'))
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (error) {
      setDeleteTarget(null)
      setBanner(apiErrorMessage(error, 'Could not delete budget'))
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Budgets</h2>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={copyMutation.isPending}
            onClick={handleCopy}
          >
            {copyMutation.isPending && <Spinner />}
            Copy from previous month
          </Button>

          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!canAdd}
            title={canAdd ? undefined : 'All categories already have a budget for this month'}
          >
            Add budget
          </Button>
        </div>
      </div>

      {banner && (
        <div className="mt-4">
          <Alert variant="destructive">{banner}</Alert>
        </div>
      )}

      {notice && (
        <div className="mt-4">
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            {notice}
          </Alert>
        </div>
      )}

      <div className="mt-4">
        {isPending && (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        )}

        {!isPending && isError && (
          <Alert variant="destructive">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>Could not load budgets.</span>
              <Button size="sm" variant="secondary" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          </Alert>
        )}

        {!isPending && !isError && budgets.length === 0 && (
          <Empty className="border border-border px-6 py-12">
            <EmptyHeader>
              <EmptyTitle>No budgets for this month</EmptyTitle>
              <EmptyDescription>
                Set category limits to track your spending against a plan.
              </EmptyDescription>
            </EmptyHeader>

            <Button onClick={handleAdd}>Add budget</Button>
          </Empty>
        )}

        {!isPending && !isError && budgets.length > 0 && (
          <Card className="gap-0 divide-y py-0">
            {budgets.map((budget) => (
              <div key={budget.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="w-28 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {budget.category}
                  </span>
                  <Badge className={STATUS_BADGE_CLASS[budget.status]}>
                    {STATUS_LABELS[budget.status]}
                  </Badge>
                </div>

                <div className="min-w-[180px] flex-1">
                  <Progress
                    value={budget.percentUsed}
                    className={STATUS_PROGRESS_CLASS[budget.status]}
                    aria-label={`${budget.category} budget usage`}
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {formatMoney(budget.spent)} of {formatMoney(budget.limit)}
                    {budget.remaining >= 0 && ` · ${formatMoney(budget.remaining)} left`}
                    {budget.remaining < 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        {` · over by ${formatMoney(Math.abs(budget.remaining))}`}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-24 text-right font-medium tabular-nums">
                    {formatMoney(budget.limit)}
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Edit ${budget.category} budget`}
                    onClick={() => handleEdit(budget)}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${budget.category} budget`}
                    onClick={() => setDeleteTarget(budget)}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <BudgetFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        month={month}
        year={year}
        budget={editing}
        existingCategories={existingCategories}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget ? `Delete ${deleteTarget.category} budget?` : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This removes the limit for ${formatMonthYear(deleteTarget.month, deleteTarget.year)}. Spending is not affected.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? <Spinner /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
