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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCreateExpense, useUpdateExpense } from '../../hooks/useExpenses'
import type { Category, Expense, ExpenseCreate, ExpenseUpdate } from '../../types/expense'
import { CATEGORIES } from '../../types/expense'
import { apiErrorMessage, fieldErrorsFromApi } from '../../utils/errorMessages'
import { formatDateOnly } from '../../utils/format'
import { cn } from '@/lib/utils'

export interface ExpenseFormModalProps {
  open: boolean
  onClose: () => void
  expense: Expense | null
  prefill?: Expense | null
}

type ExpenseField = 'title' | 'amount' | 'category' | 'date' | 'description'

interface ExpenseFormValues {
  title: string
  amount: string
  category: string
  date: string
  description: string
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/
const AMOUNT_DECIMAL_PATTERN = /^\d+(\.\d+)?$/
const MAX_AMOUNT = 9999999999.99
const MAX_TITLE = 120
const MAX_NOTE = 500

function todayPlusOneYear(): string {
  const now = new Date()
  const next = new Date(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), now.getUTCDate()))

  return next.toISOString().slice(0, 10)
}

function validateField(field: ExpenseField, value: string): string | undefined {
  switch (field) {
    case 'title': {
      const title = value.trim()

      if (!title) {
        return 'Title is required.'
      }

      if (title.length > MAX_TITLE) {
        return `Keep the title to ${MAX_TITLE} characters or fewer.`
      }

      return undefined
    }

    case 'amount': {
      const amount = value.trim()

      if (!amount) {
        return 'Amount is required.'
      }

      if (!AMOUNT_PATTERN.test(amount)) {
        return AMOUNT_DECIMAL_PATTERN.test(amount)
          ? 'Use up to two decimal places.'
          : 'Enter an amount using digits only, for example 120.50.'
      }

      if (Number(amount) <= 0) {
        return 'Enter an amount greater than 0.'
      }

      if (Number(amount) > MAX_AMOUNT) {
        return 'Enter an amount of 9,999,999,999.99 or less.'
      }

      return undefined
    }

    case 'category': {
      if (!CATEGORIES.includes(value as Category)) {
        return 'Select a category.'
      }

      return undefined
    }

    case 'date': {
      const date = value.trim()

      if (!date) {
        return 'Date is required.'
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return 'Enter the date as YYYY-MM-DD.'
      }

      const parsed = new Date(`${date}T00:00:00Z`)

      if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
        return 'Enter a valid date.'
      }

      const maxDate = todayPlusOneYear()

      if (date > maxDate) {
        return `Pick a date on or before ${formatDateOnly(maxDate)}.`
      }

      return undefined
    }

    case 'description': {
      if (value.trim().length > MAX_NOTE) {
        return `Keep the note to ${MAX_NOTE} characters or fewer.`
      }

      return undefined
    }
  }
}

function buildCreatePayload(values: ExpenseFormValues): ExpenseCreate {
  const payload: ExpenseCreate = {
    title: values.title.trim(),
    amount: Number(values.amount.trim()),
    category: values.category as Category,
    date: values.date,
  }
  const description = values.description.trim()

  if (description) {
    payload.description = description
  }

  return payload
}

function buildUpdatePayload(expense: Expense, values: ExpenseFormValues): ExpenseUpdate {
  const payload: ExpenseUpdate = {}
  const title = values.title.trim()
  const description = values.description.trim()
  const originalDescription = expense.description ?? ''

  if (title !== expense.title) {
    payload.title = title
  }

  if (Number(values.amount.trim()) !== expense.amount) {
    payload.amount = Number(values.amount.trim())
  }

  if (values.category !== expense.category) {
    payload.category = values.category as Category
  }

  if (values.date !== expense.date) {
    payload.date = values.date
  }

  if (description !== originalDescription) {
    payload.description = description || null
  }

  return payload
}

function stripScopePrefix(fields: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]): [string, string] => [key.replace(/^(body|query)\./, ''), value]),
  )
}

export function ExpenseFormModal({ open, onClose, expense, prefill }: ExpenseFormModalProps) {
  if (!open) {
    return null
  }

  return (
    <ExpenseFormDialog
      key={expense?.id ?? (prefill ? `duplicate-${prefill.id}` : 'create')}
      onClose={onClose}
      expense={expense}
      prefill={prefill}
    />
  )
}

interface ExpenseFormDialogProps {
  onClose: () => void
  expense: Expense | null
  prefill?: Expense | null
}

