import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Category } from '../../types/expense'
import { CATEGORIES } from '../../types/expense'
import { cn } from '@/lib/utils'

export interface FilterValue {
  search: string
  category: Category[]
  startDate: string
  endDate: string
  minAmount: string
  maxAmount: string
  sortBy: 'date' | 'amount'
  order: 'asc' | 'desc'
}

export interface ExpensesFiltersProps {
  value: FilterValue
  onChange: (patch: Partial<FilterValue>) => void
  onResetPage: () => void
  onClear: () => void
}

interface ChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

const SORT_ITEMS: Record<string, string> = {
  'date-desc': 'Date, newest first',
  'date-asc': 'Date, oldest first',
  'amount-desc': 'Amount, high to low',
  'amount-asc': 'Amount, low to high',
}

function sortValueOf(value: FilterValue): string {
  return `${value.sortBy}-${value.order}`
}

function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors duration-[var(--duration-fast)]',
        selected
          ? 'border-accent bg-accent-soft text-accent-soft-ink'
          : 'border-transparent bg-surface-sunken text-ink-muted hover:text-ink',
      )}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function ExpensesFilters({ value, onChange, onResetPage, onClear }: ExpensesFiltersProps) {
  const [search, setSearch] = useState(value.search)

  useEffect(() => {
    if (search === value.search) {
      return
    }

    const timer = setTimeout(() => {
      onChange({ search })
      onResetPage()
    }, 300)

    return () => clearTimeout(timer)
  }, [search, value.search, onChange, onResetPage])

  function applyPatch(next: Partial<FilterValue>) {
    onChange(next)
    onResetPage()
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
  }

  function handleToggleCategory(category: Category) {
    const selected = value.category.includes(category)
    const next = selected ? value.category.filter((item) => item !== category) : [...value.category, category]

    applyPatch({ category: next })
  }

  function handleClear() {
    setSearch('')
    onClear()
  }

  function handleStartDateChange(event: ChangeEvent<HTMLInputElement>) {
    applyPatch({ startDate: event.target.value })
  }

  function handleEndDateChange(event: ChangeEvent<HTMLInputElement>) {
    applyPatch({ endDate: event.target.value })
  }

  function handleMinAmountChange(event: ChangeEvent<HTMLInputElement>) {
    applyPatch({ minAmount: event.target.value })
  }

  function handleMaxAmountChange(event: ChangeEvent<HTMLInputElement>) {
    applyPatch({ maxAmount: event.target.value })
  }

  function handleSortChange(next: string | null) {
    if (!next || next === sortValueOf(value)) {
      return
    }

    const [sortBy, order] = next.split('-')

    applyPatch({ sortBy: sortBy as FilterValue['sortBy'], order: order as FilterValue['order'] })
  }

  return (
    <section className="flex flex-col gap-[var(--space-4)] rounded-md border border-line bg-surface p-[var(--space-5)] elevation-1">
      <Field>
        <FieldLabel htmlFor="expenses-search">Search</FieldLabel>

        <div className="relative">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
          />

          <Input
            id="expenses-search"
            type="search"
            className="pl-9"
            placeholder="Search by title or note"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </Field>

      <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
        <Chip label="All" selected={value.category.length === 0} onClick={() => applyPatch({ category: [] })} />

        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={category}
            selected={value.category.includes(category)}
            onClick={() => handleToggleCategory(category)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-[calc(50%-0.375rem)] sm:w-[168px]">
          <FieldLabel htmlFor="expenses-start-date">From date</FieldLabel>

          <Input
            id="expenses-start-date"
            type="date"
            value={value.startDate}
            onChange={handleStartDateChange}
          />
        </Field>

        <Field className="w-[calc(50%-0.375rem)] sm:w-[168px]">
          <FieldLabel htmlFor="expenses-end-date">To date</FieldLabel>

          <Input id="expenses-end-date" type="date" value={value.endDate} onChange={handleEndDateChange} />
        </Field>

        <Field className="w-[calc(50%-0.375rem)] sm:w-[168px]">
          <FieldLabel htmlFor="expenses-min-amount">Min amount</FieldLabel>

          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted"
            >
              ₹
            </span>

            <Input
              id="expenses-min-amount"
              type="text"
              inputMode="decimal"
              className="pl-7"
              placeholder="0.00"
              value={value.minAmount}
              onChange={handleMinAmountChange}
            />
          </div>
        </Field>

        <Field className="w-[calc(50%-0.375rem)] sm:w-[168px]">
          <FieldLabel htmlFor="expenses-max-amount">Max amount</FieldLabel>

          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted"
            >
              ₹
            </span>

            <Input
              id="expenses-max-amount"
              type="text"
              inputMode="decimal"
              className="pl-7"
              placeholder="0.00"
              value={value.maxAmount}
              onChange={handleMaxAmountChange}
            />
          </div>
        </Field>

        <Field className="w-full sm:w-[240px]">
          <FieldLabel htmlFor="expenses-sort">Sort by</FieldLabel>

          <Select value={sortValueOf(value)} items={SORT_ITEMS} onValueChange={handleSortChange}>
            <SelectTrigger id="expenses-sort" className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value="date-desc">Date, newest first</SelectItem>
                <SelectItem value="date-asc">Date, oldest first</SelectItem>
                <SelectItem value="amount-desc">Amount, high to low</SelectItem>
                <SelectItem value="amount-asc">Amount, low to high</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <div className="ml-auto">
          <Button type="button" variant="ghost" className="text-sm" onClick={handleClear}>
            Clear filters
          </Button>
        </div>
      </div>
    </section>
  )
}
