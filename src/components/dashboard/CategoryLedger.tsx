import { useEffect, useState } from 'react'
import { PencilIcon, TrashIcon } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
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
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { BudgetFormModal } from '../budgets/BudgetFormModal'
import { useBudgets, useCopyBudgets, useDeleteBudget } from '../../hooks/useBudgets'
import { useCategories } from '../../hooks/useCategories'
import type { Budget } from '../../types/budget'
import type { DashboardCategoryRow } from '../../types/dashboard'
import type { Category } from '../../types/expense'
import { formatINR, formatMonthYear } from '../../utils/format'
import { apiErrorMessage } from '../../utils/errorMessages'
import { compareByStatus, getBudgetStatus, type StatusTone } from '../../utils/status'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const BADGE_VARIANT_BY_TONE: Record<StatusTone, BadgeVariant> = {
  ok: 'ok',
  warn: 'warn',
  over: 'over',
  neutral: 'neutral',
}

const REMAINING_TONE_CLASS: Record<StatusTone, string> = {
  ok: 'text-positive-ink',
  warn: 'text-caution-ink',
  over: 'text-negative-ink',
  neutral: 'text-ink-muted',
}

const ACTION_BUTTON_CLASS =
  'flex h-10 w-10 items-center justify-center rounded-sm text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-line hover:text-ink sm:h-8 sm:w-8'

export interface CategoryLedgerProps {
  rows: DashboardCategoryRow[]
  month: number
  year: number
}