function ExpenseFormDialog({ onClose, expense, prefill }: ExpenseFormDialogProps) {
  const source = expense ?? prefill ?? null
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  const [title, setTitle] = useState(source?.title ?? '')
  const [amount, setAmount] = useState(source ? String(source.amount) : '')
  const [category, setCategory] = useState(source?.category ?? '')
  const [date, setDate] = useState(source?.date ?? new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState(source?.description ?? '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState('')

  const pending = expense ? updateMutation.isPending : createMutation.isPending
  const maxDate = todayPlusOneYear()

  function clearFieldError(field: ExpenseField) {
    setFieldErrors((current) => {
      const next = { ...current }

      delete next[field]

      return next
    })
  }

  function applyFieldError(field: ExpenseField, error: string | undefined) {
    setFieldErrors((current) => {
      const next = { ...current }

      if (error) {
        next[field] = error
      } else {
        delete next[field]
      }

      return next
    })
  }

  function handleFieldBlur(field: ExpenseField, value: string) {
    applyFieldError(field, validateField(field, value))
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value)
    clearFieldError('title')
    setBanner('')
  }

  function handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value)
    clearFieldError('amount')
    setBanner('')
  }

  function handleCategoryChange(next: string | null) {
    if (next === category) {
      return
    }

    setCategory(next ?? '')
    clearFieldError('category')
    setBanner('')
  }

  function handleDateChange(event: ChangeEvent<HTMLInputElement>) {
    setDate(event.target.value)
    clearFieldError('date')
    setBanner('')
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value)
    clearFieldError('description')
    setBanner('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (pending) {
      return
    }

    const values: ExpenseFormValues = { title, amount, category, date, description }
    const errors: Record<string, string> = {}

    for (const field of ['title', 'amount', 'category', 'date', 'description'] as const) {
      const error = validateField(field, values[field])

      if (error) {
        errors[field] = error
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setBanner('')
      return
    }

    setFieldErrors({})
    setBanner('')

    try {
      if (expense) {
        const payload = buildUpdatePayload(expense, values)

        if (Object.keys(payload).length === 0) {
          onClose()
          return
        }

        await updateMutation.mutateAsync({ id: expense.id, data: payload })
      } else {
        await createMutation.mutateAsync(buildCreatePayload(values))
      }

      onClose()
    } catch (error) {
      const apiFields = fieldErrorsFromApi(error)

      if (apiFields) {
        setFieldErrors(stripScopePrefix(apiFields))
        return
      }

      setBanner(apiErrorMessage(error, 'Unable to save the expense. Please try again.'))
    }
  }

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
          <DialogTitle>{expense ? 'Edit expense' : 'Add expense'}</DialogTitle>
          <DialogDescription className="sr-only">
            {expense ? 'Update the details of this expense.' : 'Add a new expense to your tracker.'}
          </DialogDescription>
        </DialogHeader>

        <form id="expense-form" className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {banner && <Alert variant="destructive">{banner}</Alert>}

          <Field>
            <FieldLabel htmlFor="expense-title" className="gap-0.5">
              Title
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </FieldLabel>

            <Input
              id="expense-title"
              name="title"
              type="text"
              placeholder="e.g. Groceries"
              value={title}
              onChange={handleTitleChange}
              onBlur={(event) => handleFieldBlur('title', event.target.value)}
            />

            {fieldErrors.title && <FieldError>{fieldErrors.title}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="expense-amount" className="gap-0.5">
              Amount
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </FieldLabel>

            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted"
              >
                ₹
              </span>

              <Input
                id="expense-amount"
                name="amount"
                type="text"
                inputMode="decimal"
                className="pl-7"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                onBlur={(event) => handleFieldBlur('amount', event.target.value)}
              />
            </div>

            {fieldErrors.amount && <FieldError>{fieldErrors.amount}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="expense-category" className="gap-0.5">
              Category
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </FieldLabel>

            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger
                id="expense-category"
                className="w-full"
                onBlur={(event) => {
                  const next = event.relatedTarget

                  if (next instanceof Element && next.closest('[data-slot="select-content"]')) {
                    return
                  }

                  handleFieldBlur('category', category)
                }}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {fieldErrors.category && <FieldError>{fieldErrors.category}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="expense-date" className="gap-0.5">
              Date
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </FieldLabel>

            <Input
              id="expense-date"
              name="date"
              type="date"
              max={maxDate}
              value={date}
              onChange={handleDateChange}
              onBlur={(event) => handleFieldBlur('date', event.target.value)}
            />

            {fieldErrors.date && <FieldError>{fieldErrors.date}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="expense-note">Note</FieldLabel>

            <Textarea
              id="expense-note"
              name="description"
              placeholder="Optional note"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={(event) => handleFieldBlur('description', event.target.value)}
            />

            <div className="text-right">
              <span
                className={cn(
                  'text-xs tabular-nums',
                  description.length > 450 ? 'text-caution-ink' : 'text-ink-muted',
                )}
              >
                {description.length}/500
              </span>
            </div>

            {fieldErrors.description && <FieldError>{fieldErrors.description}</FieldError>}
          </Field>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>

          <Button type="submit" form="expense-form" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {expense ? 'Save expense' : 'Add expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
