import { useCallback, useEffect, useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { AppHeader } from '../components/AppHeader'
import { Pagination } from '../components/Pagination'
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal'
import { ExpensesFilters } from '../components/expenses/ExpensesFilters'
import type { FilterValue } from '../components/expenses/ExpensesFilters'
import { ExpenseTable } from '../components/expenses/ExpenseTable'
import { useDeleteExpense, useExpenses } from '../hooks/useExpenses'
import type { Expense, ListExpensesParams } from '../types/expense'
import { apiErrorMessage } from '../utils/errorMessages'
import { formatINR } from '../utils/format'

const DEFAULT_FILTERS: FilterValue = {
  search: '',
  category: [],
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  order: 'desc',
}

function parseAmount(raw: string): number | undefined {
  if (raw === '') {
    return undefined
  }

  const value = Number(raw)

  if (Number.isNaN(value) || value < 0) {
    return undefined
  }

  return value
}

function hasDefaultFilters(filters: FilterValue): boolean {
  return (
    filters.search.trim() === '' &&
    filters.category.length === 0 &&
    filters.startDate === '' &&
    filters.endDate === '' &&
    filters.minAmount === '' &&
    filters.maxAmount === '' &&
    filters.sortBy === 'date' &&
    filters.order === 'desc'
  )
}

export function ExpensesPage() {
  const [filters, setFilters] = useState<FilterValue>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [duplicating, setDuplicating] = useState<Expense | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Expense | null>(null)
  const [banner, setBanner] = useState('')

  const params = useMemo<ListExpensesParams>(() => {
    const next: ListExpensesParams = { page, sortBy: filters.sortBy, order: filters.order }
    const search = filters.search.trim()

    if (search) {
      next.search = search
    }

    if (filters.category.length > 0) {
      next.category = filters.category
    }

    if (filters.startDate) {
      next.startDate = filters.startDate
    }

    if (filters.endDate) {
      next.endDate = filters.endDate
    }

    if (next.startDate && next.endDate && next.startDate > next.endDate) {
      delete next.startDate
      delete next.endDate
    }

    const minAmount = parseAmount(filters.minAmount)

    if (minAmount !== undefined) {
      next.minAmount = minAmount
    }

    const maxAmount = parseAmount(filters.maxAmount)

    if (maxAmount !== undefined) {
      next.maxAmount = maxAmount
    }

    return next
  }, [filters, page])

  const { data, isPending, isError, refetch } = useExpenses(params)
  const deleteMutation = useDeleteExpense()

  useEffect(() => {
    if (data && data.meta.totalPages === 0 && page > 1) {
      const timer = setTimeout(() => {
        setPage(1)
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [data, page])

  const handleFilterChange = useCallback((patch: Partial<FilterValue>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }, [])

  const handleResetPage = useCallback(() => {
    setPage(1)
  }, [])

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  function handleSortToggle(column: 'date' | 'amount') {
    const order: 'asc' | 'desc' = filters.sortBy === column && filters.order === 'desc' ? 'asc' : 'desc'

    handleFilterChange({ sortBy: column, order })
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleOpenCreate() {
    setBanner('')
    setEditing(null)
    setDuplicating(null)
    setFormOpen(true)
  }

  function handleOpenEdit(expense: Expense) {
    setBanner('')
    setEditing(expense)
    setDuplicating(null)
    setFormOpen(true)
  }

  function handleDuplicate(expense: Expense) {
    setBanner('')
    setEditing(null)
    setDuplicating(expense)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setDuplicating(null)
  }

  function handleOpenDeleteRequest(expense: Expense) {
    setBanner('')
    setDeleting(expense)
  }

  function handleCloseDeleteDialog() {
    if (deleteMutation.isPending) {
      return
    }

    setDeleting(null)
  }

  async function handleConfirmDelete() {
    if (!deleting) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deleting)
      setDeleting(null)
    } catch (error) {
      setDeleting(null)
      setBanner(apiErrorMessage(error, 'Unable to delete the expense. Please try again.'))
    }
  }

  function handleRetry() {
    refetch()
  }

  const showTable = !isError && (isPending || (data !== undefined && data.data.length > 0))
  const showEmpty = !isPending && !isError && data !== undefined && data.data.length === 0

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="page flex flex-col gap-[var(--space-5)] py-[var(--space-5)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-xl font-medium tracking-[var(--tracking-display)] text-ink">
            Expenses
          </h1>

          <Button onClick={handleOpenCreate}>
            <PlusIcon data-icon="inline-start" />
            Add expense
          </Button>
        </div>

        <ExpensesFilters
          value={filters}
          onChange={handleFilterChange}
          onResetPage={handleResetPage}
          onClear={handleClearFilters}
        />

        {data !== undefined && data.meta.total > 0 && (
          <p className="text-sm text-ink-muted">
            {data.meta.total} {data.meta.total === 1 ? 'expense' : 'expenses'} totalling{' '}
            <span className="num">{formatINR(data.totals.sumAmount)}</span>
          </p>
        )}

        {banner && <Alert variant="destructive">{banner}</Alert>}

        {!isPending && isError && (
          <div className="rounded-md border border-[color-mix(in_srgb,var(--color-negative)_35%,transparent)] bg-negative-soft p-[var(--space-5)] text-sm text-negative-ink">
            <p>Couldn&apos;t load expenses. Check your connection and try again.</p>

            <Button
              variant="outline"
              className="mt-[var(--space-4)]"
              onClick={handleRetry}
            >
              Try again
            </Button>
          </div>
        )}

        {showEmpty && (
          <div className="mx-auto flex max-w-[60ch] flex-col items-center gap-[var(--space-4)] py-[var(--space-7)] text-center">
            <p className="text-base text-ink">
              {hasDefaultFilters(filters)
                ? 'No expenses yet. Add your first expense.'
                : 'No expenses match these filters.'}
            </p>

            {hasDefaultFilters(filters) ? (
              <Button onClick={handleOpenCreate}>
                <PlusIcon data-icon="inline-start" />
                Add expense
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {showTable && (
          <>
            <ExpenseTable
              items={data?.data ?? []}
              sumAmount={data?.totals.sumAmount ?? 0}
              loading={isPending}
              sortBy={filters.sortBy}
              order={filters.order}
              onSortToggle={handleSortToggle}
              onEdit={handleOpenEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleOpenDeleteRequest}
            />

            {!isPending && data && (
              <Pagination
                page={data.meta.page}
                totalPages={Math.max(data.meta.totalPages, 1)}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        <ExpenseFormModal
          open={formOpen}
          onClose={handleCloseForm}
          expense={editing}
          prefill={duplicating}
        />

        <AlertDialog
          open={Boolean(deleting)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              handleCloseDeleteDialog()
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete expense</AlertDialogTitle>
              <AlertDialogDescription>
                {deleting ? `Delete "${deleting.title}"? This cannot be undone.` : null}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>

              <AlertDialogAction
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={handleConfirmDelete}
              >
                {deleteMutation.isPending && <Spinner data-icon="inline-start" />}
                Delete expense
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
