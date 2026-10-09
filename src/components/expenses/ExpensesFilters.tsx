import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  sortBy: 'date' | 'amount' | 'createdAt'
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

const SORT_BY_ITEMS: Record<string, string> = {
  date: 'Newest',
  amount: 'Amount',
  createdAt: 'Created',
}

const ORDER_ITEMS: Record<string, string> = {
  desc: 'Newest first',
  asc: 'Oldest first',
}

function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <Button
      type="button"
      variant={selected ? 'default' : 'ghost'}
      size="sm"
      aria-pressed={selected}
      className={cn(
        'rounded-full',
        !selected && 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300',
      )}
      onClick={onClick}
    >
      {label}
    </Button>
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

  function handleSortByChange(next: string | null) {
    if (!next || next === value.sortBy) {
      return
    }

    applyPatch({ sortBy: next as FilterValue['sortBy'] })
  }

  function handleOrderChange(next: string | null) {
    if (!next || next === value.order) {
      return
    }

    applyPatch({ order: next as FilterValue['order'] })
  }

  return (
    <Card className="p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-4">
          <Input
            type="search"
            aria-label="Search expenses"
            placeholder="Search expenses"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-wrap gap-2 md:col-span-4">
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

        <Input
          type="date"
          aria-label="Start date"
          value={value.startDate}
          onChange={handleStartDateChange}
        />

        <Input type="date" aria-label="End date" value={value.endDate} onChange={handleEndDateChange} />

        <Input
          type="number"
          min={0}
          step="0.01"
          aria-label="Minimum amount"
          placeholder="Min ₹"
          value={value.minAmount}
          onChange={handleMinAmountChange}
        />

        <Input
          type="number"
          min={0}
          step="0.01"
          aria-label="Maximum amount"
          placeholder="Max ₹"
          value={value.maxAmount}
          onChange={handleMaxAmountChange}
        />

        <Select value={value.sortBy} items={SORT_BY_ITEMS} onValueChange={handleSortByChange}>
          <SelectTrigger aria-label="Sort by" className="w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="date">Newest</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="createdAt">Created</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={value.order} items={ORDER_ITEMS} onValueChange={handleOrderChange}>
          <SelectTrigger aria-label="Sort order" className="w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex items-center md:col-span-2">
          <Button variant="ghost" onClick={handleClear}>
            Clear filters
          </Button>
        </div>
      </div>
    </Card>
  )
}