export function CategoryLedger({ rows, month, year }: CategoryLedgerProps) {
  const { data: budgets = [], isPending: budgetsPending, isError: budgetsError, refetch: refetchBudgets } = useBudgets(month, year)
  const categories = useCategories()
  const copyMutation = useCopyBudgets()
  const deleteMutation = useDeleteBudget()

  const [banner, setBanner] = useState('')
  const [notice, setNotice] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [creatingCategory, setCreatingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null)

  const existingCategories = budgets.map((budget) => budget.category)
  const canAdd = categories.some((item) => !existingCategories.includes(item))
  const previousMonth = month === 1 ? 12 : month - 1
  const previousYear = month === 1 ? year - 1 : year

  const entries = rows
    .map((row, index) => ({
      row,
      index,
      status: getBudgetStatus(row.spent, row.budget),
      budgetRecord: budgets.find((budget) => budget.category === row.category),
    }))
    .sort((a, b) => compareByStatus(a.status, b.status) || a.index - b.index)

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = setTimeout(() => setNotice(''), 5000)

    return () => clearTimeout(timer)
  }, [notice])

  function handleAdd() {
    setEditing(null)
    setCreatingCategory(null)
    setModalOpen(true)
  }

  function handleSetBudget(category: Category) {
    setEditing(null)
    setCreatingCategory(category)
    setModalOpen(true)
  }

  function handleEdit(budget: Budget) {
    setEditing(budget)
    setCreatingCategory(null)
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

      setNotice(
        `Copied ${result.copied} ${result.copied === 1 ? 'budget' : 'budgets'}, skipped ${result.skipped}.`,
      )
    } catch (error) {
      setBanner(apiErrorMessage(error, 'Could not copy budgets'))
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deleteTarget)
      setDeleteTarget(null)
    } catch (error) {
      setDeleteTarget(null)
      setBanner(apiErrorMessage(error, 'Could not delete budget'))
    }
  }

  const addDisabledHint = canAdd ? undefined : 'All categories already have a budget for this month'

  return (
    <section>
      <div className="mb-[var(--space-4)] flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">Categories</h2>

        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={copyMutation.isPending} onClick={handleCopy}>
            {copyMutation.isPending && <Spinner />}
            Copy from previous month
          </Button>

          <Button onClick={handleAdd} disabled={!canAdd} title={addDisabledHint}>
            Add budget
          </Button>
        </div>
      </div>

      {banner && (
        <Alert variant="destructive" className="mb-[var(--space-4)]">
          {banner}
        </Alert>
      )}

      {notice && (
        <Alert className="mb-[var(--space-4)] border-[color-mix(in_srgb,var(--color-positive)_35%,transparent)] bg-positive-soft text-positive-ink">
          {notice}
        </Alert>
      )}

      {budgetsError && (
        <Alert variant="destructive" className="mb-[var(--space-4)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Could not load budgets.</span>

            <Button variant="secondary" onClick={() => refetchBudgets()}>
              Try again
            </Button>
          </div>
        </Alert>
      )}

      {rows.length === 0 && budgetsPending && (
        <div className="flex items-center justify-center rounded-md border border-line bg-surface py-[var(--space-6)] elevation-1">
          <Spinner />
        </div>
      )}

      {rows.length === 0 && !budgetsPending && !budgetsError && (
        <div className="rounded-md border border-line bg-surface p-[var(--space-6)] text-center elevation-1">
          <p className="text-sm text-ink-muted">No budgets for this month yet.</p>

          <Button className="mt-4" onClick={handleAdd} disabled={!canAdd} title={addDisabledHint}>
            Add budget
          </Button>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-md border border-line bg-surface elevation-1">
          <div className="hidden h-9 items-center gap-3 bg-surface-sunken px-[var(--space-4)] text-xs font-medium text-ink-muted sm:grid sm:grid-cols-[minmax(0,1fr)_96px_96px_128px]">
            <span>Category</span>
            <span className="text-right">Spent</span>
            <span className="text-right">Budget</span>
            <span className="text-right">Status</span>
          </div>

          <ul>
            {entries.map(({ row, status, budgetRecord }) => (
              <li
                key={row.category}
                className="group border-t border-line px-[var(--space-4)] py-3 transition-colors duration-[var(--duration-fast)] first:border-t-0 hover:bg-surface-sunken"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink" title={row.category}>
                      {row.category}
                    </p>

                    <span className="num hidden w-24 shrink-0 text-right text-sm text-ink sm:block">
                      {formatINR(row.spent)}
                    </span>

                    <span className="hidden w-24 shrink-0 text-right text-sm sm:block">
                      {row.budget !== null ? (
                        <span className="num text-ink">{formatINR(row.budget)}</span>
                      ) : (
                        <span className="text-xs text-ink-muted">No budget</span>
                      )}
                    </span>

                    <span className="flex w-32 shrink-0 justify-end">
                      {row.budget !== null ? (
                        <Badge variant={BADGE_VARIANT_BY_TONE[status.tone]}>{status.label}</Badge>
                      ) : (
                        <Button variant="quiet" onClick={() => handleSetBudget(row.category)}>
                          Set budget
                        </Button>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-ink-muted sm:hidden">
                    <span className="num">{formatINR(row.spent)}</span>
                    {row.budget !== null && (
                      <>
                        {' of '}
                        <span className="num">{formatINR(row.budget)}</span>
                      </>
                    )}
                  </p>

                  {row.budget !== null && (
                    <div className="flex items-center gap-3">
                      <Progress
                        tone={status.tone}
                        value={status.displayPercent}
                        aria-label={`${row.category} budget used`}
                        aria-valuenow={Math.round(status.displayPercent)}
                        aria-valuetext={
                          status.remainingText
                            ? `${status.label}, ${status.remainingText}`
                            : status.label
                        }
                        className="min-w-0 flex-1"
                      />

                      <span
                        className={cn(
                          'num w-[110px] shrink-0 text-right text-xs',
                          REMAINING_TONE_CLASS[status.tone],
                        )}
                      >
                        {status.remainingText}
                      </span>

                      {budgetRecord && (
                        <div className="flex shrink-0 items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                          <button
                            type="button"
                            className={ACTION_BUTTON_CLASS}
                            aria-label={`Edit budget for ${row.category}`}
                            onClick={() => handleEdit(budgetRecord)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            className={ACTION_BUTTON_CLASS}
                            aria-label={`Delete budget for ${row.category}`}
                            onClick={() => setDeleteTarget(budgetRecord)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <BudgetFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        month={month}
        year={year}
        budget={editing}
        existingCategories={existingCategories}
        defaultCategory={creatingCategory ?? undefined}
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
              {deleteMutation.isPending ? <Spinner /> : 'Delete budget'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
