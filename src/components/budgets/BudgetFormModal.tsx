import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useCreateBudget, useUpdateBudget } from '../../hooks/useBudgets'
import type { Budget } from '../../types/budget'
import type { Category } from '../../types/expense'
import { CATEGORIES } from '../../types/expense'
import { formatMonthYear } from '../../utils/format'
import { apiErrorMessage, fieldErrorsFromApi } from '../../utils/errorMessages'

const LIMIT_PATTERN = /^\d+(\.\d{1,2})?$/
const MAX_LIMIT = 9999999999.99

export interface BudgetFormModalProps {
  open: boolean
  onClose: () => void
  month: number
  year: number
  budget: Budget | null
  existingCategories: Category[]
  defaultCategory?: Category
}

function validateBudgetForm(category: string, limit: string): Record<string, string> {
  const errors: Record<string, string> = {}
  const trimmedLimit = limit.trim()

  if (!category) {
    errors.category = 'Category is required'
  }

  if (!trimmedLimit) {
    errors.limit = 'Limit is required'
  } else if (!LIMIT_PATTERN.test(trimmedLimit)) {
    errors.limit = 'Enter a valid amount with up to two decimals'
  } else if (Number(trimmedLimit) <= 0) {
    errors.limit = 'Limit must be greater than 0'
  } else if (Number(trimmedLimit) > MAX_LIMIT) {
    errors.limit = 'Limit must be 9999999999.99 or less'
  }

  return errors
}

function stripFieldPrefixes(fields: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).map(
      ([field, message]): [string, string] => [field.replace(/^(body|query)\./, ''), message],
    ),
  )
}

function isBudgetExistsError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  return (error as { code?: unknown }).code === 'BUDGET_EXISTS'
}

export function BudgetFormModal({ open, budget, ...rest }: BudgetFormModalProps) {
  if (!open) {
    return null
  }

  return <BudgetFormDialog key={budget ? budget.id : 'create'} budget={budget} {...rest} />
}

function BudgetFormDialog({
  onClose,
  month,
  year,
  budget,
  existingCategories,
  defaultCategory,
}: Omit<BudgetFormModalProps, 'open'>) {
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()

  const [category, setCategory] = useState(budget ? budget.category : (defaultCategory ?? ''))
  const [limit, setLimit] = useState(budget ? String(budget.limit) : '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState('')

  const pending = createMutation.isPending || updateMutation.isPending

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      const next = { ...current }

      delete next[field]

      return next
    })
  }

  function handleCategoryChange(value: string | null) {
    setCategory(value ?? '')
    clearFieldError('category')
    setBanner('')
  }

  function handleLimitChange(event: ChangeEvent<HTMLInputElement>) {
    setLimit(event.target.value)
    clearFieldError('limit')
    setBanner('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (pending) {
      return
    }

    const errors = validateBudgetForm(category, limit)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setBanner('')
      return
    }

    setFieldErrors({})
    setBanner('')

    const limitValue = Number(limit.trim())

    try {
      if (budget) {
        await updateMutation.mutateAsync({ id: budget.id, data: { limit: limitValue } })
      } else {
        await createMutation.mutateAsync({
          category: category as Category,
          limit: limitValue,
          month,
          year,
        })
      }

      onClose()
    } catch (error) {
      if (isBudgetExistsError(error)) {
        setBanner('A budget for this category already exists this month.')
        return
      }

      const apiFields = fieldErrorsFromApi(error)

      if (apiFields) {
        setFieldErrors(stripFieldPrefixes(apiFields))
        return
      }

      setBanner(apiErrorMessage(error, 'Could not save budget'))
    }
  }

  const availableCategories = CATEGORIES.filter(
    (item) => !existingCategories.some((existing) => existing === item),
  )

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl leading-tight tracking-[var(--tracking-display)]">
            {budget ? 'Edit budget' : 'Add budget'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {budget
              ? 'Update the monthly spending limit for this category.'
              : 'Choose a category and set a monthly spending limit for this month.'}
          </DialogDescription>
        </DialogHeader>

        {banner && <Alert variant="destructive">{banner}</Alert>}

        <form id="budget-form" className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {budget ? (
            <div className="text-sm text-ink-muted">
              <p className="font-medium text-ink">{budget.category}</p>
              <p>{formatMonthYear(month, year)}</p>
            </div>
          ) : (
            <Field>
              <FieldLabel htmlFor="budget-category">
                Category
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>

              <Select name="category" value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger
                  id="budget-category"
                  className="w-full"
                  aria-invalid={Boolean(fieldErrors.category) || undefined}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {availableCategories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldErrors.category && <FieldError>{fieldErrors.category}</FieldError>}
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="budget-limit">
              Limit
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>

            <Input
              id="budget-limit"
              name="limit"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={limit}
              aria-invalid={Boolean(fieldErrors.limit) || undefined}
              onChange={handleLimitChange}
            />

            {fieldErrors.limit && <FieldError>{fieldErrors.limit}</FieldError>}
          </Field>

          {!budget && (
            <p className="text-sm text-ink-muted">
              {formatMonthYear(month, year)}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>

          <Button type="submit" form="budget-form" disabled={pending}>
            {pending && <Spinner />}
            Save budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
