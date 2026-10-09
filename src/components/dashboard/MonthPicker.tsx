import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMonthYear } from '../../utils/format'

export interface MonthPickerProps {
  month: number
  year: number
  onChange: (month: number, year: number) => void
}

const NOW = new Date()
const NOW_MONTH_INDEX = NOW.getUTCFullYear() * 12 + NOW.getUTCMonth() + 1

export function MonthPicker({ month, year, onChange }: MonthPickerProps) {
  const atCurrentMonth = year * 12 + month >= NOW_MONTH_INDEX

  function handlePrevious() {
    if (month === 1) {
      onChange(12, year - 1)
      return
    }

    onChange(month - 1, year)
  }

  function handleNext() {
    if (atCurrentMonth) {
      return
    }

    if (month === 12) {
      onChange(1, year + 1)
      return
    }

    onChange(month + 1, year)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" aria-label="Previous month" onClick={handlePrevious}>
        <ChevronLeftIcon />
      </Button>

      <span className="min-w-36 text-center font-medium text-foreground tabular-nums">
        {formatMonthYear(month, year)}
      </span>

      <Button
        variant="secondary"
        size="icon"
        aria-label="Next month"
        disabled={atCurrentMonth}
        onClick={handleNext}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  )
}
