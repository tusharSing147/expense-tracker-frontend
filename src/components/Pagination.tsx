import {
  Pagination as PaginationNav,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageToken = number | 'ellipsis'

const MAX_PAGE_BUTTONS = 5

function buildPageTokens(page: number, totalPages: number): PageToken[] {
  if (totalPages <= MAX_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (page <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages]
  }

  if (page >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages]
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const current = Math.min(Math.max(page, 1), totalPages)
  const atStart = current <= 1
  const atEnd = current >= totalPages
  const tokens = buildPageTokens(current, totalPages)

  function handlePageChange(next: number) {
    if (next < 1 || next > totalPages || next === current) {
      return
    }

    onPageChange(next)
  }

  return (
    <PaginationNav className="mt-[var(--space-5)]">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={atStart || undefined}
            className="h-8 px-3 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-40"
            onClick={atStart ? undefined : () => handlePageChange(current - 1)}
          />
        </PaginationItem>

        {tokens.map((token, index) => {
          if (token === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${index}`} className="hidden sm:block">
                <PaginationEllipsis className="px-1 text-ink-muted" />
              </PaginationItem>
            )
          }

          const isActive = token === current
          const isFar = !isActive && Math.abs(token - current) > 1 && totalPages > MAX_PAGE_BUTTONS

          return (
            <PaginationItem key={token} className={cn(isFar && 'hidden sm:block')}>
              <PaginationLink
                isActive={isActive}
                aria-label={`Page ${token}`}
                size="sm"
                className="min-w-8 px-2 text-sm font-medium"
                onClick={() => handlePageChange(token)}
              >
                {token}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            aria-disabled={atEnd || undefined}
            className="h-8 px-3 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-40"
            onClick={atEnd ? undefined : () => handlePageChange(current + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationNav>
  )
}
