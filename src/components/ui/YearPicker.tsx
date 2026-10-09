import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface YearPickerProps {
  year: number
  onChange: (year: number) => void
  min?: number
  max?: number
  className?: string
}

function ChevronIcon({ d }: { d: string }) {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

export function YearPicker({ year, onChange, min = 2000, max = 2100, className }: YearPickerProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Button
        variant="secondary"
        size="sm"
        aria-label="Previous year"
        disabled={year <= min}
        onClick={() => onChange(year - 1)}
      >
        <ChevronIcon d="M15 18l-6-6 6-6" />
      </Button>

      <span className="min-w-20 text-center font-medium tabular-nums text-gray-900 dark:text-gray-100">
        {year}
      </span>

      <Button
        variant="secondary"
        size="sm"
        aria-label="Next year"
        disabled={year >= max}
        onClick={() => onChange(year + 1)}
      >
        <ChevronIcon d="M9 18l6-6-6-6" />
      </Button>
    </div>
  )
}
