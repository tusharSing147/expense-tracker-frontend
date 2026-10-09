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
import { useCategories } from '../../hooks/useCategories'
import { useCreateExpense, useUpdateExpense } from '../../hooks/useExpenses'
import type { Category, Expense, ExpenseCreate, ExpenseUpdate } from '../../types/expense'
import { CATEGORIES } from '../../types/expense'
import { apiErrorMessage, fieldErrorsFromApi } from '../../utils/errorMessages'
import { cn } from '@/lib/utils'

export interface ExpenseFormModalProps {
  open: boolean
  onClose: () => void
  expense: Expense | null
}

interface ExpenseFormValues {
  title: string
  amount: string
  category: string
  date: string
  description: string
}

function todayPlusOneYear(): string {
  const now = new Date()
  const next = new Date(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), now.getUTCDate()))

  return next.toISOString().slice(0, 10)
}

function validateExpenseForm(values: ExpenseFormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  const title = values.title.trim()

  if (!title) {
    errors.title = 'Title is required'
  } else if (title.length > 120) {
    errors.title = 'Title must be 120 characters or fewer'
  }

  const amount = values.amount.trim()

  if (!amount) {
    errors.amount = 'Amount is required'
  } else if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    errors.amount = 'Enter a valid amount with up to 2 decimal places'
  } else if (Number(amount) <= 0) {
    errors.amount = 'Amount must be greater than 0'
  } else if (Number(amount) > 9999999999.99) {
    errors.amount = 'Amount must be 9,999,999,999.99 or less'
  }

  if (!CATEGORIES.includes(values.category as Category)) {
    errors.category = 'Select a category'
  }

  const date = values.date.trim()

  if (!date) {
    errors.date = 'Date is required'
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = 'Enter a valid date'
  } else {
    const parsed = new Date(`${date}T00:00:00Z`)

    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      errors.date = 'Enter a valid date'
    } else if (date > todayPlusOneYear()) {
      errors.date = 'Date cannot be more than one year in the future'
    }
  }

  if (values.description.trim().length > 500) {
    errors.description = 'Description must be 500 characters or fewer'
  }

  return errors
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

export function ExpenseFormModal({ open, onClose, expense }: ExpenseFormModalProps) {
  if (!open) {
    return null
  }

  return <ExpenseFormDialog key={expense?.id ?? 'create'} onClose={onClose} expense={expense} />
}

interface ExpenseFormDialogProps {
  onClose: () => void
  expense: Expense | null
}

function ExpenseFormDialog({ onClose, expense }: ExpenseFormDialogProps) {
  const categories = useCategories()
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  const [title, setTitle] = useState(expense?.title ?? '')
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [category, setCategory] = useState(expense?.category ?? '')
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState(expense?.description ?? '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState('')

  const pending = expense ? updateMutation.isPending : createMutation.isPending
  const maxDate = todayPlusOneYear()

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      const next = { ...current }

      delete next[field]

      return next
    })
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
    const errors = validateExpenseForm(values)

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

          <Field data-invalid={Boolean(fieldErrors.title)}>
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
              aria-invalid={Boolean(fieldErrors.title)}
              onChange={handleTitleChange}
            />

            <FieldError>{fieldErrors.title}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldErrors.amount)}>
            <FieldLabel htmlFor="expense-amount" className="gap-0.5">
              Amount
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </FieldLabel>

            <Input
              id="expense-amount"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              aria-invalid={Boolean(fieldErrors.amount)}
              onChange={handleAmountChange}
            />

            <FieldError>{fieldErrors.amount}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldErrors.category)}>
            <FieldLabel htmlFor="expense-category" className="gap-0.5">
              Category
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </FieldLabel>

            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger
                id="expense-category"
                aria-invalid={Boolean(fieldErrors.category)}
                className="w-full"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <FieldError>{fieldErrors.category}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldErrors.date)}>
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
              aria-invalid={Boolean(fieldErrors.date)}
              onChange={handleDateChange}
            />

            <FieldError>{fieldErrors.date}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldErrors.description)}>
            <FieldLabel htmlFor="expense-description">Description</FieldLabel>

            <Textarea
              id="expense-description"
              name="description"
              placeholder="Optional note"
              value={description}
              aria-invalid={Boolean(fieldErrors.description)}
              onChange={handleDescriptionChange}
            />

            <div className="text-right">
              <span
                className={cn(
                  'text-xs tabular-nums',
                  description.length > 450 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                )}
              >
                {description.length}/500
              </span>
            </div>

            <FieldError>{fieldErrors.description}</FieldError>
          </Field>
        </form>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>

          <Button type="submit" form="expense-form" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {expense ? 'Save changes' : 'Add expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
