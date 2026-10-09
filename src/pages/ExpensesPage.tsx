import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReceiptTextIcon } from 'lucide-react'
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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
import { formatMoney } from '../utils/format'

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

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleOpenCreate() {
    setBanner('')
    setEditing(null)
    setFormOpen(true)
  }

  function handleOpenEdit(expense: Expense) {
    setBanner('')
    setEditing(expense)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
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
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch (error) {
      setDeleting(null)
      setBanner(apiErrorMessage(error, 'Unable to delete the expense. Please try again.'))
    }
  }

  function handleRetry() {
    refetch()
  }

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Expenses</h1>

          <Button onClick={handleOpenCreate}>Add expense</Button>
        </div>

        <ExpensesFilters
          value={filters}
          onChange={handleFilterChange}
          onResetPage={handleResetPage}
          onClear={handleClearFilters}
        />

        {banner && <Alert variant="destructive">{banner}</Alert>}

        {data && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.meta.total} {data.meta.total === 1 ? 'expense' : 'expenses'} · total{' '}
            {formatMoney(data.totals.sumAmount)}
          </p>
        )}

        {isPending && (
          <div className="flex justify-center py-16">
            <Spinner className="size-7 text-violet-600" />
          </div>
        )}

        {!isPending && isError && (
          <Alert variant="destructive">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>Unable to load expenses. Please try again.</span>

              <Button variant="secondary" size="sm" onClick={handleRetry}>
                Try again
              </Button>
            </div>
          </Alert>
        )}

        {!isPending && !isError && data && data.data.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptTextIcon />
              </EmptyMedia>

              <EmptyTitle>No expenses found</EmptyTitle>
              <EmptyDescription>Add your first expense or adjust the filters.</EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              {hasDefaultFilters(filters) ? (
                <Button onClick={handleOpenCreate}>Add expense</Button>
              ) : (
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </EmptyContent>
          </Empty>
        )}

        {!isPending && !isError && data && data.data.length > 0 && (
          <>
            <ExpenseTable
              items={data.data}
              sumAmount={data.totals.sumAmount}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDeleteRequest}
            />

            <Pagination
              page={data.meta.page}
              totalPages={Math.max(data.meta.totalPages, 1)}
              onPageChange={handlePageChange}
            />
          </>
        )}

        <ExpenseFormModal open={formOpen} onClose={handleCloseForm} expense={editing} />

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
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
