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
const NOW_MONTH = NOW.getUTCMonth() + 1
const NOW_YEAR = NOW.getUTCFullYear()

const NAV_BUTTON_CLASS = 'size-8 rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:opacity-40'

export function MonthPicker({ month, year, onChange }: MonthPickerProps) {
  const atCurrentMonth = year * 12 + month >= NOW_MONTH_INDEX
  const isCurrentMonth = month === NOW_MONTH && year === NOW_YEAR

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
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={NAV_BUTTON_CLASS}
        aria-label="Previous month"
        onClick={handlePrevious}
      >
        <ChevronLeftIcon />
      </Button>

      <span className="relative min-w-40 pb-1 text-center font-display text-lg font-medium tracking-[var(--tracking-display)] text-ink">
        {formatMonthYear(month, year)}

        {isCurrentMonth && (
          <span className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-metal" aria-hidden="true" />
        )}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={NAV_BUTTON_CLASS}
        aria-label="Next month"
        disabled={atCurrentMonth}
        onClick={handleNext}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  )
}
